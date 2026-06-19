package com.dops.inventoryservice.model;

import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(indexes = {
        @Index(name = "idx_reservation_order_id", columnList = "orderId", unique = true)
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InventoryReservation {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID reservationId;

    @Column(nullable = false, unique = true)
    private UUID orderId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "inventoryId", nullable = false)
    private Inventory inventory;

    @Column(nullable = false)
    private Integer quantity;
}
