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
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class OrderService {

    private final OrderRepository orderRepository;
    private final OrderEventProducer orderEventProducer;
    private final RestTemplate restTemplate;

    public OrderResponse createOrder(OrderRequest orderDTO) {
        String inventoryUrl = "http://localhost:8082/products/" + orderDTO.getProductId();
        ProductResponse product = restTemplate.getForObject(inventoryUrl, ProductResponse.class);

        if (product == null) {
            throw new IllegalArgumentException("Product not found");
        }

        Double calculatedAmount = product.getPrice() * orderDTO.getQuantity();

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

        return OrderResponse.builder()
                .orderId(savedOrder.getOrderId())
                .orderStatus(savedOrder.getStatus())
                .amount(savedOrder.getAmount())
                .quantity(savedOrder.getQuantity())
                .productId(savedOrder.getProductId())
                .build();

    }

    public void updateStatus(UUID orderId, OrderStatus orderStatus) {
        Order order = orderRepository.findById(orderId).orElseThrow(() -> new IllegalArgumentException("Order not found"));
        order.setStatus(orderStatus);
        orderRepository.save(order);
    }

    public void cancelOrder(UUID orderId) {
        updateStatus(orderId, OrderStatus.CANCELLED);
    }

    public OrderResponse getOrderById(UUID orderId) {
        Order order = orderRepository.findById(orderId).orElseThrow(() -> new IllegalArgumentException("Order not found"));
        return OrderResponse.builder()
                .orderId(order.getOrderId())
                .orderStatus(order.getStatus())
                .amount(order.getAmount())
                .quantity(order.getQuantity())
                .productId(order.getProductId())
                .build();
    }

    public List<OrderResponse> getAllOrders() {
        return orderRepository.findAll().stream()
                .map(order -> OrderResponse.builder()
                        .orderId(order.getOrderId())
                        .orderStatus(order.getStatus())
                        .amount(order.getAmount())
                        .quantity(order.getQuantity())
                        .productId(order.getProductId())
                        .build()).toList();
    }
}
