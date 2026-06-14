package com.dops.common.event;

import java.util.UUID;

public record PaymentFailed(UUID orderId) {
}
