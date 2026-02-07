import React from 'react';

interface MobileLayoutProps {
    children: React.ReactNode;
    className?: string;
}

export const MobileLayout: React.FC<MobileLayoutProps> = ({ children, className = '' }) => {
    return (
        <div className="min-h-screen bg-surface flex justify-center text-text-primary font-sans antialiased selection:bg-black/10">
            <div className={`w-full max-w-md min-h-screen shadow-2xl flex flex-col relative overflow-hidden bg-background border-x border-border ${className}`}>
                {/* Subtle premium gradient at top */}
                <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-surface to-transparent opacity-50 pointer-events-none" />

                {/* Content */}
                <div className="relative z-10 flex flex-col flex-1 h-full">
                    {children}
                </div>
            </div>
        </div>
    );
};
