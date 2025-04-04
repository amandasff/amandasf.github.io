// Vite configuration file
// Basic setup for web development
// Optimizes build and development process

// Required imports for configuration
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// Main configuration object
// Defines how the application is built and served
export default defineConfig(({ mode }) => ({
  // Base URL for the application
  base: '/',
  
  // Development server configuration
  server: {
    // Allows external access to development server
    host: "::",
    // Development server port
    port: 8080,
  },
  
  // Build plugins and tools
  plugins: [
    // React plugin for development
    react(),
  ],
  
  // Module resolution settings
  resolve: {
    alias: {
      // Shortcut for src directory
      "@": path.resolve(__dirname, "./src"),
    },
  },
  
  // Production build configuration
  build: {
    // Output directory for built files
    outDir: 'dist',
    // Enable source maps for debugging
    sourcemap: true,
    // Directory for static assets
    assetsDir: 'assets',
    // Build optimization settings
    rollupOptions: {
      output: {
        manualChunks: {
          // Separate vendor dependencies
          vendor: ['react', 'react-dom'],
        }
      }
    }
  }
}));
// Configuration complete
