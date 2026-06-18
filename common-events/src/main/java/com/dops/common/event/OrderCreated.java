package com.dops.common.event;

import lombok.Builder;
import java.math.BigDecimal;
import java.util.UUID;

@Builder
public record OrderCreated(UUID orderId, UUID productId, Integer quantity, BigDecimal amount) {
}
