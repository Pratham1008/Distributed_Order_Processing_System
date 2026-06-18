package com.dops.common.event;

import lombok.Builder;
import java.util.UUID;

@Builder
public record PaymentCompleted(UUID orderId) {
}
