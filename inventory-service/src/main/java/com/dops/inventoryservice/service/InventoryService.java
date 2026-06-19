package com.dops.inventoryservice.service;

import com.dops.common.event.InventoryFailed;
import com.dops.common.event.InventoryReserved;
import com.dops.common.event.OrderCreated;
import com.dops.inventoryservice.dto.ProductRequest;
import com.dops.inventoryservice.dto.ProductResponse;
import com.dops.inventoryservice.kafka.InventoryEventProducer;
import com.dops.inventoryservice.model.Inventory;
import com.dops.inventoryservice.model.InventoryReservation;
import com.dops.inventoryservice.model.Product;
import com.dops.inventoryservice.repository.InventoryRepository;
import com.dops.inventoryservice.repository.InventoryReservationRepository;
import com.dops.inventoryservice.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class InventoryService {

    private final ProductRepository productRepository;
    private final InventoryRepository inventoryRepository;
    private final InventoryReservationRepository inventoryReservationRepository;
    private final InventoryEventProducer inventoryEventProducer;

    @Value("${app.image.base-url:http://localhost:8082/uploads/}")
    private String imageBaseUrl;

    @Transactional
    public ProductResponse createProduct(ProductRequest request, MultipartFile image) {
        log.info("Creating product with SKU: {}", request.sku());
        String imageUrl = storeImage(image);

        Product prod = Product.builder()
                .productName(request.productName())
                .description(request.description())
                .price(request.price())
                .imageUrl(imageUrl)
                .build();

        Product product = productRepository.save(prod);

        Inventory inventory = Inventory.builder()
                .sku(request.sku())
                .product(product)
                .availableQuantity(request.stock())
                .build();

        inventoryRepository.save(inventory);

        return toResponse(inventory);
    }

    @Transactional(readOnly = true)
    public Page<ProductResponse> getAllProducts(Pageable pageable) {
        return inventoryRepository.findAll(pageable)
                .map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public ProductResponse getProductById(UUID productId) {
        return inventoryRepository.readByProductProductId(productId)
                .map(this::toResponse)
                .orElseThrow(() -> new IllegalArgumentException("Product not found"));
    }

    @Transactional
    public void reserveInventory(OrderCreated event) {
        log.info("Reserving inventory for order: {}", event.orderId());
        if (inventoryReservationRepository.findByOrderId(event.orderId()).isPresent()) {
            log.info("Inventory reservation already exists for order: {}", event.orderId());
            publishReserved(event);
            return;
        }

        Inventory inventory = inventoryRepository.findByProductProductId(event.productId()).orElse(null);
        if (inventory == null) {
            log.warn("Product inventory not found: {}", event.productId());
            publishFailed(event, "Product inventory not found");
            return;
        }
        if (inventory.getAvailableQuantity() < event.quantity()) {
            log.warn("Insufficient inventory for product: {}. Available: {}, Requested: {}", event.productId(), inventory.getAvailableQuantity(), event.quantity());
            publishFailed(event, "Insufficient inventory");
            return;
        }

        inventory.setAvailableQuantity(inventory.getAvailableQuantity() - event.quantity());
        inventoryRepository.save(inventory);

        InventoryReservation reservation = InventoryReservation.builder()
                .orderId(event.orderId())
                .inventory(inventory)
                .quantity(event.quantity())
                .build();
        inventoryReservationRepository.save(reservation);

        publishReserved(event);
    }

    @Transactional
    public void releaseReservedInventory(UUID orderId) {
        log.info("Releasing reserved inventory for order: {}", orderId);
        inventoryReservationRepository.findByOrderId(orderId)
                .ifPresent(reservation -> {
                    Inventory inventory = reservation.getInventory();
                    inventory.setAvailableQuantity(inventory.getAvailableQuantity() + reservation.getQuantity());
                    inventoryRepository.save(inventory);
                    inventoryReservationRepository.delete(reservation);
                });
    }

    private String storeImage(MultipartFile image) {
        if (image == null || image.isEmpty()) {
            return null;
        }
        try {
            Path uploadPath = Paths.get("uploads");
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }
            String filename = UUID.randomUUID() + "_" + image.getOriginalFilename();
            Path filePath = uploadPath.resolve(filename);
            Files.copy(image.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
            return imageBaseUrl + filename;
        } catch (IOException e) {
            log.error("Failed to store image", e);
            throw new RuntimeException("Failed to store image", e);
        }
    }

    private ProductResponse toResponse(Inventory inventory) {
        return ProductResponse.builder()
                .productId(inventory.getProduct().getProductId())
                .sku(inventory.getSku())
                .productName(inventory.getProduct().getProductName())
                .description(inventory.getProduct().getDescription())
                .price(inventory.getProduct().getPrice())
                .availableQuantity(inventory.getAvailableQuantity())
                .imageUrl(inventory.getProduct().getImageUrl())
                .build();
    }

    private void publishReserved(OrderCreated event) {
        inventoryEventProducer.publishInventoryReserved(InventoryReserved.builder()
                .orderId(event.orderId())
                .productId(event.productId())
                .quantity(event.quantity())
                .amount(event.amount())
                .build());
    }

    private void publishFailed(OrderCreated event, String reason) {
        inventoryEventProducer.publishInventoryFailed(InventoryFailed.builder()
                .orderId(event.orderId())
                .productId(event.productId())
                .reason(reason)
                .build());
    }
}
