import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
    baseURL: import.meta.env.VITE_API_URL.replace(/\/api$/, ""), // backend better-auth server URL
    fetchOptions: {
        credentials: "include"
    }
});
