package com.dops.paymentservice.kafka;

import com.dops.common.event.InventoryReserved;
import com.dops.common.event.SagaTopics;
import com.dops.paymentservice.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class InventoryEventConsumer {

    private final PaymentService paymentService;

    @KafkaListener(
            topics = SagaTopics.INVENTORY_RESERVED,
            groupId = "payment-group"
    )
    public void inventoryReserved(InventoryReserved event) {
        paymentService.processPayment(event);
    }
}
