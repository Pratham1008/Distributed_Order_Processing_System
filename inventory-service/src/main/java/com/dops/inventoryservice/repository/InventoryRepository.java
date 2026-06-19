package com.dops.inventoryservice.repository;

import com.dops.inventoryservice.model.Inventory;
import com.dops.inventoryservice.model.Product;
import jakarta.persistence.LockModeType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;

import java.util.Optional;
import java.util.UUID;

public interface InventoryRepository extends JpaRepository<Inventory, UUID> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    Optional<Inventory> findByProductProductId(UUID productId);

    @EntityGraph(attributePaths = "product")
    Optional<Inventory> readByProductProductId(UUID productId);

    @Override
    @EntityGraph(attributePaths = "product")
    Page<Inventory> findAll(Pageable pageable);
}
