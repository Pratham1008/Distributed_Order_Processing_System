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

    @Bean
    public RouterFunction<ServerResponse> orderRoutes() {
        return route("order-service")
                .before(uri("http://localhost:8081"))
                .route(path("/orders/**"), http())
                .build();
    }

    @Bean
    public RouterFunction<ServerResponse> inventoryRoutes() {
        return route("inventory-service")
                .before(uri("http://localhost:8082"))
                .route(path("/products/**"), http())
                .route(path("/inventory/**"), http())
                .build();
    }

    @Bean
    public RouterFunction<ServerResponse> paymentRoutes() {
        return route("payment-service")
                .before(uri("http://localhost:8083"))
                .route(path("/payments/**"), http())
                .build();
    }
}
