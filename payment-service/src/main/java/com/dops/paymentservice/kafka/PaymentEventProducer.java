package com.dops.paymentservice.kafka;

import com.dops.common.event.PaymentCompleted;
import com.dops.common.event.PaymentFailed;
import com.dops.common.event.SagaTopics;
import lombok.RequiredArgsConstructor;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class PaymentEventProducer {

    private final KafkaTemplate<String, Object> kafkaTemplate;

    public void publishPaymentCompleted(PaymentCompleted event) {
        kafkaTemplate.send(SagaTopics.PAYMENT_COMPLETED, event);
    }

    public void publishPaymentFailed(PaymentFailed event) {
        kafkaTemplate.send(SagaTopics.PAYMENT_FAILED, event);
    }
}
