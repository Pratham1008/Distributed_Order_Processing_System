'use client';

import { useState } from 'react';

interface ProductImageProps {
    src: string;
    alt: string;
}

export default function ProductImage({ src, alt }: ProductImageProps) {
    const [hasError, setHasError] = useState(false);

    const imageUrl = src?.replace('http://localhost:8082', '/api');

    if (hasError) {
        return (
            <div className="w-12 h-12 rounded-full bg-surface-variant flex items-center justify-center">
                <span className="material-symbols-outlined text-on-surface-variant text-2xl">image_not_supported</span>
            </div>
        );
    }

    return (
        <img 
            src={imageUrl} 
            alt={alt} 
            className="object-contain w-full h-full p-2" 
            onError={() => setHasError(true)}
        />
    );
}
