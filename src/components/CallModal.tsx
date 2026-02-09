import React, { useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { Mic, MicOff, PhoneOff } from 'lucide-react';

interface CallModalProps {
    isOpen: boolean;
    onClose: () => void;
    userId: string; // The owner's user ID to call
    ownerName: string;
    socketUrl: string; // 'https://sanchartag-server.onrender.com'
}

const STUN_SERVERS = {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:global.stun.twilio.com:3478' }
    ],
};

export const CallModal: React.FC<CallModalProps> = ({ isOpen, onClose, userId, ownerName, socketUrl }) => {
    const [callStatus, setCallStatus] = useState<'calling' | 'connected' | 'ended' | 'failed'>('calling');
    const [isMuted, setIsMuted] = useState(false);
    const [statusMessage, setStatusMessage] = useState('Calling...');

    const socketRef = useRef<Socket | null>(null);
    const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
    const localStreamRef = useRef<MediaStream | null>(null);
    const remoteAudioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        if (!isOpen) return;

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

                socketRef.current.on('connect', () => {
                    console.log('Socket connected for call');
                    // We don't need to join a room per se, we just need to emit to the user
                    // But maybe we should join our own room to receive answer? 
                    // No, server emits to socket.id.
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
                            to: userId, // Send to Owner (Wait, owner listens on their socket ID?) 
                            // Issue: We emit to `userId` room on server for `callUser`. 
                            // But for ICE, we need to send to the specific socket ID of the Owner.
                            // The `callUser` payload sends `from: socket.id`.
                            // The Owner will reply. 
                            candidate: event.candidate,
                        });
                    }
                };

                // Note: The server ICE handler expects `to` to be a socket ID or room.
                // If we send to `userId`, it broadcasts to all owner's capabilities? 
                // That might cause loops if multiple devices?
                // For now, let's assume `userId` works for ICE too as generic routing if the server supports it?
                // Server code: `io.to(to).emit(...)`. `userId` is a room. It should work.

                // 4. Create Offer
                const offer = await pc.createOffer();
                await pc.setLocalDescription(offer);

                // 5. Emit Call
                socketRef.current.emit('callUser', {
                    userToCall: userId, // This is the 'room' name for the owner
                    signalData: offer,
                    from: socketRef.current.id,
                    name: 'Scanner',
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

            } catch (err) {
                console.error('Error starting call:', err);
                setCallStatus('failed');
                setStatusMessage('Failed to access microphone or connect.');
            }
        };

        startCall();

        return () => {
            endCall();
        };
    }, [isOpen, userId, socketUrl]);

    const endCall = (emit: boolean = true) => {
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
                // socketRef.current.emit('endCall', { to: userId }); // Should strictly send to specific socket?
                // If we send to userId room, it's fine.
                socketRef.current.emit('endCall', { to: userId });
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

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 animate-fade-in backdrop-blur-sm">
            <div className="bg-background rounded-3xl w-full max-w-sm p-8 shadow-2xl border border-white/10 flex flex-col items-center">

                {/* Profile / Avatar */}
                <div className="w-24 h-24 rounded-full bg-secondary/50 flex items-center justify-center mb-6 ring-4 ring-primary/20">
                    <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center overflow-hidden">
                        <span className="text-3xl font-bold text-primary">{ownerName.charAt(0)}</span>
                    </div>
                </div>

                <h2 className="text-2xl font-bold text-text-primary mb-2 line-clamp-1">{ownerName}</h2>
                <p className={`text-sm font-medium mb-8 ${callStatus === 'connected' ? 'text-green-500' :
                        callStatus === 'failed' ? 'text-destructive' : 'text-text-secondary animate-pulse'
                    }`}>
                    {statusMessage}
                </p>

                {/* Hidden Audio Element */}
                <audio ref={remoteAudioRef} autoPlay />

                {/* Controls */}
                <div className="flex items-center gap-6 w-full justify-center">
                    <button
                        onClick={toggleMute}
                        disabled={callStatus !== 'connected'}
                        className={`p-4 rounded-full transition-all ${isMuted
                                ? 'bg-white text-black hover:bg-gray-200'
                                : 'bg-secondary text-text-primary hover:bg-secondary/80'
                            } ${callStatus !== 'connected' ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
                    </button>

                    <button
                        onClick={() => {
                            endCall();
                            onClose();
                        }}
                        className="p-4 rounded-full bg-destructive text-white hover:bg-destructive/90 transition-all hover:scale-105 shadow-lg shadow-destructive/30"
                    >
                        <PhoneOff size={28} />
                    </button>

                </div>
            </div>
        </div>
    );
};
