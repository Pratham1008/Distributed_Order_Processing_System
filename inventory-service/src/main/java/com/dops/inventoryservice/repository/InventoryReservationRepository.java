package com.dops.inventoryservice.repository;

import com.dops.inventoryservice.model.InventoryReservation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface InventoryReservationRepository extends JpaRepository<InventoryReservation, UUID> {

    Optional<InventoryReservation> findByOrderId(UUID orderId);
}
