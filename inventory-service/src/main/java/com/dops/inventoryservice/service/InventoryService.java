package com.dops.inventoryservice.service;

import com.dops.inventoryservice.dto.ProductRequest;
import com.dops.inventoryservice.dto.ProductResponse;
import com.dops.common.event.InventoryFailed;
import com.dops.common.event.InventoryReserved;
import com.dops.common.event.OrderCreated;
import com.dops.inventoryservice.kafka.InventoryEventProducer;
import com.dops.inventoryservice.model.Inventory;
import com.dops.inventoryservice.model.InventoryReservation;
import com.dops.inventoryservice.model.Product;
import com.dops.inventoryservice.repository.InventoryRepository;
import com.dops.inventoryservice.repository.InventoryReservationRepository;
import com.dops.inventoryservice.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class InventoryService {

    private final ProductRepository productRepository;
    private final InventoryRepository inventoryRepository;
    private final InventoryReservationRepository inventoryReservationRepository;
    private final InventoryEventProducer inventoryEventProducer;

    @Transactional
    public ProductResponse createProduct(ProductRequest request) {
        Product prod = Product.builder()
                .productName(request.productName())
                .description(request.description())
                .price(request.price())
                .build();

        Product product = productRepository.save(prod);

        Inventory inventory = Inventory.builder()
                .sku(request.sku())
                .product(product)
                .availableQuantity(request.stock())
                .build();

        inventoryRepository.save(inventory);

        return ProductResponse.builder()
                .productId(product.getProductId())
                .sku(inventory.getSku())
                .productName(product.getProductName())
                .description(product.getDescription())
                .price(product.getPrice())
                .availableQuantity(inventory.getAvailableQuantity())
                .build();
    }

    @Transactional(readOnly = true)
    public List<ProductResponse> getAllProducts() {
        return inventoryRepository.findAll().stream()
                .map(inventory -> ProductResponse.builder()
                        .productId(inventory.getProduct().getProductId())
                        .sku(inventory.getSku())
                        .productName(inventory.getProduct().getProductName())
                        .description(inventory.getProduct().getDescription())
                        .price(inventory.getProduct().getPrice())
                        .availableQuantity(inventory.getAvailableQuantity())
                        .build())
                .toList();
    }

    @Transactional(readOnly = true)
    public ProductResponse getProductById(UUID productId) {
        return inventoryRepository.readByProductProductId(productId)
                .map(inventory -> ProductResponse.builder()
                        .productId(inventory.getProduct().getProductId())
                        .sku(inventory.getSku())
                        .productName(inventory.getProduct().getProductName())
                        .description(inventory.getProduct().getDescription())
                        .price(inventory.getProduct().getPrice())
                        .availableQuantity(inventory.getAvailableQuantity())
                        .build())
                .orElseThrow(() -> new IllegalArgumentException("Product not found"));
    }

    @Transactional
    public void reserveInventory(OrderCreated event) {
        if (inventoryReservationRepository.findByOrderId(event.orderId()).isPresent()) {
            publishReserved(event);
            return;
        }

        Inventory inventory = inventoryRepository.findByProductProductId(event.productId())
                .orElse(null);

        if (inventory == null) {
            publishFailed(event, "Product inventory not found");
            return;
        }

        if (inventory.getAvailableQuantity() < event.quantity()) {
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
        inventoryReservationRepository.findByOrderId(orderId)
                .ifPresent(reservation -> {
                    Inventory inventory = reservation.getInventory();
                    inventory.setAvailableQuantity(inventory.getAvailableQuantity() + reservation.getQuantity());
                    inventoryRepository.save(inventory);
                    inventoryReservationRepository.delete(reservation);
                });
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
