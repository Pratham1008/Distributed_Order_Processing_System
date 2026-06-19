const SERVER_API_URL = process.env.API_URL || 'http://api-gateway:8080';
const CLIENT_API_URL = '/api';

export function getBaseUrl(isServerSide = true) {
    return isServerSide ? SERVER_API_URL : CLIENT_API_URL;
}

export async function fetchFromApi(endpoint: string, options: RequestInit = {}) {
    const baseUrl = typeof window === 'undefined' ? SERVER_API_URL : CLIENT_API_URL;
    const url = `${baseUrl}${endpoint}`;

    try {
        const headers: Record<string, string> = {
            ...(options.headers as Record<string, string> || {})
        };

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

        const text = await response.text();
        return text ? JSON.parse(text) : null;
    } catch (error) {
        console.error(`Fetch error on ${endpoint}:`, error);
        throw error;
    }
}
