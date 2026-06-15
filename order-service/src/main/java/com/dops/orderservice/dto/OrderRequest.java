package com.dops.orderservice.dto;

import lombok.Builder;
import lombok.Data;

import java.util.UUID;

import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderRequest {

    private UUID productId;
    private Integer quantity;

}
