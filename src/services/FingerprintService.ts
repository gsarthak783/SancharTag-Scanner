import axios from 'axios';

export interface UserFingerprint {
    ip: string;
    city: string;
    region: string;
    country: string;
    userAgent: string;
    platform: string;
    language: string;
    screenResolution: string;
    timezone: string;
    capturedAt: string;
}

export const FingerprintService = {
    getDeviceDetails: (): Partial<UserFingerprint> => {
        return {
            userAgent: navigator.userAgent,
            platform: navigator.platform,
            language: navigator.language,
            screenResolution: `${window.screen.width}x${window.screen.height}`,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            capturedAt: new Date().toISOString(),
        };
    },

    getNetworkDetails: async (): Promise<Partial<UserFingerprint>> => {
        try {
            // Using a public IP API. In production, this might be handled by the backend 
            // or a dedicated service to avoid rate limits and ensure reliability.
            const response = await axios.get('https://ipapi.co/json/');
            return {
                ip: response.data.ip,
                city: response.data.city,
                region: response.data.region,
                country: response.data.country_name,
            };
        } catch (error) {
            console.error('Failed to fetch network details:', error);
            return {
                ip: 'unknown',
                city: 'unknown',
                region: 'unknown',
                country: 'unknown',
            };
        }
    },

    capture: async (): Promise<UserFingerprint> => {
        const deviceDetails = FingerprintService.getDeviceDetails();
        const networkDetails = await FingerprintService.getNetworkDetails();

        return {
            ip: networkDetails.ip || 'unknown',
            city: networkDetails.city || 'unknown',
            region: networkDetails.region || 'unknown',
            country: networkDetails.country || 'unknown',
            userAgent: deviceDetails.userAgent || 'unknown',
            platform: deviceDetails.platform || 'unknown',
            language: deviceDetails.language || 'unknown',
            screenResolution: deviceDetails.screenResolution || 'unknown',
            timezone: deviceDetails.timezone || 'unknown',
            capturedAt: deviceDetails.capturedAt || new Date().toISOString(),
        };
    }
};
