package com.dops.orderservice.dto;

import lombok.Builder;
import lombok.Data;

import java.util.UUID;

@Data
@Builder
public class OrderRequest {

    private UUID productId;
    private Integer quantity;

}
