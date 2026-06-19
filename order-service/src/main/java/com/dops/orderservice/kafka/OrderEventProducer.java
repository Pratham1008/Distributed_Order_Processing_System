package com.dops.orderservice.kafka;

import com.dops.common.event.OrderCreated;
import com.dops.common.event.SagaTopics;
import lombok.RequiredArgsConstructor;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class OrderEventProducer {

    private final KafkaTemplate<String, Object> kafkaTemplate;

    public void publishOrderCreated(OrderCreated event) {
        kafkaTemplate.send(
                SagaTopics.ORDER_CREATED,
                event
        );
    }
}
