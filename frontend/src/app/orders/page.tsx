import { fetchFromApi } from '@/lib/api';
import type { Metadata } from 'next';
import type { PaginatedResponse, OrderResponse, ProductResponse } from '@/lib/types';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
    title: 'Orders | DOPS Dashboard',
    description: 'Track order sagas and monitor distributed order processing across the system.',
};

export default async function OrdersPage() {
    let orders: OrderResponse[] = [];
    let productsMap: Record<string, ProductResponse> = {};

    try {
        const [ordersPage, productsPage] = await Promise.all([
            fetchFromApi('/orders') as Promise<PaginatedResponse<OrderResponse>>,
            fetchFromApi('/products?size=1000') as Promise<PaginatedResponse<ProductResponse>>,
        ]);

        orders = ordersPage.content || [];

        (productsPage.content || []).forEach((p) => {
            productsMap[p.productId] = p;
        });
    } catch {
        console.error("Failed to fetch orders or products");
    }

    return (
        <div className="mb-margin-lg">
            <div className="flex justify-between items-end mb-margin-lg">
                <div>
                    <h3 className="font-display-sm text-display-sm text-on-surface mb-2">Order Management</h3>
                    <p className="font-body-lg text-body-lg text-on-surface-variant">Track order sagas and product details.</p>
                </div>
            </div>

            <div className="bg-surface rounded-xl border border-outline-variant shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-surface-container-lowest border-b border-outline-variant">
                                <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Order ID</th>
                                <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Product</th>
                                <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Live Inventory</th>
                                <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Quantity</th>
                                <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Total Price</th>
                                <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-outline-variant/50">
                            {orders.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-on-surface-variant">
                                        <span className="material-symbols-outlined text-4xl mb-2 opacity-50 block" aria-hidden="true">shopping_cart</span>
                                        No orders found.
                                    </td>
                                </tr>
                            ) : orders.map((order) => {
                                const product = productsMap[order.productId];
                                const productName = product ? product.productName : `Unknown (ID: ${order.productId.substring(0, 8)})`;
                                const stockLeft = product ? product.availableQuantity : 0;

                                let statusStyles = "bg-surface-variant text-on-surface-variant";
                                if (order.orderStatus === 'PENDING') statusStyles = "bg-blue-100 text-blue-800";
                                else if (order.orderStatus === 'COMPLETED') statusStyles = "bg-green-100 text-green-800";
                                else if (order.orderStatus === 'CANCELLED' || order.orderStatus === 'FAILED') statusStyles = "bg-error-container/20 text-error";

                                return (
                                    <tr key={order.orderId} className="hover:bg-surface-container-low transition-colors">
                                        <td className="px-6 py-4">
                                            <span className="font-mono-sm text-mono-sm text-on-surface-variant" title={order.orderId}>
                                                {order.orderId.substring(0, 8)}...
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-title-lg text-title-lg text-on-surface font-medium truncate max-w-[200px]" title={productName}>
                                                {productName}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <span className={`w-2 h-2 rounded-full ${stockLeft > 0 ? 'bg-green-500' : 'bg-red-500'}`} aria-hidden="true"></span>
                                                <span className="font-body-md font-medium">{stockLeft} in stock</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-on-surface">{order.quantity}</td>
                                        <td className="px-6 py-4 font-medium text-on-surface">₹{order.amount.toLocaleString()}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold tracking-wide ${statusStyles}`}>
                                                {order.orderStatus}
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
