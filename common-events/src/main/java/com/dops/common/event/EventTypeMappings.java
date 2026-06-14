package com.dops.common.event;

public final class EventTypeMappings {

    public static final String ORDER_CREATED = "orderCreated:com.dops.common.event.OrderCreated";
    public static final String INVENTORY_RESERVED = "inventoryReserved:com.dops.common.event.InventoryReserved";
    public static final String INVENTORY_FAILED = "inventoryFailed:com.dops.common.event.InventoryFailed";
    public static final String PAYMENT_COMPLETED = "paymentCompleted:com.dops.common.event.PaymentCompleted";
    public static final String PAYMENT_FAILED = "paymentFailed:com.dops.common.event.PaymentFailed";

    private EventTypeMappings() {
    }

    public static String join(String... mappings) {
        return String.join(",", mappings);
    }
}
