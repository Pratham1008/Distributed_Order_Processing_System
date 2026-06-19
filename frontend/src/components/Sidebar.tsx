'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Sidebar() {
    const pathname = usePathname();

    const navItems = [
        { name: 'Dashboard', path: '/', icon: 'dashboard' },
        { name: 'Products', path: '/products', icon: 'inventory_2' },
        { name: 'Orders', path: '/orders', icon: 'shopping_cart' },
        { name: 'Payments', path: '/payments', icon: 'payments' },
    ];

    return (
        <nav className="bg-inverse-surface dark:bg-inverse-surface fixed left-0 top-0 h-screen w-[240px] flex flex-col overflow-y-auto shadow-md z-50 transition-transform duration-300 transform -translate-x-full md:translate-x-0" id="sidebar" aria-label="Main navigation">
            <div className="px-margin-md py-margin-md mb-stack-lg">
                <h1 className="font-headline-lg text-headline-lg font-black text-primary-fixed">DOPS</h1>
                <p className="font-label-md text-label-md text-inverse-primary mt-1">Command Center</p>
            </div>
            <div className="flex-1 flex flex-col gap-stack-sm mt-stack-md px-2">
                {navItems.map((item) => {
                    const isActive = pathname === item.path || (item.path !== '/' && pathname.startsWith(item.path));
                    return (
                        <Link key={item.name} href={item.path} className={`flex items-center gap-stack-md px-4 py-3 hover:bg-surface-variant/10 transition-colors duration-200 active:scale-95 transition-transform ${isActive ? 'text-primary-fixed bg-primary-container/20 border-l-4 border-primary-fixed' : 'text-surface-variant hover:text-surface-bright'}`} aria-current={isActive ? 'page' : undefined}>
                            <span className="material-symbols-outlined" style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}} aria-hidden="true">{item.icon}</span>
                            <span className="font-title-lg text-title-lg font-medium">{item.name}</span>
                        </Link>
                    );
                })}
            </div>
            <div className="px-2 pb-margin-md flex flex-col gap-stack-sm border-t border-surface-variant/20 pt-stack-md mt-auto">
                <a className="flex items-center gap-stack-md text-surface-variant hover:text-surface-bright px-4 py-3 hover:bg-surface-variant/10 transition-colors duration-200 active:scale-95 transition-transform" href="#">
                    <span className="material-symbols-outlined" aria-hidden="true">settings</span>
                    <span className="font-title-lg text-title-lg font-medium">Settings</span>
                </a>
                <a className="flex items-center gap-stack-md text-surface-variant hover:text-surface-bright px-4 py-3 hover:bg-surface-variant/10 transition-colors duration-200 active:scale-95 transition-transform" href="#">
                    <span className="material-symbols-outlined" aria-hidden="true">help_outline</span>
                    <span className="font-title-lg text-title-lg font-medium">Support</span>
                </a>
            </div>
        </nav>
    );
}
