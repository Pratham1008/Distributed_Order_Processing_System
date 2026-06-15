package com.dops.inventoryservice.dto;

import lombok.Builder;

import java.util.UUID;

@Builder
public record ProductResponse(UUID productId, String sku, String productName, String description, Double price, Integer availableQuantity, String imageUrl) {}
