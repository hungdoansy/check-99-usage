import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

// https://vite.dev/config/
export default defineConfig({
    plugins: [tailwindcss(), react()],
    // Replaces the vite-tsconfig-paths plugin: Vite 8 resolves the "@/*" alias
    // from tsconfig natively.
    resolve: {
        tsconfigPaths: true,
    },
    server: {
        port: 5120,
    },
    define: {
        __BUILD_TIME__: String(Date.now()),
    },
})
