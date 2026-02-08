import axios from 'axios';

export interface VehicleDetails {
    id: string; // Internal/MongoDB ID or custom ID
    vehicleId: string; // Explicit vehicleId from schema
    userId: string; // Owner's User ID
    ownerName: string;
    notes: string;
    vehicleNumber: string;
    tagId: string;
}

// Ensure this matches your local network IP if testing on device, or localhost for web
const API_URL = 'https://sanchartag-server.vercel.app';

export const VehicleService = {
    getDetails: async (tagId: string): Promise<VehicleDetails | null> => {
        try {
            console.log(`Fetching vehicle with tagId: ${tagId}`);
            const response = await axios.get(`${API_URL}/vehicles?tagId=${encodeURIComponent(tagId)}`);

            const vehicles = response.data;
            if (Array.isArray(vehicles) && vehicles.length > 0) {
                const vehicle = vehicles[0];
                return {
                    id: vehicle._id || vehicle.id,
                    vehicleId: vehicle.vehicleId,
                    userId: vehicle.userId,
                    ownerName: vehicle.ownerName || 'Unknown Owner',
                    notes: vehicle.notes || '',
                    vehicleNumber: vehicle.vehicleNumber,
                    tagId: vehicle.tagId
                };
            }
            return null;
        } catch (error) {
            console.error('Error fetching vehicle details:', error);
            return null;
        }
    }
};
