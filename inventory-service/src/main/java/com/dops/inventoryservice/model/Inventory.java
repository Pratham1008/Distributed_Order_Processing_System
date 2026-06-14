package com.dops.inventoryservice.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Inventory {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID inventoryId;

    @Column(unique = true, nullable = false)
    private String sku;

    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "productId")
    private Product product;

    private Integer availableQuantity;
}
