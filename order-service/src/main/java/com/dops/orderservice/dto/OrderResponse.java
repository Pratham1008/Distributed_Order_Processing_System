package com.dops.orderservice.dto;

import com.dops.orderservice.model.OrderStatus;
import lombok.Builder;
import lombok.Data;

import java.util.UUID;

@Data
@Builder
public class OrderResponse {

    private UUID orderId;
    private UUID productId;
    private Double amount;
    private Integer quantity;
    private OrderStatus orderStatus;
}
