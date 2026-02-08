import axios from 'axios';

const API_URL = 'http://192.168.0.135:5000';

export interface ScannerDetails {
    userAgent?: string;
    ip?: string; // Server side mainly, but can send if we have it
    screenResolution?: string;
    language?: string;
    platform?: string;
    phoneNumber?: string;
    capturedAt?: Date;
    city?: string;
    region?: string;
    country?: string;
    isp?: string;
}

export interface CreateInteractionRequest {
    interactionId: string;
    vehicleId: string;
    userId: string;
    type?: string; // Default 'Scan'
    contactType?: 'scan' | 'chat' | 'call';
    scanner: ScannerDetails;
}

export const InteractionService = {
    createInteraction: async (data: CreateInteractionRequest) => {
        try {
            const response = await axios.post(`${API_URL}/interactions`, data);
            return response.data;
        } catch (error) {
            console.error('Error creating interaction:', error);
            throw error;
        }
    },

    updateInteraction: async (interactionId: string, updates: any) => {
        try {
            const response = await axios.patch(`${API_URL}/interactions/${interactionId}`, updates);
            return response.data;
        } catch (error) {
            console.error('Error updating interaction:', error);
            throw error;
        }
    },

    getMessages: async (interactionId: string) => {
        try {
            const response = await axios.get(`${API_URL}/interactions?interactionId=${interactionId}`);
            if (response.data && response.data.length > 0) {
                return response.data[0].messages || [];
            }
            return [];
        } catch (error) {
            console.error('Error fetching messages:', error);
            throw error;
        }
    }
};
