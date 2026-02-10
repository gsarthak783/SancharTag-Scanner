import React, { useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { Mic, MicOff, PhoneOff, Volume2, VolumeX } from 'lucide-react';

interface CallModalProps {
    isOpen: boolean;
    onClose: () => void;
    userId: string; // The owner's user ID to call
    ownerName: string;
    vehicleNumber?: string;
    interactionId?: string | null;
    socketUrl: string; // 'https://sanchartag-server.onrender.com'
}

const STUN_SERVERS = {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:global.stun.twilio.com:3478' }
    ],
};

export const CallModal: React.FC<CallModalProps> = ({ isOpen, onClose, userId, ownerName, vehicleNumber, interactionId, socketUrl }) => {
    const [callStatus, setCallStatus] = useState<'calling' | 'connected' | 'ended' | 'failed'>('calling');
    const [isMuted, setIsMuted] = useState(false);
    const [isSpeakerOn, setIsSpeakerOn] = useState(false);
    const [statusMessage, setStatusMessage] = useState('Calling...');

    const [seconds, setSeconds] = useState(0);

    const socketRef = useRef<Socket | null>(null);
    const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
    const localStreamRef = useRef<MediaStream | null>(null);
    const remoteAudioRef = useRef<HTMLAudioElement | null>(null);
    const timerRef = useRef<any>(null);

    // Timer Logic
    useEffect(() => {
        if (callStatus === 'connected') {
            timerRef.current = setInterval(() => {
                setSeconds(prev => prev + 1);
            }, 1000);
        } else {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
            if (callStatus === 'calling' || callStatus === 'failed') {
                setSeconds(0);
            }
        }
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [callStatus]);

    const formatTime = (totalSeconds: number) => {
        const mins = Math.floor(totalSeconds / 60);
        const secs = totalSeconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    useEffect(() => {
        if (!isOpen) {
            setSeconds(0);
            return;
        }

        console.log('Starting call to:', userId);
        setCallStatus('calling');
        setStatusMessage('Connecting...');

        const startCall = async () => {
            try {
                // 1. Get Local Stream (Microphone)
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                localStreamRef.current = stream;

                // 2. Initialize Socket
                socketRef.current = io(socketUrl, {
                    transports: ['websocket', 'polling'],
                });

                await new Promise<void>((resolve, reject) => {
                    if (socketRef.current?.connected) {
                        resolve();
                        return;
                    }

                    const timeout = setTimeout(() => {
                        reject(new Error('Socket connection timeout'));
                    }, 10000);

                    socketRef.current?.once('connect', () => {
                        clearTimeout(timeout);
                        console.log('Socket connected for call, ID:', socketRef.current?.id);
                        resolve();
                    });

                    socketRef.current?.once('connect_error', (err) => {
                        clearTimeout(timeout);
                        reject(err);
                    });
                });

                // 3. Initialize Peer Connection
                const pc = new RTCPeerConnection(STUN_SERVERS);
                peerConnectionRef.current = pc;

                // Add local tracks to peer connection
                stream.getTracks().forEach((track) => {
                    pc.addTrack(track, stream);
                });

                // Handle remote stream
                pc.ontrack = (event) => {
                    console.log('Remote stream received');
                    if (remoteAudioRef.current && event.streams[0]) {
                        remoteAudioRef.current.srcObject = event.streams[0];
                    }
                };

                // Handle ICE candidates
                pc.onicecandidate = (event) => {
                    if (event.candidate && socketRef.current) {
                        socketRef.current.emit('iceCandidate', {
                            to: userId,
                            candidate: event.candidate,
                        });
                    }
                };

                // 4. Create Offer
                const offer = await pc.createOffer();
                await pc.setLocalDescription(offer);

                console.log('Emitting callUser with ID:', socketRef.current?.id);

                // 5. Emit Call
                socketRef.current.emit('callUser', {
                    userToCall: userId,
                    signalData: offer,
                    from: socketRef.current?.id,
                    name: 'Scanner',
                    vehicleNumber,
                    interactionId
                });

                // 6. Listen for Answer
                socketRef.current.on('callAccepted', async (signal) => {
                    console.log('Call accepted!');
                    setCallStatus('connected');
                    setStatusMessage('Connected');
                    if (pc.signalingState !== 'stable') {
                        await pc.setRemoteDescription(new RTCSessionDescription(signal));
                    }
                });

                // Listen for ICE candidates from Owner
                socketRef.current.on('iceCandidate', async (data) => {
                    if (data.candidate && pc) {
                        try {
                            await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
                        } catch (e) {
                            console.error("Error adding received ice candidate", e);
                        }
                    }
                });

                socketRef.current.on('callEnded', () => {
                    endCall(false); // End without emitting (received from remote)
                    setStatusMessage('Call Ended');
                    setTimeout(onClose, 2000);
                });

                // Set status to calling after everything is ready
                setCallStatus('calling');
                setStatusMessage('Calling...');

            } catch (err: any) {
                console.error('Error starting call:', err);
                setCallStatus('failed');

                if (err.name === 'NotFoundError' || err.message?.includes('device not found')) {
                    setStatusMessage('No microphone found. Please connect one.');
                } else if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
                    setStatusMessage('Microphone permission denied. Please allow access.');
                } else {
                    setStatusMessage('Failed to access microphone or connect.');
                }
            }
        };

        startCall();

        return () => {
            endCall();
        };
    }, [isOpen, userId, socketUrl, vehicleNumber, interactionId]);

    const endCall = (emit: boolean = true) => {
        if (timerRef.current) clearInterval(timerRef.current);

        // Cleanup Media
        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach((track) => track.stop());
            localStreamRef.current = null;
        }

        // Cleanup Peer
        if (peerConnectionRef.current) {
            peerConnectionRef.current.close();
            peerConnectionRef.current = null;
        }

        // Cleanup Socket
        if (socketRef.current) {
            if (emit) {
                socketRef.current.emit('endCall', { to: userId, interactionId });
            }
            socketRef.current.disconnect();
            socketRef.current = null;
        }

        setCallStatus('ended');
    };

    const toggleMute = () => {
        if (localStreamRef.current) {
            localStreamRef.current.getAudioTracks().forEach(track => {
                track.enabled = !track.enabled;
            });
            setIsMuted(!isMuted);
        }
    };

    const toggleSpeaker = async () => {
        if (!remoteAudioRef.current) return;
        const audioEl = remoteAudioRef.current as any;

        if (typeof audioEl.setSinkId !== 'function') {
            console.warn('setSinkId not supported');
            setIsSpeakerOn(!isSpeakerOn);
            return;
        }

        try {
            setIsSpeakerOn(!isSpeakerOn);
        } catch (err) {
            console.error('Error toggling speaker:', err);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-gray-900 z-[100] flex flex-col items-center justify-between p-8 text-white animate-fade-in">
            {/* Background Gradient */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/50 pointer-events-none" />

            {/* Top Info */}
            <div className="relative z-10 w-full flex flex-col items-center mt-12 space-y-4">
                <div className="flex items-center gap-2 bg-white/10 px-4 py-1.5 rounded-full backdrop-blur-md">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-xs font-medium tracking-wide text-white/90">End-to-End Encrypted</span>
                </div>

                <h2 className="text-3xl font-bold tracking-tight">{ownerName}</h2>
                <div className="text-lg font-medium text-white/80">
                    {callStatus === 'connected' ? formatTime(seconds) : statusMessage}
                </div>
            </div>

            {/* Avatar / Visualizer */}
            <div className="relative z-10 flex-1 flex items-center justify-center w-full">
                <div className="relative">
                    {/* Ripple Effects when calling/talking */}
                    {(callStatus === 'calling' || (callStatus === 'connected' && !isMuted)) && (
                        <>
                            <div className="absolute inset-0 rounded-full border border-white/20 animate-[ping_2s_linear_infinite]" />
                            <div className="absolute inset-0 rounded-full border border-white/10 animate-[ping_3s_linear_infinite_0.5s]" />
                        </>
                    )}

                    <div className="w-40 h-40 rounded-full bg-gradient-to-br from-gray-700 to-gray-600 flex items-center justify-center shadow-2xl ring-4 ring-white/10">
                        <span className="text-6xl font-bold text-white/90">{ownerName.charAt(0)}</span>
                    </div>
                </div>
            </div>

            {/* Hidden Audio */}
            <audio ref={remoteAudioRef} autoPlay />

            {/* Bottom Controls */}
            <div className="relative z-10 w-full max-w-sm mb-12">
                <div className="flex items-center justify-center gap-8 bg-black/20 backdrop-blur-lg p-6 rounded-3xl border border-white/5">
                    {/* Speaker */}
                    <button
                        onClick={toggleSpeaker}
                        disabled={callStatus !== 'connected'}
                        className={`p-4 rounded-full transition-all duration-200 ${isSpeakerOn
                            ? 'bg-white text-black hover:bg-gray-200'
                            : 'bg-white/10 text-white hover:bg-white/20'
                            } ${callStatus !== 'connected' ? 'opacity-40' : ''}`}
                    >
                        {isSpeakerOn ? <Volume2 size={28} /> : <VolumeX size={28} />}
                    </button>

                    {/* Mute */}
                    <button
                        onClick={toggleMute}
                        disabled={callStatus !== 'connected'}
                        className={`p-4 rounded-full transition-all duration-200 ${isMuted
                            ? 'bg-white text-black hover:bg-gray-200'
                            : 'bg-white/10 text-white hover:bg-white/20'
                            } ${callStatus !== 'connected' ? 'opacity-40' : ''}`}
                    >
                        {isMuted ? <MicOff size={28} /> : <Mic size={28} />}
                    </button>

                    {/* End Call */}
                    <button
                        onClick={() => {
                            endCall();
                            onClose();
                        }}
                        className="p-4 rounded-full bg-red-500 text-white hover:bg-red-600 transition-all transform hover:scale-105 shadow-lg shadow-red-500/30"
                    >
                        <PhoneOff size={28} />
                    </button>
                </div>
            </div>
        </div>
    );
};
