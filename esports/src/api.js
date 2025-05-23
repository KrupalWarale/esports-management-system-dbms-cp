import axios from 'axios';

// Create a base axios instance that can be reused throughout the app
const api = axios.create({
    baseURL: 'http://localhost:8080',
    // You can add other default settings here
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json'
    }
});

export default api; 