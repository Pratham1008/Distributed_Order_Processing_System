package com.dops.common.event;

import java.util.UUID;

public record PaymentCompleted(UUID orderId) {
}
