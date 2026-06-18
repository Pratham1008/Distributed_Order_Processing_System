package com.dops.inventoryservice.dto;

import lombok.Builder;

import java.math.BigDecimal;
import java.util.UUID;

@Builder
public record ProductResponse(UUID productId, String sku, String productName, String description, BigDecimal price, Integer availableQuantity, String imageUrl) {}
