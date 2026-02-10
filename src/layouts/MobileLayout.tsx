import React from 'react';

interface MobileLayoutProps {
    children: React.ReactNode;
    className?: string;
}

export const MobileLayout: React.FC<MobileLayoutProps> = ({ children, className = '' }) => {
    return (
        <div className={`min-h-screen w-full bg-background text-text-primary font-sans antialiased selection:bg-black/10 flex flex-col relative ${className}`}>
            {/* Subtle premium gradient at top */}
            <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-surface to-transparent opacity-50 pointer-events-none" />

            {/* Content */}
            <div className="relative z-10 flex flex-col flex-1 w-full h-full">
                {children}
            </div>
        </div>
    );
};
