package com.dops.inventoryservice.kafka;

import com.dops.common.event.InventoryFailed;
import com.dops.common.event.InventoryReserved;
import com.dops.common.event.SagaTopics;
import lombok.RequiredArgsConstructor;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class InventoryEventProducer {

    private final KafkaTemplate<String, Object> kafkaTemplate;

    public void publishInventoryReserved(InventoryReserved event) {
        kafkaTemplate.send(SagaTopics.INVENTORY_RESERVED, event);
    }

    public void publishInventoryFailed(InventoryFailed event) {
        kafkaTemplate.send(SagaTopics.INVENTORY_FAILED, event);
    }
}
