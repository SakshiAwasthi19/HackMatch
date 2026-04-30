import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
    baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001",
    fetchOptions: {
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
 * Uses the bearer token stored by better-auth.
 */
export async function apiFetch(path: string, options: RequestInit = {}) {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
    const token = typeof window !== "undefined" ? localStorage.getItem("bearer_token") : null;

    const headers: Record<string, string> = {};
    
    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    // Don't set Content-Type for FormData (browser sets it with boundary)
    if (!(options.body instanceof FormData)) {
        headers["Content-Type"] = "application/json";
    }

    return fetch(`${apiUrl}${path}`, {
        ...options,
        headers: {
            ...headers,
            ...(options.headers as Record<string, string> || {}),
        },
    });
}
