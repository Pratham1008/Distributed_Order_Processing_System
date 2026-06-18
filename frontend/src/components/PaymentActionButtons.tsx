'use client';

import { useState } from 'react';
import { getBaseUrl } from '@/lib/api';
import { useRouter } from 'next/navigation';

export default function PaymentActionButtons({ orderId }: { orderId: string }) {
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleProcess = async (success: boolean) => {
        setIsLoading(true);
        try {
            const baseUrl = getBaseUrl(false);
            const response = await fetch(`${baseUrl}/payments/${orderId}/process?success=${success}`, {
                method: 'POST',
            });

            if (!response.ok) {
                throw new Error('Failed to process payment');
            }

            // Let the user know and refresh the page to see the updated status
            router.refresh();
        } catch (error) {
            console.error('Error processing payment:', error);
            alert('Error processing payment. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-end">
                <span className="material-symbols-outlined animate-spin text-sm text-on-surface-variant">progress_activity</span>
            </div>
        );
    }

    return (
        <div className="flex gap-2 justify-end">
            <button 
                onClick={() => handleProcess(true)}
                className="text-green-600 hover:bg-green-50 p-1.5 rounded-md transition-colors border border-green-200" 
                title="Approve"
            >
                <span className="material-symbols-outlined text-sm block">check</span>
            </button>
            <button 
                onClick={() => handleProcess(false)}
                className="text-error hover:bg-error-container/20 p-1.5 rounded-md transition-colors border border-error-container" 
                title="Reject"
            >
                <span className="material-symbols-outlined text-sm block">close</span>
            </button>
        </div>
    );
}
