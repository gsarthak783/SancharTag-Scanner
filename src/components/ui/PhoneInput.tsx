import React from 'react';
import { PhoneInput as ReactPhoneInput } from 'react-international-phone';
import 'react-international-phone/style.css';

interface PhoneInputProps {
    value: string;
    onChange: (phone: string) => void;
    className?: string; // Allow overriding the container style if needed
}

export const PhoneInput: React.FC<PhoneInputProps> = ({ value, onChange, className }) => {
    return (
        <div className={`w-full ${className}`}>
            <style>{`
                .react-international-phone-input-container {
                    width: 100%;
                }
                .react-international-phone-country-selector-button {
                    height: 3.5rem !important; /* h-14 */
                    border-radius: 0.75rem 0 0 0.75rem !important; /* rounded-l-xl */
                    border-color: transparent !important;
                    background-color: var(--color-surface) !important;
                    transition: all 0.2s;
                    padding-left: 1rem !important;
                }
                .react-international-phone-country-selector-button:hover {
                    background-color: var(--color-surface) !important;
                }
                
                .react-international-phone-input {
                    height: 3.5rem !important; /* h-14 */
                    width: 100% !important;
                    border-radius: 0 0.75rem 0.75rem 0 !important; /* rounded-r-xl */
                    border-color: transparent !important;
                    background-color: var(--color-surface) !important;
                    font-size: 1.25rem !important; /* text-xl */
                    font-weight: 500 !important;
                    color: var(--color-text-primary) !important;
                    padding-left: 1rem !important;
                    transition: all 0.2s;
                }
                .react-international-phone-input:focus {
                    background-color: var(--color-background) !important;
                    border: 1px solid var(--color-text-primary) !important;
                    outline: none !important;
                }
                /* When input focuses, highlight the country selector too if possible, 
                   or just let them look seamless together */
            `}</style>

            <ReactPhoneInput
                defaultCountry="in"
                value={value}
                onChange={onChange}
                forceDialCode={true}
                placeholder="98765 43210"
            /* We rely on global CSS override above for strict styling to match our design system */
            />
        </div>
    );
};
