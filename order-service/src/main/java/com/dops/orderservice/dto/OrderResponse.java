package com.dops.orderservice.dto;

import com.dops.orderservice.model.OrderStatus;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@Builder
public class OrderResponse {

    private UUID orderId;
    private UUID productId;
    private BigDecimal amount;
    private Integer quantity;
    private OrderStatus orderStatus;
}
