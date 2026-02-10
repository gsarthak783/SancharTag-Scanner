import React, { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { CallModal } from '../components/CallModal';

const SOCKET_URL = 'https://sanchartag-server.onrender.com';

interface SocketContextType {
    socket: Socket | null;
    isConnected: boolean;
    interactionId: string | null;
    joinRoom: (id: string) => void;
    leaveRoom: () => void;
    startCall: (targetUserId: string) => void;
}

const SocketContext = createContext<SocketContextType>({
    socket: null,
    isConnected: false,
    interactionId: null,
    joinRoom: () => { },
    leaveRoom: () => { },
    startCall: () => { },
});

export const useSocket = () => useContext(SocketContext);

export const SocketProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [interactionId, setInteractionId] = useState<string | null>(localStorage.getItem('currentInteractionId'));

    // Call State
    const [showCallModal, setShowCallModal] = useState(false);
    const [incomingSignal, setIncomingSignal] = useState<any>(null);
    const [callTargetId, setCallTargetId] = useState<string>(''); // For outgoing
    const [callerName, setCallerName] = useState('Caller'); // For incoming
    const [callerId, setCallerId] = useState(''); // For incoming call target ID (my ID context?)

    // We need to store vehicle details for outgoing calls if initiated via context
    // Ideally, CallModal props should be flexible.
    // For now, let's focus on INCOMING calls support being global.

    const socketRef = useRef<Socket | null>(null);

    useEffect(() => {
        // Initialize socket if not exists
        if (!socketRef.current) {
            console.log('Initializing Global Socket...');
            const newSocket = io(SOCKET_URL, {
                transports: ['websocket', 'polling'],
                autoConnect: true,
            });
            socketRef.current = newSocket;
            setSocket(newSocket);

            newSocket.on('connect', () => {
                console.log('Global Socket Connected:', newSocket.id);
                setIsConnected(true);
                // Re-join room if interactionId exists
                if (interactionId) {
                    newSocket.emit('join_room', interactionId);
                }
            });

            newSocket.on('disconnect', () => {
                console.log('Global Socket Disconnected');
                setIsConnected(false);
            });

            // Global Call Listeners
            newSocket.on('callMade', (data: { signal: any; from: string; name: string }) => {
                console.log('Incoming call received in Global Context:', data);
                setIncomingSignal(data.signal);
                setCallerId(data.from); // This is the socket ID of caller
                setCallerName(data.name || 'Vehicle Owner');
                setShowCallModal(true);
            });
        }

        return () => {
            // cleanup? usually purely global context doesn't unmount, but good practice
        };
    }, []);

    // Handle interactionId changes
    useEffect(() => {
        const handleStorageChange = () => {
            const current = localStorage.getItem('currentInteractionId');
            if (current !== interactionId) {
                setInteractionId(current);
            }
        };

        window.addEventListener('storage', handleStorageChange);
        // Also check periodically? Or expose a setter?
        // Let's expose joinRoom which updates state.
        return () => window.removeEventListener('storage', handleStorageChange);
    }, [interactionId]);

    const joinRoom = (id: string) => {
        setInteractionId(id);
        localStorage.setItem('currentInteractionId', id);
        if (socketRef.current?.connected) {
            socketRef.current.emit('join_room', id);
        }
    };

    const leaveRoom = () => {
        if (interactionId && socketRef.current) {
            socketRef.current.emit('leave_room', interactionId);
        }
        setInteractionId(null);
        localStorage.removeItem('currentInteractionId');
    };

    const startCall = (targetUserId: string) => {
        setCallTargetId(targetUserId);
        setShowCallModal(true);
    };

    return (
        <SocketContext.Provider value={{
            socket,
            isConnected,
            interactionId,
            joinRoom,
            leaveRoom,
            startCall
        }}>
            {children}

            {/* Global Call Modal */}
            <CallModal
                isOpen={showCallModal}
                onClose={() => {
                    setShowCallModal(false);
                    setIncomingSignal(null);
                    setCallTargetId('');
                }}
                userId={incomingSignal ? callerId : callTargetId}
                ownerName={incomingSignal ? callerName : 'Owner'} // Or fetch from contact?
                interactionId={interactionId}
                socketUrl={SOCKET_URL}
                incomingSignal={incomingSignal}
            // Vehicle number might be missing for incoming calls if not stored contextually
            // We can fetch it or just omit it for incoming UI
            />
        </SocketContext.Provider>
    );
};
