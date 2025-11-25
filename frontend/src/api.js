import axios from 'axios';

// In production, this should be an environment variable
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const API_URL = `${BASE_URL}/api`;

export const downloadPost = async (url) => {
    try {
        const response = await axios.post(`${API_URL}/download`, { url });
        return response.data;
    } catch (error) {
        if (error.response) {
            throw new Error(error.response.data.detail || 'Failed to download post');
        } else if (error.request) {
            throw new Error('No response from server. Is the backend running?');
        } else {
            throw new Error('Error setting up request');
        }
    }
};
