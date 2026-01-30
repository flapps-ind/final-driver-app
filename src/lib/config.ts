
export const BACKEND_CONFIG = {
    BASE_URL: 'https://lifelink-responder-network.vercel.app',
    API_ENDPOINTS: {
        ALERTS: '/api/dispatch/alert', // Assuming this might be the path based on local one
        ACCEPT: '/api/emergencies/accept',
        ARRIVE: '/api/emergencies/arrive',
        COMPLETE: '/api/emergencies/complete',
        DECLINE: '/api/emergencies/decline',
    },
    POLLING_INTERVAL: 5000,
};
