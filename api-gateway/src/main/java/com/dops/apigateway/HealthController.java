package com.dops.apigateway;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;

@RestController
@RequestMapping("/health")
public class HealthController {

    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${dops.order-url:http://order-service:8081}")
    private String orderUrl;

    @Value("${dops.inventory-url:http://inventory-service:8082}")
    private String inventoryUrl;

    @Value("${dops.payment-url:http://payment-service:8083}")
    private String paymentUrl;

    @GetMapping("/orders")
    public ResponseEntity<String> orderHealth() {
        return probeHealth(orderUrl);
    }

    @GetMapping("/inventory")
    public ResponseEntity<String> inventoryHealth() {
        return probeHealth(inventoryUrl);
    }

    @GetMapping("/payments")
    public ResponseEntity<String> paymentHealth() {
        return probeHealth(paymentUrl);
    }

    private ResponseEntity<String> probeHealth(String serviceUrl) {
        try {
            return restTemplate.getForEntity(serviceUrl + "/actuator/health", String.class);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("{\"status\":\"DOWN\"}");
        }
    }
}
