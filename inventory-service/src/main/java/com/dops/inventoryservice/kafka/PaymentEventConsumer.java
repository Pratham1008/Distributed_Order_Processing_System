package com.dops.inventoryservice.kafka;

import com.dops.common.event.PaymentFailed;
import com.dops.common.event.SagaTopics;
import com.dops.inventoryservice.service.InventoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class PaymentEventConsumer {

    private final InventoryService inventoryService;

    @KafkaListener(
            topics = SagaTopics.PAYMENT_FAILED,
            groupId = "inventory-group"
    )
    public void paymentFailed(PaymentFailed event) {
        inventoryService.releaseReservedInventory(event.orderId());
    }
}
