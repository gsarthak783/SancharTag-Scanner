import axios from 'axios';
import type { ScannerDetails } from './InteractionService';

const API_KEY = '739bb0b00840467583bef8704b03ff73';

export type UserFingerprint = ScannerDetails;

export const FingerprintService = {
    capture: async (): Promise<Partial<ScannerDetails>> => {
        const details: Partial<ScannerDetails> = {
            userAgent: navigator.userAgent,
            screenResolution: `${window.screen.width}x${window.screen.height}`,
            language: navigator.language,
            platform: navigator.platform,
            capturedAt: new Date(),
            ip: '',
            city: '',
            region: '',
            country: '',
            isp: ''
        };

        try {
            console.log('FingerprintService: Fetching geolocation...');
            // Single call to get IP and Location directly
            // Using the standard endpoint which usually returns flat data, but handling the user's nested structure just in case
            const response = await axios.get(`https://api.ipgeolocation.io/ipgeo?apiKey=${API_KEY}`);
            const geoData = response.data;
            console.log('FingerprintService: Geolocation fetched:', geoData);

            details.ip = geoData.ip;

            // Handle both flat (standard) and nested (user-reported) response structures
            const location = geoData.location || geoData;

            details.city = location.city;
            details.region = location.state_prov || location.district || location.region;
            details.country = location.country_name;
            details.isp = geoData.isp || geoData.organization; // ISP usually at root or org

        } catch (error) {
            console.error('FingerprintService: Error fetching fingerprint/location:', error);
            // Return what we have (browser details) even if network calls fail
        }

        return details;
    }
};
