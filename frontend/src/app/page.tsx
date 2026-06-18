import { fetchFromApi } from '@/lib/api';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
    // Fetch data from all services to display real metrics
    let totalOrders = 0;
    let totalProducts = 0;
    let totalPayments = 0;
    let revenue = 0;

    try {
        const [ordersPage, productsPage, paymentsPage] = await Promise.all([
            fetchFromApi('/orders'),
            fetchFromApi('/products'),
            fetchFromApi('/payments'),
        ]);

        totalOrders = ordersPage.totalElements || 0;
        totalProducts = productsPage.totalElements || 0;
        totalPayments = paymentsPage.totalElements || 0;
        
        // Calculate total revenue from successful payments
        const payments = paymentsPage.content || [];
        revenue = payments
            .filter((p: any) => p.status === 'COMPLETED')
            .reduce((sum: number, p: any) => sum + p.amount, 0);

    } catch (e) {
        console.error("Failed to load metrics from API Gateway", e);
    }

    return (
        <div className="mb-margin-lg">
            <h3 className="font-display-sm text-display-sm text-on-surface mb-2">Overview</h3>
            <p className="font-body-lg text-body-lg text-on-surface-variant mb-6">Real-time metrics for distributed order processing.</p>

            {/* Bento Grid Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-gutter mb-margin-lg">
                {/* Metric Card 1 */}
                <div className="bg-surface rounded-xl border border-outline-variant p-margin-sm shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col justify-between group">
                    <div className="flex justify-between items-start mb-stack-md">
                        <span className="font-title-lg text-title-lg text-on-surface-variant">Total Orders</span>
                        <div className="p-2 bg-primary-container/10 rounded-lg text-primary group-hover:bg-primary-container/20 transition-colors">
                            <span className="material-symbols-outlined">shopping_bag</span>
                        </div>
                    </div>
                    <div>
                        <div className="font-display-sm text-display-sm text-on-surface mb-1">{totalOrders}</div>
                        <div className="flex items-center gap-1 text-green-600">
                            <span className="material-symbols-outlined text-sm">trending_up</span>
                            <span className="font-label-md text-label-md">Live from API Gateway</span>
                        </div>
                    </div>
                </div>

                {/* Metric Card 2 */}
                <div className="bg-surface rounded-xl border border-outline-variant p-margin-sm shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col justify-between group">
                    <div className="flex justify-between items-start mb-stack-md">
                        <span className="font-title-lg text-title-lg text-on-surface-variant">Products Catalog</span>
                        <div className="p-2 bg-secondary-container/30 rounded-lg text-secondary group-hover:bg-secondary-container/50 transition-colors">
                            <span className="material-symbols-outlined">inventory_2</span>
                        </div>
                    </div>
                    <div>
                        <div className="font-display-sm text-display-sm text-on-surface mb-1">{totalProducts}</div>
                        <div className="flex items-center gap-1 text-on-surface-variant">
                            <span className="material-symbols-outlined text-sm">sync</span>
                            <span className="font-label-md text-label-md">Synced across inventory</span>
                        </div>
                    </div>
                </div>

                {/* Metric Card 3 */}
                <div className="bg-surface rounded-xl border border-outline-variant p-margin-sm shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col justify-between group">
                    <div className="flex justify-between items-start mb-stack-md">
                        <span className="font-title-lg text-title-lg text-on-surface-variant">Total Revenue</span>
                        <div className="p-2 bg-tertiary-container/10 rounded-lg text-tertiary group-hover:bg-tertiary-container/20 transition-colors">
                            <span className="material-symbols-outlined">payments</span>
                        </div>
                    </div>
                    <div>
                        <div className="font-display-sm text-display-sm text-on-surface mb-1">₹{revenue.toLocaleString()}</div>
                        <div className="flex items-center gap-1 text-green-600">
                            <span className="material-symbols-outlined text-sm">check_circle</span>
                            <span className="font-label-md text-label-md">Completed payments only</span>
                        </div>
                    </div>
                </div>

                {/* Metric Card 4 */}
                <div className="bg-surface rounded-xl border border-outline-variant p-margin-sm shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col justify-between group">
                    <div className="flex justify-between items-start mb-stack-md">
                        <span className="font-title-lg text-title-lg text-on-surface-variant">Payments Tracked</span>
                        <div className="p-2 bg-error-container/30 rounded-lg text-error group-hover:bg-error-container/50 transition-colors">
                            <span className="material-symbols-outlined">receipt_long</span>
                        </div>
                    </div>
                    <div>
                        <div className="font-display-sm text-display-sm text-on-surface mb-1">{totalPayments}</div>
                        <div className="flex items-center gap-1 text-on-surface-variant">
                            <span className="material-symbols-outlined text-sm">analytics</span>
                            <span className="font-label-md text-label-md">All statuses included</span>
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="bg-surface rounded-xl border border-outline-variant p-margin-md shadow-sm">
                <h4 className="font-title-lg text-title-lg text-on-surface mb-4">Architecture Status</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 border border-outline-variant rounded-lg bg-surface-container-lowest">
                        <div className="flex items-center gap-3">
                            <span className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></span>
                            <span className="font-headline-md font-medium">Order Service</span>
                        </div>
                        <p className="text-on-surface-variant mt-2 text-sm">Handling saga orchestration via Kafka</p>
                    </div>
                    <div className="p-4 border border-outline-variant rounded-lg bg-surface-container-lowest">
                        <div className="flex items-center gap-3">
                            <span className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></span>
                            <span className="font-headline-md font-medium">Inventory Service</span>
                        </div>
                        <p className="text-on-surface-variant mt-2 text-sm">Managing stock reservations</p>
                    </div>
                    <div className="p-4 border border-outline-variant rounded-lg bg-surface-container-lowest">
                        <div className="flex items-center gap-3">
                            <span className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></span>
                            <span className="font-headline-md font-medium">Payment Service</span>
                        </div>
                        <p className="text-on-surface-variant mt-2 text-sm">Processing transactions</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
