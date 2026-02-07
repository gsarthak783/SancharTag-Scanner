import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertTriangle } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { MobileLayout } from '../layouts/MobileLayout';

const REASONS = [
    'Harassment',
    'Spam',
    'Abuse',
    'Other'
];

export const ReportPage: React.FC = () => {
    const navigate = useNavigate();
    const [selectedReason, setSelectedReason] = useState<string>('');
    const [description, setDescription] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = () => {
        if (!selectedReason) return;

        setIsSubmitting(true);
        // Simulate API call
        setTimeout(() => {
            setIsSubmitting(false);
            alert('Report submitted successfully. Ticket ID: #VG-1234');
            navigate('/end');
        }, 1500);
    };

    return (
        <MobileLayout className="p-6">
            <div className="pt-4 mb-6 flex items-center">
                <button
                    onClick={() => navigate(-1)}
                    className="p-2 -ml-2 text-text-secondary hover:text-text-primary hover:bg-white/50 rounded-full transition-colors mr-2"
                >
                    <ArrowLeft size={24} />
                </button>
                <h1 className="text-2xl font-bold text-text-primary tracking-tight">Report Issue</h1>
            </div>

            <div className="flex-1 space-y-6 animate-fade-in">
                <div className="bg-amber-50/80 backdrop-blur-sm border border-amber-100 p-4 rounded-xl flex items-start shadow-sm">
                    <AlertTriangle className="text-amber-600 w-5 h-5 mr-3 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-amber-800 leading-relaxed font-medium">
                        Reports are taken seriously. Please provide accurate details to help us maintain a safe community.
                    </p>
                </div>

                <div className="glass-card p-5 rounded-2xl shadow-sm space-y-4">
                    <label className="block text-sm font-semibold text-text-secondary uppercase tracking-wider">
                        Select Reason
                    </label>
                    <div className="grid grid-cols-1 gap-3">
                        {REASONS.map((reason) => (
                            <button
                                key={reason}
                                onClick={() => setSelectedReason(reason)}
                                className={`w-full p-4 rounded-xl text-left transition-all duration-200 font-medium flex items-center justify-between group cursor-pointer ${selectedReason === reason
                                    ? 'bg-primary text-primary-foreground shadow-md transform scale-[1.02]'
                                    : 'bg-white/50 hover:bg-white text-text-primary border border-transparent hover:border-slate-200'
                                    }`}
                            >
                                {reason}
                                {selectedReason === reason && (
                                    <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="glass-card p-5 rounded-2xl shadow-sm space-y-2">
                    <label className="block text-sm font-semibold text-text-secondary uppercase tracking-wider mb-2">
                        Description (Optional)
                    </label>
                    <textarea
                        className="w-full p-4 rounded-xl border border-input bg-white/50 backdrop-blur-sm text-text-primary focus:ring-2 focus:ring-ring focus:outline-none min-h-[120px] resize-none transition-all placeholder:text-text-secondary/50 font-sans"
                        placeholder="Please describe the issue..."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />
                </div>
            </div>

            <div className="mt-6 animate-fade-in animate-delay-200">
                <Button
                    fullWidth
                    size="lg"
                    variant="destructive"
                    onClick={() => handleSubmit()}
                    isLoading={isSubmitting}
                    disabled={!selectedReason}
                    className="shadow-lg shadow-red-500/20"
                >
                    Submit Report
                </Button>
            </div>
        </MobileLayout>
    );
};
