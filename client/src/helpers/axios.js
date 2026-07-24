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

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve();
    }
  })
  failedQueue = [];
}

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        
        if (error.response?.status === 401 && !originalRequest._retry && originalRequest.url !== '/api/refresh-token') {
            if (isRefreshing) {
                return new Promise(function(resolve, reject) {
                    failedQueue.push({resolve, reject})
                }).then(() => {
                    return api(originalRequest);
                }).catch(err => {
                    return Promise.reject(err);
                })
            }
            
            originalRequest._retry = true;
            isRefreshing = true;
            
            try {
                await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/refresh-token`, {}, { withCredentials: true })
                
                processQueue(null);
                return api(originalRequest);
            } catch (refreshError) {
                processQueue(refreshError);
                
                localStorage.removeItem('token')
                const currentPath = window.location.pathname
                const publicPaths = ['/', '/email', '/password', '/register', '/forgot-password']
                if (!publicPaths.includes(currentPath)) {
                    window.location.href = '/email'
                }
                return Promise.reject(refreshError)
            } finally {
                isRefreshing = false;
            }
        }
        
        return Promise.reject(error)
    }
)

export default api
