import { fetchFromApi } from '@/lib/api';
import PaymentActionButtons from '@/components/PaymentActionButtons';

export const dynamic = 'force-dynamic';

export default async function PaymentsPage() {
    let payments = [];

    try {
        const paymentsPage = await fetchFromApi('/payments');
        payments = paymentsPage.content || [];
    } catch (e) {
        console.error("Failed to fetch payments", e);
    }

    return (
        <div className="mb-margin-lg">
            <div className="flex justify-between items-end mb-margin-lg">
                <div>
                    <h3 className="font-display-sm text-display-sm text-on-surface mb-2">Payment Processing</h3>
                    <p className="font-body-lg text-body-lg text-on-surface-variant">Monitor transaction statuses and payment events.</p>
                </div>
            </div>

            <div className="bg-surface rounded-xl border border-outline-variant shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-surface-container-lowest border-b border-outline-variant">
                                <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Payment ID</th>
                                <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Order ID</th>
                                <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Amount</th>
                                <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-outline-variant/50">
                            {payments.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-on-surface-variant">
                                        <span className="material-symbols-outlined text-4xl mb-2 opacity-50 block">receipt_long</span>
                                        No payments found.
                                    </td>
                                </tr>
                            ) : payments.map((payment: any) => {
                                let statusStyles = "bg-surface-variant text-on-surface-variant";
                                if (payment.status === 'PENDING') statusStyles = "bg-amber-100 text-amber-800";
                                else if (payment.status === 'COMPLETED') statusStyles = "bg-green-100 text-green-800";
                                else if (payment.status === 'FAILED') statusStyles = "bg-error-container/20 text-error";

                                return (
                                    <tr key={payment.paymentId} className="hover:bg-surface-container-low transition-colors">
                                        <td className="px-6 py-4">
                                            <span className="font-mono-sm text-mono-sm text-on-surface-variant" title={payment.paymentId}>
                                                {payment.paymentId.substring(0, 8)}...
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="font-mono-sm text-mono-sm text-on-surface-variant" title={payment.orderId}>
                                                {payment.orderId.substring(0, 8)}...
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 font-medium text-on-surface">₹{payment.amount.toLocaleString()}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold tracking-wide ${statusStyles}`}>
                                                {payment.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {payment.status === 'PENDING' ? (
                                                <PaymentActionButtons orderId={payment.orderId} />
                                            ) : (
                                                <span className="text-on-surface-variant text-sm italic">Processed</span>
                                            )}
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
