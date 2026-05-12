import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
    baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001",
    fetchOptions: {
        credentials: "include", // Required for cross-origin cookie auth
        onSuccess: (ctx) => {
            const authToken = ctx.response.headers.get("set-auth-token");
            if (authToken) {
                localStorage.setItem("bearer_token", authToken);
            }
        }
    }
});

export const { useSession, signIn, signOut, signUp } = authClient;

/**
 * Helper to make authenticated API requests to the backend.
 * Uses both cookies (cross-origin) and bearer token as fallback.
 */
export async function apiFetch(path: string, options: RequestInit = {}) {
    let apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
    
    // Fallback for Windows localhost issues if needed, but we'll stick to env first
    const token = typeof window !== "undefined" ? localStorage.getItem("bearer_token") : null;

    const headers: Record<string, string> = {};
    
    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    // Only set Content-Type if there's a body and it's not FormData
    if (options.body && !(options.body instanceof FormData)) {
        headers["Content-Type"] = "application/json";
    }

    const url = `${apiUrl}${path}`;
    
    try {
        return await fetch(url, {
            cache: 'no-store',
            ...options,
            credentials: "include",
            headers: {
                ...headers,
                ...(options.headers as Record<string, string> || {}),
            },
        });
    } catch (err) {
        // If localhost fails, try 127.0.0.1 as a last resort fallback
        if (apiUrl.includes('localhost')) {
            const fallbackUrl = url.replace('localhost', '127.0.0.1');
            try {
                return await fetch(fallbackUrl, {
                    cache: 'no-store',
                    ...options,
                    credentials: "include",
                    headers: {
                        ...headers,
                        ...(options.headers as Record<string, string> || {}),
                    },
                });
            } catch (secondErr) {
                throw secondErr;
            }
        }
        throw err;
    }
}
