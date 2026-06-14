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
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final PaymentEventProducer paymentEventProducer;

    @Transactional
    public void processPayment(InventoryReserved event) {
        paymentRepository.findByOrderId(event.orderId())
                .ifPresentOrElse(
                        this::publishExistingPaymentResult,
                        () -> createPayment(event)
                );
    }

    private void createPayment(InventoryReserved event) {
        if (event.amount() == null || event.amount() <= 0) {
            Payment payment = savePayment(event, PaymentStatus.FAILED, "Invalid payment amount");
            paymentEventProducer.publishPaymentFailed(new PaymentFailed(payment.getOrderId()));
            return;
        }

        try {
            Payment payment = Payment.builder()
                    .orderId(event.orderId())
                    .amount(event.amount())
                    .currency("INR")
                    .status(PaymentStatus.COMPLETED)
                    .createdAt(Instant.now())
                    .build();
            paymentRepository.save(payment);
            
            paymentEventProducer.publishPaymentCompleted(new PaymentCompleted(payment.getOrderId()));
        } catch (Exception exception) {
            Payment payment = savePayment(event, PaymentStatus.FAILED, exception.getMessage());
            paymentEventProducer.publishPaymentFailed(new PaymentFailed(payment.getOrderId()));
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
    public List<PaymentResponse> getAllPayments() {
        return paymentRepository.findAll().stream()
                .map(this::toResponse)
                .toList();
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
