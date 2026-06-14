package com.dops.common.event;

import lombok.Builder;

import java.util.UUID;

@Builder
public record InventoryFailed(UUID orderId, UUID productId, String reason) {
}
