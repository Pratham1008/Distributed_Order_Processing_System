'use client';

import { useState } from 'react';
import { getBaseUrl } from '@/lib/api';
import { useRouter } from 'next/navigation';

export default function PlaceOrderButton({ productId, availableQuantity }: { productId: string; availableQuantity: number }) {
    const [isLoading, setIsLoading] = useState(false);
    const [quantity, setQuantity] = useState(1);
    const router = useRouter();

    const placeOrder = async () => {
        if (quantity < 1 || quantity > availableQuantity) return;

        setIsLoading(true);
        try {
            const baseUrl = getBaseUrl(false);
            const response = await fetch(`${baseUrl}/orders`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ productId, quantity }),
            });

            if (!response.ok) {
                throw new Error('Failed to place order');
            }

            alert('Order placed successfully! Check the Orders tab to track its saga progress.');
            router.refresh();
        } catch {
            alert('Error placing order. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    if (availableQuantity <= 0) {
        return (
            <button disabled className="w-full mt-4 py-2 bg-surface-variant text-on-surface-variant rounded-lg font-label-lg font-medium opacity-50 cursor-not-allowed">
                Out of Stock
            </button>
        );
    }

    return (
        <div className="mt-4 flex gap-2">
            <input
                type="number"
                min="1"
                max={availableQuantity}
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-20 px-3 py-2 bg-surface-container-low border border-outline-variant rounded-lg text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20"
                aria-label="Order quantity"
            />
            <button
                onClick={placeOrder}
                disabled={isLoading}
                className="flex-1 py-2 bg-primary text-on-primary rounded-lg font-label-lg font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
                {isLoading ? (
                    <span className="material-symbols-outlined animate-spin text-sm" aria-hidden="true">progress_activity</span>
                ) : (
                    <span className="material-symbols-outlined text-sm" aria-hidden="true">shopping_cart_checkout</span>
                )}
                {isLoading ? 'Processing...' : 'Place Order'}
            </button>
        </div>
    );
}
