# Distributed Order Processing System (Saga Pattern)

A robust, event-driven microservices architecture demonstrating the **Choreography-based Saga Pattern** using Spring Boot and Apache Kafka. This system manages a distributed transaction across multiple independent services, ensuring eventual consistency without distributed locks or two-phase commits.

## 🏗️ Architecture

The application is composed of the following microservices:
*   **Order Service** (`:8081`): Handles order creation and lifecycle management. It acts as the initiator of the Saga by emitting an `OrderCreated` event.
*   **Inventory Service** (`:8082`): Manages product stock. Listens to order events to reserve inventory and handles compensations if downstream steps fail.
*   **Payment Service** (`:8083`): Processes simulated payments. Listens to inventory events and approves or rejects the payment based on the requested amount.
*   **API Gateway** (`:8080`): A unified entry point routing client requests to the respective backend microservices.
*   **Common Events Module**: A shared library containing the Kafka event definitions (`OrderCreated`, `InventoryReserved`, etc.) used for inter-service communication.

### The Saga Workflow (Choreography)

1.  **Order Service** receives an order request. It calculates the true price by querying the **Inventory Service**, saves the order in a `PENDING` state, and publishes an `OrderCreated` event.
2.  **Inventory Service** consumes `OrderCreated`. It verifies available stock.
    *   *Success*: Reserves stock and publishes `InventoryReserved`.
    *   *Failure*: Publishes `InventoryFailed` (Order is marked `CANCELLED`).
3.  **Payment Service** consumes `InventoryReserved`. It attempts to process the payment.
    *   *Success*: Publishes `PaymentCompleted`.
    *   *Failure*: Publishes `PaymentFailed`.
4.  If **Payment Service** fails, **Inventory Service** consumes `PaymentFailed` and releases the reserved inventory (Compensating Transaction).
5.  **Order Service** listens to the final outcomes (`PaymentCompleted` or `InventoryFailed`/`PaymentFailed`) and updates the final order status to `COMPLETED` or `CANCELLED`.

## 🛠️ Technologies Used

*   **Java 21**
*   **Spring Boot 3.5**
*   **Apache Kafka & Zookeeper** (Event Bus)
*   **PostgreSQL 17** (Independent Databases per Service)
*   **Spring Data JPA / Hibernate**
*   **Docker & Docker Compose**

## 🚀 Getting Started

### Prerequisites
*   Docker & Docker Compose
*   Java 21
*   Maven

### Running the Infrastructure
Start the required infrastructure (Kafka, Zookeeper, and multiple PostgreSQL databases) using Docker Compose:
```bash
docker-compose up -d
```

### Running the Microservices
You can run the microservices via your IDE, or via Maven from the root directory:
```bash
./mvnw clean install
```
Then start each service (`OrderServiceApplication`, `InventoryServiceApplication`, `PaymentServiceApplication`, `ApiGatewayApplication`).

## 📡 Key API Endpoints

All requests should ideally be routed through the API Gateway on `localhost:8080`.

**Inventory Management:**
*   `POST /api/products` - Create a new product.
*   `GET /api/products` - List all products.
*   `GET /api/products/{productId}` - Fetch a specific product's details.

**Order Management:**
*   `POST /api/orders` - Place a new order (Requires `productId` and `quantity`).
*   `GET /api/orders` - List all orders.
*   `GET /api/orders/{orderId}` - Fetch the status of a specific order.

**Payment Management:**
*   `GET /api/payments` - List all simulated payment records.

## 📝 License
This project is licensed under the MIT License.
