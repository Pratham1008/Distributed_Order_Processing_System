package com.dops.orderservice.kafka;

import com.dops.common.event.InventoryFailed;
import com.dops.common.event.SagaTopics;
import com.dops.orderservice.model.OrderStatus;
import com.dops.orderservice.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class InventoryEventConsumer {

    private final OrderService orderService;

    @KafkaListener(
            topics = SagaTopics.INVENTORY_FAILED,
            groupId = "order-group"
    )
    public void inventoryFailed(InventoryFailed event) {
        orderService.updateStatus(event.orderId(), OrderStatus.FAILED);
    }
}
