import axios from 'axios';

const API_URL = 'https://sanchartag-server.onrender.com';

export interface OtpResponse {
    success: boolean;
    otp?: string; // For testing
    message: string;
    isNewUser?: boolean;
    user?: any;
}

export const AuthService = {
    sendOtp: async (phoneNumber: string): Promise<OtpResponse> => {
        try {
            const response = await axios.post(`${API_URL}/auth/send-otp`, { phoneNumber });
            return response.data;
        } catch (error) {
            console.error('Error sending OTP:', error);
            throw error;
        }
    },

    verifyOtp: async (phoneNumber: string, otp: string): Promise<OtpResponse> => {
        try {
            const response = await axios.post(`${API_URL}/auth/verify-otp`, { phoneNumber, otp });
            return response.data;
        } catch (error) {
            console.error('Error verifying OTP:', error);
            throw error;
        }
    }
};
