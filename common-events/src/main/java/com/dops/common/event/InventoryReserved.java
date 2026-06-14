package com.dops.common.event;

import lombok.Builder;

import java.util.UUID;

@Builder
public record InventoryReserved(UUID orderId, UUID productId, Integer quantity, Double amount) {
}
