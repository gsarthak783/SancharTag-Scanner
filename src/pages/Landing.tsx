import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Logo from '../assets/SancharTagLogo.png';
import { ArrowRight, User, FileText, Car, Shield } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { MobileLayout } from '../layouts/MobileLayout';
import { VehicleService, type VehicleDetails } from '../services/VehicleService';

export const LandingPage: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const [vehicle, setVehicle] = useState<VehicleDetails | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (id) {
            setLoading(true);
            VehicleService.getDetails(id)
                .then(data => setVehicle(data))
                .catch(console.error)
                .finally(() => setLoading(false));
        }
    }, [id]);

    return (
        <MobileLayout className="p-6 justify-between">
            <div className="flex flex-col items-center mt-12 text-center w-full flex-1">
                <div className="mb-8 animate-fade-in relative">
                    <div className="absolute inset-0 bg-surface blur-2xl rounded-full scale-110" />
                    <img src={Logo} alt="Sanchar Tag Logo" className="w-28 h-28 object-contain relative z-10 drop-shadow-sm" />
                </div>

                <h1 className="text-3xl font-bold text-text-primary mb-2 font-sans tracking-tight animate-fade-in animate-delay-100">
                    Sanchar Tag
                </h1>
                <p className="text-text-secondary mb-8 text-sm max-w-[260px] animate-fade-in animate-delay-100">
                    Instant, secure communication with vehicle owners.
                </p>

                {loading ? (
                    <div className="w-full h-32 glass rounded-2xl flex items-center justify-center animate-pulse">
                        <span className="text-text-secondary text-sm">Scanning vehicle...</span>
                    </div>
                ) : vehicle ? (
                    <div className="w-full glass-card rounded-2xl p-6 mb-8 text-left shadow-lg animate-fade-in animate-delay-200 transform transition-all hover:scale-[1.02]">
                        <div className="flex items-center justify-between mb-4 pb-4 border-b border-border/50">
                            <div>
                                <p className="text-xs text-text-secondary uppercase tracking-wider font-semibold mb-1">Vehicle Number</p>
                                <div className="flex items-center">
                                    <Car className="w-5 h-5 text-accent mr-2" />
                                    <span className="font-bold text-xl text-text-primary font-mono">{vehicle.vehicleNumber}</span>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-start p-3 bg-secondary/50 rounded-xl">
                                <User className="w-5 h-5 text-text-secondary mt-0.5 mr-3" />
                                <div>
                                    <p className="text-xs text-text-secondary uppercase tracking-wider font-semibold">Owner</p>
                                    <p className="text-text-primary font-semibold text-lg">{vehicle.ownerName}</p>
                                </div>
                            </div>

                            {vehicle.notes && (
                                <div className="flex items-start p-3 bg-amber-50/50 border border-amber-100/50 rounded-xl">
                                    <FileText className="w-5 h-5 text-amber-500 mt-0.5 mr-3" />
                                    <div>
                                        <p className="text-xs text-amber-600/80 uppercase tracking-wider font-semibold">Note</p>
                                        <p className="text-text-primary text-sm italic leading-relaxed">"{vehicle.notes}"</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="w-full glass p-6 rounded-2xl border border-white/20 shadow-sm mb-8 animate-fade-in animate-delay-200">
                        <p className="text-text-secondary text-sm leading-relaxed">
                            Scan a Sanchar Tag to securely contact the vehicle owner without revealing your personal number.
                        </p>
                    </div>
                )}

                <div className="mt-autow-full">
                    <div className="flex items-start gap-3 p-4 rounded-xl bg-slate-100/50 border border-slate-200/50 text-left animate-fade-in animate-delay-300">
                        <span className="text-lg flex items-center justify-center text-primary"><Shield size={20} /></span>
                        <p className="text-xs text-text-secondary leading-relaxed">
                            <span className="font-semibold text-text-primary block mb-0.5">Privacy First</span>
                            Your secure session is logged for safety. Harassment is strictly prohibited.
                        </p>
                    </div>
                </div>
            </div>

            <div className="mb-8">
                <Button
                    fullWidth
                    size="lg"
                    onClick={() => navigate('/login', { state: { vehicleId: id } })}
                    rightIcon={<ArrowRight size={20} />}
                    className="shadow-lg shadow-primary/20"
                >
                    {vehicle ? 'Contact Owner' : 'Continue'}
                </Button>
            </div>
        </MobileLayout>
    );
};
