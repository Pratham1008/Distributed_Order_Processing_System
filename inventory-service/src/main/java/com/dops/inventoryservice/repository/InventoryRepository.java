package com.dops.inventoryservice.repository;

import com.dops.inventoryservice.model.Inventory;
import com.dops.inventoryservice.model.Product;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;

import java.util.Optional;
import java.util.UUID;

public interface InventoryRepository extends JpaRepository<Inventory, UUID> {

    Inventory findByProduct(Product product);

    Inventory findBySku(String sku);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    Optional<Inventory> findByProductProductId(UUID productId);

    Optional<Inventory> readByProductProductId(UUID productId);
}
