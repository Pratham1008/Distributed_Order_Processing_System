import HealthStatus from './HealthStatus';

export default function TopAppBar() {
    return (
        <header className="bg-surface dark:bg-surface sticky top-0 right-0 w-full flex justify-between items-center h-16 px-margin-md border-b border-outline-variant z-40 flat no shadows">
            <div className="flex items-center gap-stack-md">
                <button className="md:hidden text-primary p-2 focus:ring-2 focus:ring-primary/20 rounded-lg" id="mobile-menu-btn">
                    <span className="material-symbols-outlined">menu</span>
                </button>
                <h2 className="font-headline-md text-headline-md font-bold text-primary truncate hidden sm:block">Distributed Order Processing System</h2>
                <h2 className="font-headline-md text-headline-md font-bold text-primary truncate sm:hidden">DOPS</h2>
            </div>
            <div className="flex items-center gap-stack-md">
                <HealthStatus />
                <button className="text-on-surface-variant hover:text-primary transition-colors focus:ring-2 focus:ring-primary/20 p-2 rounded-full">
                    <span className="material-symbols-outlined">notifications</span>
                </button>
                <button className="text-on-surface-variant hover:text-primary transition-colors focus:ring-2 focus:ring-primary/20 p-2 rounded-full">
                    <span className="material-symbols-outlined">account_circle</span>
                </button>
            </div>
        </header>
    );
}
