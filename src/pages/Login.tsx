import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { PhoneInput } from '../components/ui/PhoneInput';
import { MobileLayout } from '../layouts/MobileLayout';

export const LoginPage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [step, setStep] = useState<'phone' | 'otp'>('phone');
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSendOtp = () => {
        if (phone.length < 10) return;
        setIsLoading(true);
        // Simulate API call
        setTimeout(() => {
            setIsLoading(false);
            setStep('otp');
        }, 1500);
    };

    const handleVerifyOtp = () => {
        if (otp.length < 4) return;
        setIsLoading(true);
        // Simulate API call
        setTimeout(() => {
            setIsLoading(false);
            navigate('/contact', { state: location.state });
        }, 1500);
    };

    return (
        <MobileLayout className="p-8 justify-center min-h-screen">
            <div className="mb-auto pt-8">
                {step === 'otp' && (
                    <button
                        onClick={() => setStep('phone')}
                        className="flex items-center text-text-secondary hover:text-text-primary transition-colors mb-6 group"
                    >
                        <ArrowLeft size={20} className="mr-1 group-hover:-translate-x-1 transition-transform" />
                        <span className="font-medium">Back</span>
                    </button>
                )}
            </div>

            <div className="w-full max-w-sm mx-auto mb-12 animate-fade-in">
                <div className="mb-10">
                    <h1 className="text-4xl font-bold text-text-primary mb-3 font-sans tracking-tight">
                        {step === 'phone' ? 'Log in' : 'Verify log in'}
                    </h1>
                    <p className="text-text-secondary text-lg leading-relaxed">
                        {step === 'phone'
                            ? 'Please enter your mobile number to continue.'
                            : `Enter the verification code sent to ${phone}`
                        }
                    </p>
                </div>

                <div className="space-y-8">
                    {step === 'phone' ? (
                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-text-primary uppercase tracking-wider ml-1">
                                Mobile Number
                            </label>
                            <PhoneInput
                                value={phone}
                                onChange={(phone) => setPhone(phone)}
                                className="mb-2"
                            />
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <label className="block text-sm font-semibold text-text-primary uppercase tracking-wider ml-1">
                                One-Time Password
                            </label>
                            <Input
                                placeholder="• • • •"
                                type="text"
                                className="text-center text-3xl font-bold tracking-[0.5em] h-16 bg-surface border-transparent focus:border-text-primary focus:bg-background transition-all"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                autoFocus
                            />
                            <div className="flex justify-end">
                                <button className="text-sm font-medium text-text-secondary hover:text-text-primary transition-colors">
                                    Resend Code?
                                </button>
                            </div>
                        </div>
                    )}

                    <Button
                        fullWidth
                        size="lg"
                        isLoading={isLoading}
                        onClick={step === 'phone' ? handleSendOtp : handleVerifyOtp}
                        disabled={step === 'phone' ? phone.length < 10 : otp.length < 4}
                        className="h-14 text-lg font-bold shadow-none rounded-xl"
                    >
                        {step === 'phone' ? 'Continue' : 'Verify'}
                    </Button>
                </div>
            </div>

            <div className="mt-auto pb-8 text-center opacity-40">
                <p className="text-xs font-medium">
                    Secure Log In • Sanchar Tag
                </p>
            </div>
        </MobileLayout>
    );
};
