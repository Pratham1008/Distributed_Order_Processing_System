import { fetchFromApi } from '@/lib/api';
import AddProductSlideOver from '@/components/AddProductSlideOver';
import PlaceOrderButton from '@/components/PlaceOrderButton';
import ProductImage from '@/components/ProductImage';
import type { Metadata } from 'next';
import type { PaginatedResponse, ProductResponse } from '@/lib/types';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
    title: 'Products | DOPS Dashboard',
    description: 'Manage inventory and product details across the distributed order processing system.',
};

export default async function ProductsPage() {
    let products: ProductResponse[] = [];
    try {
        const productsPage = await fetchFromApi('/products') as PaginatedResponse<ProductResponse>;
        products = productsPage.content || [];
    } catch {
        console.error("Failed to fetch products");
    }

    return (
        <div className="mb-margin-lg">
            <div className="flex justify-between items-end mb-margin-lg">
                <div>
                    <h3 className="font-display-sm text-display-sm text-on-surface mb-2">Product Catalog</h3>
                    <p className="font-body-lg text-body-lg text-on-surface-variant">Manage inventory and product details across the distributed system.</p>
                </div>
                <AddProductSlideOver />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-gutter">
                {products.length === 0 ? (
                    <div className="col-span-full py-12 text-center text-on-surface-variant">
                        <span className="material-symbols-outlined text-4xl mb-4 opacity-50" aria-hidden="true">inventory_2</span>
                        <p>No products found in the catalog.</p>
                    </div>
                ) : products.map((product) => {
                    const inStock = product.availableQuantity > 0;
                    const lowStock = product.availableQuantity > 0 && product.availableQuantity < 10;

                    let statusBg = "bg-error-container/20";
                    let statusText = "text-error";
                    let statusDot = "bg-error";
                    let statusLabel = "Out of Stock";

                    if (inStock && !lowStock) {
                        statusBg = "bg-primary-container/20";
                        statusText = "text-on-primary-fixed";
                        statusDot = "bg-[#16a34a]";
                        statusLabel = "In Stock";
                    } else if (lowStock) {
                        statusBg = "bg-tertiary-container/20";
                        statusText = "text-tertiary-container";
                        statusDot = "bg-[#d97706]";
                        statusLabel = "Low Stock";
                    }

                    return (
                        <div key={product.productId} className="bg-surface-container-lowest border border-outline-variant rounded-lg overflow-hidden card-shadow hover:shadow-md transition-shadow duration-200 group relative flex flex-col">
                            <div className="h-40 bg-surface-container flex items-center justify-center relative border-b border-outline-variant">
                                {product.imageUrl ? (
                                    <ProductImage src={product.imageUrl} alt={product.productName} />
                                ) : (
                                    <div className="w-12 h-12 rounded-full bg-surface-variant flex items-center justify-center">
                                        <span className="material-symbols-outlined text-on-surface-variant text-2xl" aria-hidden="true">image</span>
                                    </div>
                                )}
                                <div className={`absolute top-3 right-3 ${statusBg} ${statusText} px-2 py-1 rounded text-xs font-semibold flex items-center gap-1`}>
                                    <span className={`w-2 h-2 rounded-full ${statusDot}`} aria-hidden="true"></span>
                                    {statusLabel}
                                </div>
                            </div>
                            <div className="p-4 flex flex-col flex-1">
                                <h3 className="font-title-lg text-title-lg text-on-surface mb-1 truncate" title={product.productName}>{product.productName}</h3>
                                <p className="text-sm text-on-surface-variant line-clamp-2 mb-4 flex-1">{product.description}</p>
                                <div className="flex justify-between items-end mt-auto pt-4 border-t border-outline-variant/30">
                                    <div>
                                        <span className="font-mono-sm text-mono-sm text-on-surface-variant block mb-1">SKU: {product.sku || product.productId.substring(0, 8)}</span>
                                        <span className="font-headline-md text-headline-md text-primary block mt-2">₹{product.price.toLocaleString()}</span>
                                    </div>
                                    <div className="text-right">
                                        <span className="font-label-md text-label-md text-on-surface-variant block">Stock</span>
                                        <span className="font-title-lg text-title-lg text-on-surface">{product.availableQuantity}</span>
                                    </div>
                                </div>
                                <PlaceOrderButton productId={product.productId} availableQuantity={product.availableQuantity} />
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
