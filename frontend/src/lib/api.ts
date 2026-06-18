// Backend URL for Server Components (internal docker network)
const SERVER_API_URL = process.env.API_URL || 'http://api-gateway:8080';

// Backend URL for Client Components (external browser network)
const CLIENT_API_URL = '/api';

export function getBaseUrl(isServerSide = true) {
    return isServerSide ? SERVER_API_URL : CLIENT_API_URL;
}

export async function fetchFromApi(endpoint: string, options: RequestInit = {}) {
    // In Next.js 14/15 App Router, most fetching happens on the server.
    // Default to server URL for fetch calls from Server Components.
    const baseUrl = typeof window === 'undefined' ? SERVER_API_URL : CLIENT_API_URL;
    
    const url = `${baseUrl}${endpoint}`;
    
    try {
        const headers: Record<string, string> = { 
            ...(options.headers as Record<string, string> || {}) 
        };
        
        // Only set application/json if body is not FormData
        if (!(options.body instanceof FormData) && !headers['Content-Type']) {
            headers['Content-Type'] = 'application/json';
        }

        const response = await fetch(url, {
            ...options,
            headers,
        });
        
        if (!response.ok) {
            throw new Error(`API error: ${response.status} ${response.statusText}`);
        }
        
        // Some endpoints like /payments/{orderId}/process return void/empty responses
        const text = await response.text();
        return text ? JSON.parse(text) : null;
    } catch (error) {
        console.error(`Fetch error on ${endpoint}:`, error);
        throw error;
    }
}
