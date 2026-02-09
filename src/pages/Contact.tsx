import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Phone, MessageCircle, AlertTriangle, LogOut, Car } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { MobileLayout } from '../layouts/MobileLayout';
import { VehicleService, type VehicleDetails } from '../services/VehicleService';
import { CallModal } from '../components/CallModal';
import Logo from '../assets/SancharTagLogo.png';

export const ContactPage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { vehicleId } = location.state || {};
    const [vehicle, setVehicle] = useState<VehicleDetails | null>(null);
    const [showEmergencyModal, setShowEmergencyModal] = useState(false);
    const [showCallModal, setShowCallModal] = useState(false);

    useEffect(() => {
        if (vehicleId) {
            VehicleService.getDetails(vehicleId)
                .then(setVehicle)
                .catch(console.error);
        }
    }, [vehicleId]);


    return (
        <MobileLayout className="p-6">
            <div className="flex flex-col items-center mt-8 mb-8">
                <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm border border-border overflow-hidden p-1">
                    <img src={Logo} alt="Sanchar Tag" className="w-full h-full object-cover rounded-full" />
                </div>

                {vehicle ? (
                    <div className="text-center animate-fade-in">
                        <h1 className="text-2xl font-bold text-text-primary mb-1 tracking-tight">
                            {vehicle.ownerName}
                        </h1>
                        <div className="inline-flex items-center mt-2 bg-surface border border-border px-4 py-1.5 rounded-full shadow-sm">
                            <Car className="w-4 h-4 text-text-primary mr-2" />
                            <span className="text-sm font-bold text-text-primary font-mono tracking-wide">{vehicle.vehicleNumber}</span>
                        </div>
                        {vehicle.notes && (
                            <div className="mt-4 max-w-xs mx-auto">
                                <p className="text-text-secondary text-sm italic relative px-6 py-2">
                                    <span className="absolute top-0 left-0 text-3xl text-primary/10 font-serif leading-none">"</span>
                                    {vehicle.notes}
                                    <span className="absolute bottom-0 right-0 text-3xl text-primary/10 font-serif leading-none">"</span>
                                </p>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="text-center animate-pulse">
                        <div className="h-6 w-32 bg-slate-200 rounded mx-auto mb-2"></div>
                        <div className="h-4 w-24 bg-slate-200 rounded mx-auto"></div>
                    </div>
                )}
            </div>

            <div className="space-y-4 flex-1 animate-fade-in animate-delay-200">
                <div className="grid grid-cols-2 gap-4">
                    <Button
                        variant="primary"
                        size="lg"
                        leftIcon={<Phone size={20} />}
                        onClick={() => setShowCallModal(true)}
                        className="h-24 flex-col gap-2 text-base shadow-lg shadow-primary/20 hover:-translate-y-1 transition-transform"
                    >
                        Call
                    </Button>

                    <Button
                        variant="glass"
                        size="lg"
                        leftIcon={<MessageCircle size={20} />}
                        onClick={() => {
                            const interactionId = localStorage.getItem('currentInteractionId');
                            navigate('/chat', {
                                state: {
                                    interactionId,
                                    vehicleId,
                                    ownerName: vehicle?.ownerName
                                }
                            });
                        }}
                        className="h-24 flex-col gap-2 text-base text-text-primary bg-white/80 border-white/50 hover:bg-white hover:-translate-y-1 transition-transform shadow-sm"
                    >
                        Chat
                    </Button>
                </div>

                <div className="pt-6 mt-6 border-t border-border/50 space-y-3">
                    {vehicle?.showEmergencyContact && vehicle?.emergencyContact && (
                        <Button
                            fullWidth
                            variant="destructive"
                            className="justify-start pl-4 group transition-all duration-300 hover:shadow-red-200 hover:shadow-lg"
                            leftIcon={<AlertTriangle size={18} className="group-hover:animate-bounce" />}
                            onClick={() => setShowEmergencyModal(true)}
                        >
                            Emergency Contact
                        </Button>
                    )}

                    <Button
                        fullWidth
                        variant="ghost"
                        className="justify-start pl-4 text-text-secondary hover:text-text-primary"
                        leftIcon={<LogOut size={18} />}
                        onClick={() => navigate('/')}
                    >
                        End Session
                    </Button>
                </div>
            </div>

            <div className="text-center pb-2 pt-4">
                <p className="text-[10px] text-text-secondary uppercase tracking-widest opacity-50">Secure Connection</p>
            </div>

            {/* Emergency Modal */}
            {showEmergencyModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in">
                    <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-xl border-l-4 border-red-500">
                        <div className="flex flex-col items-center text-center mb-6">
                            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                                <AlertTriangle size={32} className="text-red-500" />
                            </div>
                            <h2 className="text-xl font-bold text-gray-900">Emergency Call</h2>
                            <p className="text-gray-600 mt-2 text-sm">
                                This number is strictly for emergencies. Any misuse of this feature will lead to serious actions and account restrictions.
                            </p>
                        </div>

                        <div className="flex gap-3">
                            <Button
                                fullWidth
                                variant="ghost"
                                onClick={() => setShowEmergencyModal(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                fullWidth
                                variant="destructive"
                                onClick={() => {
                                    window.location.href = `tel:${vehicle?.emergencyContact}`;
                                    setShowEmergencyModal(false);
                                }}
                            >
                                Call Now
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            <CallModal
                isOpen={showCallModal}
                onClose={() => setShowCallModal(false)}
                userId={vehicle?.userId || ''}
                ownerName={vehicle?.ownerName || 'Owner'}
                vehicleNumber={vehicle?.vehicleNumber}
                interactionId={localStorage.getItem('currentInteractionId')}
                socketUrl="https://sanchartag-server.onrender.com"
            />
        </MobileLayout>
    );
};
