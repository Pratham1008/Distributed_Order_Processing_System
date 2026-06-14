package com.dops.orderservice.kafka;

import com.dops.common.event.PaymentCompleted;
import com.dops.common.event.PaymentFailed;
import com.dops.common.event.SagaTopics;
import com.dops.orderservice.model.OrderStatus;
import com.dops.orderservice.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class PaymentEventConsumer {

    private final OrderService orderService;

    @KafkaListener(
            topics = SagaTopics.PAYMENT_COMPLETED,
            groupId = "order-group"
    )
    public void paymentCompleted(PaymentCompleted event) {
        orderService.updateStatus(event.orderId(), OrderStatus.COMPLETED);
    }

    @KafkaListener(
            topics = SagaTopics.PAYMENT_FAILED,
            groupId = "order-group"
    )
    public void paymentFailed(PaymentFailed event) {

        orderService.updateStatus(event.orderId(), OrderStatus.FAILED);
    }
}
