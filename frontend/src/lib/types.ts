export interface OrderResponse {
    orderId: string;
    productId: string;
    quantity: number;
    amount: number;
    orderStatus: 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
}

export interface ProductResponse {
    productId: string;
    sku: string;
    productName: string;
    description: string;
    price: number;
    availableQuantity: number;
    imageUrl: string | null;
}

export interface PaymentResponse {
    paymentId: string;
    orderId: string;
    amount: number;
    currency: string;
    status: 'PENDING' | 'COMPLETED' | 'FAILED';
    failureReason: string | null;
}

export interface PaginatedResponse<T> {
    content: T[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
}
