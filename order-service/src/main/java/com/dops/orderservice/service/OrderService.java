package com.dops.orderservice.service;

import com.dops.orderservice.dto.OrderRequest;
import com.dops.orderservice.dto.OrderResponse;
import com.dops.orderservice.dto.ProductResponse;
import com.dops.common.event.OrderCreated;
import com.dops.orderservice.kafka.OrderEventProducer;
import com.dops.orderservice.model.Order;
import com.dops.orderservice.model.OrderStatus;
import com.dops.orderservice.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;

@Service
@RequiredArgsConstructor
@Slf4j
public class OrderService {

    private final OrderRepository orderRepository;
    private final OrderEventProducer orderEventProducer;
    private final RestTemplate restTemplate;

    @Value("${inventory.service.url:http://localhost:8082}")
    private String inventoryServiceUrl;

    @Transactional
    public OrderResponse createOrder(OrderRequest orderDTO) {
        log.info("Creating order for productId: {}, quantity: {}", orderDTO.getProductId(), orderDTO.getQuantity());
        String inventoryUrl = inventoryServiceUrl + "/products/" + orderDTO.getProductId();
        ProductResponse product = restTemplate.getForObject(inventoryUrl, ProductResponse.class);

        if (product == null) {
            log.error("Product not found: {}", orderDTO.getProductId());
            throw new IllegalArgumentException("Product not found");
        }

        BigDecimal calculatedAmount = product.getPrice().multiply(BigDecimal.valueOf(orderDTO.getQuantity()));

        Order order = Order.builder()
                .productId(orderDTO.getProductId())
                .amount(calculatedAmount)
                .quantity(orderDTO.getQuantity())
                .status(OrderStatus.PENDING)
                .createdAt(Instant.now())
                .build();

        Order savedOrder = orderRepository.save(order);

        OrderCreated orderCreated = OrderCreated.builder()
                        .orderId(savedOrder.getOrderId())
                        .productId(savedOrder.getProductId())
                        .quantity(savedOrder.getQuantity())
                        .amount(savedOrder.getAmount()).build();

        orderEventProducer.publishOrderCreated(orderCreated);
        log.info("Order created successfully with ID: {}", savedOrder.getOrderId());

        return toResponse(savedOrder);
    }

    @Transactional
    public void updateStatus(UUID orderId, OrderStatus orderStatus) {
        log.info("Updating order {} to status {}", orderId, orderStatus);
        Order order = orderRepository.findById(orderId).orElseThrow(() -> new IllegalArgumentException("Order not found"));
        order.setStatus(orderStatus);
        orderRepository.save(order);
    }

    @Transactional
    public void cancelOrder(UUID orderId) {
        updateStatus(orderId, OrderStatus.CANCELLED);
    }

    @Transactional(readOnly = true)
    public OrderResponse getOrderById(UUID orderId) {
        Order order = orderRepository.findById(orderId).orElseThrow(() -> new IllegalArgumentException("Order not found"));
        return toResponse(order);
    }

    @Transactional(readOnly = true)
    public Page<OrderResponse> getAllOrders(Pageable pageable) {
        return orderRepository.findAll(pageable)
                .map(this::toResponse);
    }

    private OrderResponse toResponse(Order order) {
        return OrderResponse.builder()
                .orderId(order.getOrderId())
                .orderStatus(order.getStatus())
                .amount(order.getAmount())
                .quantity(order.getQuantity())
                .productId(order.getProductId())
                .build();
    }
}
