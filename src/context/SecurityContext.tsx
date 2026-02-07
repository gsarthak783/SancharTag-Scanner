import React, { createContext, useContext, useState, useEffect } from 'react';
import { FingerprintService, type UserFingerprint } from '../services/FingerprintService';

interface SecurityContextType {
    fingerprint: UserFingerprint | null;
    isLoading: boolean;
}

const SecurityContext = createContext<SecurityContextType | undefined>(undefined);

export const SecurityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [fingerprint, setFingerprint] = useState<UserFingerprint | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const captureFingerprint = async () => {
            try {
                const data = await FingerprintService.capture();
                setFingerprint(data);
                console.log('Security Fingerprint Captured:', data);
            } catch (error) {
                console.error('Failed to capture security fingerprint:', error);
            } finally {
                setIsLoading(false);
            }
        };

        captureFingerprint();
    }, []);

    return (
        <SecurityContext.Provider value={{ fingerprint, isLoading }}>
            {children}
        </SecurityContext.Provider>
    );
};

export const useSecurity = () => {
    const context = useContext(SecurityContext);
    if (context === undefined) {
        throw new Error('useSecurity must be used within a SecurityProvider');
    }
    return context;
};
