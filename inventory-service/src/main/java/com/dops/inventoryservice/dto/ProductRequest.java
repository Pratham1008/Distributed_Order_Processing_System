package com.dops.inventoryservice.dto;

public record ProductRequest(String productName, String description, Double price, String sku, Integer stock) {
}
