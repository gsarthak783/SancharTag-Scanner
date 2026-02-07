import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { MobileLayout } from '../layouts/MobileLayout';

export const EndSessionPage: React.FC = () => {
    const navigate = useNavigate();

    return (
        <MobileLayout className="p-6 justify-center items-center text-center">
            <div className="mb-8 animate-in zoom-in duration-500">
                <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-6 mx-auto">
                    <CheckCircle size={48} />
                </div>
                <h1 className="text-2xl font-bold text-text-primary mb-2">
                    Session Ended
                </h1>
                <p className="text-text-secondary">
                    Thank you for using Vehicle Genie.
                    <br />
                    Your session has been securely closed.
                </p>
            </div>

            <div className="w-full max-w-xs">
                <Button
                    fullWidth
                    variant="outline"
                    onClick={() => navigate('/')}
                >
                    Return to Home
                </Button>
            </div>
        </MobileLayout>
    );
};
