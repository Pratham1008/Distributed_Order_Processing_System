package com.dops.inventoryservice.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.math.BigDecimal;

public record ProductRequest(
    @NotBlank(message = "Product name is required") String productName, 
    String description, 
    @NotNull(message = "Price is required") @Positive(message = "Price must be positive") BigDecimal price, 
    @NotBlank(message = "SKU is required") String sku, 
    @NotNull(message = "Stock is required") @Min(value = 0, message = "Stock cannot be negative") Integer stock
) {
}
