package com.dops.paymentservice.service;

import com.dops.common.event.InventoryReserved;
import com.dops.common.event.PaymentCompleted;
import com.dops.common.event.PaymentFailed;
import com.dops.paymentservice.dto.PaymentResponse;
import com.dops.paymentservice.kafka.PaymentEventProducer;
import com.dops.paymentservice.model.Payment;
import com.dops.paymentservice.model.PaymentStatus;
import com.dops.paymentservice.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final PaymentEventProducer paymentEventProducer;

    @Transactional
    public void processPayment(InventoryReserved event) {
        log.info("Processing payment for order: {}, amount: {}", event.orderId(), event.amount());
        paymentRepository.findByOrderId(event.orderId())
                .ifPresentOrElse(
                        this::publishExistingPaymentResult,
                        () -> createPayment(event)
                );
    }

    private void createPayment(InventoryReserved event) {
        if (event.amount() == null || event.amount().compareTo(BigDecimal.ZERO) <= 0) {
            log.error("Invalid payment amount for order: {}", event.orderId());
            Payment payment = savePayment(event, PaymentStatus.FAILED, "Invalid payment amount");
            paymentEventProducer.publishPaymentFailed(new PaymentFailed(payment.getOrderId()));
            return;
        }

        try {
            Payment payment = Payment.builder()
                    .orderId(event.orderId())
                    .amount(event.amount())
                    .currency("INR")
                    .status(PaymentStatus.PENDING)
                    .createdAt(Instant.now())
                    .build();
            paymentRepository.save(payment);
            log.info("Payment created with PENDING status for order: {}", event.orderId());
        } catch (Exception exception) {
            log.error("Error creating payment for order: {}", event.orderId(), exception);
            Payment payment = savePayment(event, PaymentStatus.FAILED, exception.getMessage());
            paymentEventProducer.publishPaymentFailed(new PaymentFailed(payment.getOrderId()));
        }
    }

    @Transactional
    public void processPendingPayment(UUID orderId, boolean success) {
        log.info("Manually processing payment for order: {}, success: {}", orderId, success);
        Payment payment = paymentRepository.findByOrderId(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Payment not found for order: " + orderId));

        if (payment.getStatus() != PaymentStatus.PENDING) {
            throw new IllegalStateException("Payment is not in PENDING state");
        }

        if (success) {
            payment.setStatus(PaymentStatus.COMPLETED);
            paymentRepository.save(payment);
            paymentEventProducer.publishPaymentCompleted(new PaymentCompleted(orderId));
        } else {
            payment.setStatus(PaymentStatus.FAILED);
            payment.setFailureReason("User manually failed payment");
            paymentRepository.save(payment);
            paymentEventProducer.publishPaymentFailed(new PaymentFailed(orderId));
        }
    }

    private Payment savePayment(InventoryReserved event, PaymentStatus status, String failureReason) {
        Payment payment = Payment.builder()
                .orderId(event.orderId())
                .amount(event.amount())
                .currency("INR")
                .status(status)
                .failureReason(failureReason)
                .createdAt(Instant.now())
                .build();

        return paymentRepository.save(payment);
    }

    private void publishExistingPaymentResult(Payment payment) {
        if (payment.getStatus() == PaymentStatus.COMPLETED) {
            paymentEventProducer.publishPaymentCompleted(new PaymentCompleted(payment.getOrderId()));
        } else if (payment.getStatus() == PaymentStatus.FAILED) {
            paymentEventProducer.publishPaymentFailed(new PaymentFailed(payment.getOrderId()));
        }
    }

    @Transactional(readOnly = true)
    public PaymentResponse getPaymentByOrderId(UUID orderId) {
        return paymentRepository.findByOrderId(orderId)
                .map(this::toResponse)
                .orElseThrow(() -> new IllegalArgumentException("Payment not found for order: " + orderId));
    }

    @Transactional(readOnly = true)
    public Page<PaymentResponse> getAllPayments(Pageable pageable) {
        return paymentRepository.findAll(pageable).map(this::toResponse);
    }

    private PaymentResponse toResponse(Payment payment) {
        return new PaymentResponse(
                payment.getPaymentId(),
                payment.getOrderId(),
                payment.getAmount(),
                payment.getCurrency(),
                payment.getStatus(),
                payment.getFailureReason()
        );
    }
}
