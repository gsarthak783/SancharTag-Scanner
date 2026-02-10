import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { PhoneInput } from '../components/ui/PhoneInput';
import { MobileLayout } from '../layouts/MobileLayout';
import { InteractionService } from '../services/InteractionService';
import { AuthService } from '../services/AuthService';

export const LoginPage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { vehicleId, interactionId } = location.state || {}; // Retrieve interactionId
    const [step, setStep] = useState<'phone' | 'otp'>('phone');
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState('');
    const [testOtp, setTestOtp] = useState(''); // Store test OTP
    const [isLoading, setIsLoading] = useState(false);
    const [isResending, setIsResending] = useState(false);
    const [error, setError] = useState('');

    const handleSendOtp = async () => {
        if (phone.length < 10) return;
        setIsLoading(true);
        setError('');

        try {
            const response = await AuthService.sendOtp(phone);
            if (response.success) {
                console.log('OTP Sent:', response.otp);
                if (response.otp) setTestOtp(response.otp);
                setStep('otp');
            } else {
                setError(response.message || 'Failed to send OTP');
            }
        } catch (err: any) {
            console.error('Error sending OTP:', err);
            setError(err.response?.data?.message || 'Failed to send OTP');
        } finally {
            setIsLoading(false);
        }
    };

    const handleResendOtp = async () => {
        setIsResending(true);
        setError('');
        setOtp('');

        try {
            const response = await AuthService.sendOtp(phone);
            if (response.success) {
                console.log('OTP Resent:', response.otp);
                if (response.otp) setTestOtp(response.otp);
            } else {
                setError(response.message || 'Failed to resend OTP');
            }
        } catch (err: any) {
            console.error('Error resending OTP:', err);
            setError(err.response?.data?.message || 'Failed to resend OTP');
        } finally {
            setIsResending(false);
        }
    };

    const handleVerifyOtp = async () => {
        if (otp.length < 6) return;
        setIsLoading(true);
        setError('');

        try {
            const response = await AuthService.verifyOtp(phone, otp);

            if (response.success) {
                // On success, update the interaction with the verified phone number
                if (interactionId) {
                    await InteractionService.updateInteraction(interactionId, {
                        'scanner.phoneNumber': phone,
                        // Optionally update status or other fields
                    });
                } else {
                    console.warn('No interactionId found during login. Skipping update.');
                }

                navigate('/contact', { state: { vehicleId, interactionId } });
            } else {
                setError('Invalid OTP');
            }
        } catch (err: any) {
            console.error('Login failed:', err);
            setError(err.response?.data?.message || 'Invalid OTP. Please try again.');
        } finally {
            setIsLoading(false);
        }
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
                            : <span className="flex flex-col">
                                <span>Enter the code sent to <span className="font-bold text-primary">{phone}</span></span>
                                {testOtp && (
                                    <span className="mt-4 bg-yellow-100 px-4 py-2 rounded-lg border border-yellow-200 text-yellow-800 text-xs font-bold text-center inline-block">
                                        TEST OTP: <span className="text-lg">{testOtp}</span>
                                    </span>
                                )}
                            </span>
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
                                placeholder="• • • • • •"
                                type="text"
                                className="text-center text-3xl font-bold tracking-[0.5em] h-16 bg-surface border-transparent focus:border-text-primary focus:bg-background transition-all"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                autoFocus
                                maxLength={6}
                            />
                            {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                            <div className="flex justify-end">
                                <button
                                    onClick={handleResendOtp}
                                    disabled={isResending}
                                    className={`text-sm font-medium text-text-secondary hover:text-text-primary transition-colors ${isResending ? 'opacity-50' : ''}`}
                                >
                                    {isResending ? 'Resending...' : 'Resend Code?'}
                                </button>
                            </div>
                        </div>
                    )}

                    <Button
                        fullWidth
                        size="lg"
                        isLoading={isLoading}
                        onClick={step === 'phone' ? handleSendOtp : handleVerifyOtp}
                        disabled={isLoading || (step === 'phone' ? phone.length < 10 : otp.length < 6)}
                        className="h-14 text-lg font-bold shadow-none rounded-xl"
                    >
                        {isLoading ? (step === 'phone' ? 'Generating...' : 'Verifying...') : (step === 'phone' ? 'Get OTP' : 'Verify OTP')}
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
