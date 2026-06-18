package com.dops.apigateway;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.function.RouterFunction;
import org.springframework.web.servlet.function.ServerResponse;

import static org.springframework.cloud.gateway.server.mvc.filter.BeforeFilterFunctions.uri;
import static org.springframework.cloud.gateway.server.mvc.handler.GatewayRouterFunctions.route;
import static org.springframework.cloud.gateway.server.mvc.handler.HandlerFunctions.http;
import static org.springframework.web.servlet.function.RequestPredicates.path;

@Configuration
public class GatewayRoutes {

    @org.springframework.beans.factory.annotation.Value("${dops.order-url:http://order-service:8081}")
    private String orderUrl;

    @org.springframework.beans.factory.annotation.Value("${dops.inventory-url:http://inventory-service:8082}")
    private String inventoryUrl;

    @org.springframework.beans.factory.annotation.Value("${dops.payment-url:http://payment-service:8083}")
    private String paymentUrl;

    @Bean
    public RouterFunction<ServerResponse> orderRoutes() {
        return route("order-service")
                .before(uri(orderUrl))
                .route(path("/orders/**"), http())
                .build();
    }

    @Bean
    public RouterFunction<ServerResponse> inventoryRoutes() {
        return route("inventory-service")
                .before(uri(inventoryUrl))
                .route(path("/products/**"), http())
                .route(path("/inventory/**"), http())
                .build();
    }

    @Bean
    public RouterFunction<ServerResponse> paymentRoutes() {
        return route("payment-service")
                .before(uri(paymentUrl))
                .route(path("/payments/**"), http())
                .build();
    }

}
