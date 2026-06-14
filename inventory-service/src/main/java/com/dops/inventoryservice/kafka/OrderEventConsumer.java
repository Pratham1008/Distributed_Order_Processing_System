package com.dops.inventoryservice.kafka;

import com.dops.common.event.OrderCreated;
import com.dops.common.event.SagaTopics;
import com.dops.inventoryservice.service.InventoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class OrderEventConsumer {

    private final InventoryService inventoryService;

    @KafkaListener(
            topics = SagaTopics.ORDER_CREATED,
            groupId = "inventory-group"
    )
    public void orderCreated(OrderCreated event) {
        inventoryService.reserveInventory(event);
    }
}
