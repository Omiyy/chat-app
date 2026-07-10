import axios from 'axios'

/**
 * Pre-configured Axios instance for authenticated API requests.
 * - baseURL: from VITE_BACKEND_URL env variable
 * - withCredentials: always true (sends HttpOnly cookies)
 * - Response interceptor: redirects to /email on 401 responses
 */
const api = axios.create({
    baseURL: import.meta.env.VITE_BACKEND_URL,
    withCredentials: true,
})

// Response interceptor — handle 401 globally
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Clear local auth state
            localStorage.removeItem('token')

            // Redirect to login page (avoid redirect loops if already on auth pages)
            const currentPath = window.location.pathname
            const publicPaths = ['/', '/email', '/password', '/register', '/forgot-password']
            if (!publicPaths.includes(currentPath)) {
                window.location.href = '/email'
            }
        }
        return Promise.reject(error)
    }
)

export default api
