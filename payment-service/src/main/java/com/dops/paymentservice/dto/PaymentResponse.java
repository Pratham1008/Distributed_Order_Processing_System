package com.dops.paymentservice.dto;

import com.dops.paymentservice.model.PaymentStatus;

import java.util.UUID;

public record PaymentResponse(
        UUID paymentId,
        UUID orderId,
        Double amount,
        String currency,
        PaymentStatus status,
        String failureReason
) {
}
