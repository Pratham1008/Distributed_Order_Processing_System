'use client';

import { useState, useEffect, useCallback } from 'react';
import { getBaseUrl } from '@/lib/api';

type ServiceStatus = 'UP' | 'DOWN' | 'LOADING';

export default function HealthStatus() {
    const [statuses, setStatuses] = useState<Record<string, ServiceStatus>>({
        Order: 'LOADING',
        Inventory: 'LOADING',
        Payment: 'LOADING'
    });

    const checkHealth = useCallback(async () => {
        const baseUrl = getBaseUrl(false);

        const checkService = async (serviceName: string, endpoint: string) => {
            try {
                const response = await fetch(`${baseUrl}${endpoint}`, { cache: 'no-store' });
                setStatuses(prev => ({ ...prev, [serviceName]: response.ok ? 'UP' : 'DOWN' }));
            } catch {
                setStatuses(prev => ({ ...prev, [serviceName]: 'DOWN' }));
            }
        };

        await Promise.all([
            checkService('Order', '/health/orders'),
            checkService('Inventory', '/health/inventory'),
            checkService('Payment', '/health/payments')
        ]);
    }, []);

    useEffect(() => {
        checkHealth();
        const interval = setInterval(checkHealth, 10000);
        return () => clearInterval(interval);
    }, [checkHealth]);

    const allHealthy = Object.values(statuses).every(s => s === 'UP');
    const isLoading = Object.values(statuses).some(s => s === 'LOADING');
    const degradedServices = Object.entries(statuses)
        .filter(([, status]) => status === 'DOWN')
        .map(([name]) => name);

    return (
        <div className="relative group hidden lg:flex items-center gap-4 bg-surface-container-highest px-4 py-1.5 rounded-full border border-surface-dim mr-2 cursor-pointer" role="status" aria-label="System health status">
            <div className="flex items-center gap-2">
                {isLoading ? (
                    <>
                        <span className="material-symbols-outlined animate-spin text-sm text-on-surface-variant" aria-hidden="true">progress_activity</span>
                        <span className="font-label-md text-label-md text-on-surface-variant">Checking Systems...</span>
                    </>
                ) : allHealthy ? (
                    <>
                        <span className="w-2.5 h-2.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" aria-hidden="true"></span>
                        <span className="font-label-md text-label-md text-green-700 dark:text-green-400 font-medium">All Systems Healthy</span>
                    </>
                ) : (
                    <>
                        <span className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)] animate-pulse" aria-hidden="true"></span>
                        <span className="font-label-md text-label-md text-red-700 dark:text-red-400 font-medium">System Degraded</span>
                    </>
                )}
            </div>

            <div className="absolute top-full right-0 mt-2 w-48 bg-surface-container-lowest border border-outline-variant rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 overflow-hidden">
                <div className="px-4 py-2 border-b border-outline-variant bg-surface-container/50">
                    <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Service Status</span>
                </div>
                <div className="flex flex-col py-1">
                    {Object.entries(statuses).map(([name, status]) => (
                        <div key={name} className="flex items-center justify-between px-4 py-2 hover:bg-surface-container-low transition-colors">
                            <span className="font-body-sm text-body-sm text-on-surface font-medium">{name}</span>
                            <div className="flex items-center gap-1.5">
                                {status === 'LOADING' && <span className="material-symbols-outlined animate-spin text-[16px] text-on-surface-variant" aria-hidden="true">progress_activity</span>}
                                {status === 'UP' && <span className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_4px_rgba(34,197,94,0.5)]" aria-hidden="true"></span>}
                                {status === 'DOWN' && <span className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_4px_rgba(239,68,68,0.5)]" aria-hidden="true"></span>}
                                <span className={`font-mono-sm text-[10px] ${status === 'UP' ? 'text-green-600' : status === 'DOWN' ? 'text-red-600' : 'text-on-surface-variant'}`}>{status}</span>
                            </div>
                        </div>
                    ))}
                </div>
                {!allHealthy && !isLoading && (
                    <div className="px-4 py-2 bg-error-container/20 border-t border-error/20">
                        <span className="font-label-sm text-label-sm text-error block font-medium">Failing: {degradedServices.join(', ')}</span>
                    </div>
                )}
            </div>
        </div>
    );
}
