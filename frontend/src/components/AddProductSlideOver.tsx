'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { fetchFromApi } from '@/lib/api';

export default function AddProductSlideOver() {
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();

    const openSlideOver = () => {
        setIsOpen(true);
        document.body.style.overflow = 'hidden';
    };

    const closeSlideOver = () => {
        setIsOpen(false);
        document.body.style.overflow = '';
        setImagePreview(null);
        setError(null);
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const url = URL.createObjectURL(file);
            setImagePreview(url);
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            const form = e.currentTarget;
            const formData = new FormData(form);
            
            const productName = formData.get('productName') as string;
            const sku = formData.get('sku') as string;
            const description = formData.get('description') as string;
            const price = parseFloat(formData.get('price') as string);
            const stock = parseInt(formData.get('stock') as string);
            
            const backendFormData = new FormData();
            
            const productInfo = { productName, sku, description, price, stock };
            backendFormData.append('product', new Blob([JSON.stringify(productInfo)], { type: 'application/json' }));
            
            const imageFile = formData.get('image') as File;
            if (imageFile && imageFile.size > 0) {
                backendFormData.append('image', imageFile);
            }

            await fetchFromApi('/products', {
                method: 'POST',
                body: backendFormData
            });

            closeSlideOver();
            form.reset();
            router.refresh();
            
            alert("Product added successfully!");
        } catch (err) {
            console.error("Error adding product:", err);
            setError("Failed to add product. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <button onClick={openSlideOver} className="bg-primary hover:bg-primary/90 text-on-primary px-4 py-2 rounded-full font-label-md text-label-md flex items-center gap-2 transition-colors shadow-sm hover:shadow active:scale-95 transition-transform">
                <span className="material-symbols-outlined text-sm">add</span>
                Add Product
            </button>

            <div className={`fixed inset-0 bg-on-surface/40 z-30 transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={closeSlideOver}></div>
            
            <div className={`fixed inset-y-0 right-0 w-full max-w-md bg-surface-container-lowest shadow-2xl z-40 flex flex-col border-l border-outline-variant transition-transform duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                <div className="flex items-center justify-between p-6 border-b border-outline-variant bg-surface">
                    <h2 className="font-headline-md text-headline-md text-on-surface">Add New Product</h2>
                    <button onClick={closeSlideOver} className="text-on-surface-variant hover:text-on-surface rounded-full p-1 hover:bg-surface-container-low transition-colors">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-6 bg-background">
                    {error && (
                        <div className="bg-error-container text-on-error-container p-3 rounded-md mb-4 text-sm font-medium">
                            {error}
                        </div>
                    )}
                    
                    <form id="addProductForm" onSubmit={handleSubmit} className="flex flex-col gap-5">
                        <div>
                            <label className="block font-label-md text-label-md text-on-surface mb-2">Product Image</label>
                            <div 
                                onClick={() => fileInputRef.current?.click()}
                                className="relative border-2 border-dashed border-outline-variant rounded-lg p-6 flex flex-col items-center justify-center bg-surface-container-low hover:bg-surface-container transition-colors cursor-pointer group overflow-hidden h-40"
                            >
                                {imagePreview ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img src={imagePreview} alt="Preview" className="absolute inset-0 w-full h-full object-cover" />
                                ) : (
                                    <>
                                        <span className="material-symbols-outlined text-[32px] text-on-surface-variant group-hover:text-primary mb-2 transition-colors">cloud_upload</span>
                                        <p className="font-body-md text-body-md text-on-surface-variant mb-1"><span className="font-medium text-primary">Click to upload</span> or drag and drop</p>
                                        <p className="font-mono-sm text-mono-sm text-outline">SVG, PNG, JPG or GIF (max. 5MB)</p>
                                    </>
                                )}
                            </div>
                            <input type="file" name="image" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleImageChange} />
                        </div>
                        
                        <div>
                            <label className="block font-label-md text-label-md text-on-surface mb-2" htmlFor="productName">Product Name <span className="text-error">*</span></label>
                            <input required type="text" id="productName" name="productName" className="w-full bg-surface-container-lowest border border-outline-variant rounded px-3 py-2 font-body-md text-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-shadow placeholder-outline" placeholder="e.g. Ergonomic Office Chair" />
                        </div>

                        <div>
                            <label className="block font-label-md text-label-md text-on-surface mb-2" htmlFor="sku">SKU <span className="text-error">*</span></label>
                            <input required type="text" id="sku" name="sku" className="w-full bg-surface-container-lowest border border-outline-variant rounded px-3 py-2 font-mono-sm text-mono-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-shadow placeholder-outline uppercase" placeholder="ITM-001" />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block font-label-md text-label-md text-on-surface mb-2" htmlFor="stock">Initial Stock <span className="text-error">*</span></label>
                                <input required type="number" min="0" id="stock" name="stock" className="w-full bg-surface-container-lowest border border-outline-variant rounded px-3 py-2 font-body-md text-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-shadow" placeholder="0" />
                            </div>
                            <div>
                                <label className="block font-label-md text-label-md text-on-surface mb-2" htmlFor="price">Price <span className="text-error">*</span></label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <span className="text-on-surface-variant font-body-md">₹</span>
                                    </div>
                                    <input required type="number" step="0.01" min="0" id="price" name="price" className="w-full bg-surface-container-lowest border border-outline-variant rounded pl-8 pr-3 py-2 font-body-md text-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-shadow" placeholder="0.00" />
                                </div>
                            </div>
                        </div>
                        
                        <div>
                            <label className="block font-label-md text-label-md text-on-surface mb-2" htmlFor="description">Description</label>
                            <textarea id="description" name="description" rows={4} className="w-full bg-surface-container-lowest border border-outline-variant rounded px-3 py-2 font-body-md text-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-shadow resize-none placeholder-outline" placeholder="Enter product details..."></textarea>
                        </div>
                    </form>
                </div>
                
                <div className="p-6 border-t border-outline-variant bg-surface flex justify-end gap-3">
                    <button type="button" onClick={closeSlideOver} className="px-4 py-2 rounded bg-surface-container-lowest border border-outline-variant text-on-surface font-label-md text-label-md hover:bg-surface-container-low transition-colors">
                        Cancel
                    </button>
                    <button type="submit" form="addProductForm" disabled={isLoading} className="px-4 py-2 rounded bg-primary text-on-primary font-label-md text-label-md hover:bg-primary-container transition-colors flex items-center justify-center min-w-[120px] disabled:opacity-70 disabled:cursor-not-allowed">
                        {isLoading ? (
                            <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
                        ) : (
                            <span>Save Product</span>
                        )}
                    </button>
                </div>
            </div>
        </>
    );
}
