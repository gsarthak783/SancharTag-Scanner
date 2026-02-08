import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { io, Socket } from 'socket.io-client';
import { ArrowLeft, Send, Flag, X, CheckCircle } from 'lucide-react';
import { MobileLayout } from '../layouts/MobileLayout';
import { InteractionService } from '../services/InteractionService';
import axios from 'axios';

const SOCKET_URL = 'https://sanchartag-server.vercel.app';
const API_URL = 'https://sanchartag-server.vercel.app';

const REPORT_CATEGORIES = [
    'Harassment',
    'Spam',
    'Fake Vehicle Info',
    'Threatening Behavior',
    'Privacy Concern',
    'Other'
];

interface Message {
    messageId: string;
    senderId: string;
    text: string;
    timestamp: Date;
    isRead: boolean;
}

export const ChatPage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { interactionId, ownerName } = location.state || {};

    const [messages, setMessages] = useState<Message[]>([]);
    const [inputText, setInputText] = useState('');
    const [isConnected, setIsConnected] = useState(false);
    const [chatStatus, setChatStatus] = useState<'active' | 'resolved' | 'reported'>('active');
    const [showReportModal, setShowReportModal] = useState(false);
    const [reportCategory, setReportCategory] = useState('');
    const [reportDescription, setReportDescription] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const socketRef = useRef<Socket | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Scroll to bottom when messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Socket connection
    useEffect(() => {
        if (!interactionId) {
            navigate('/');
            return;
        }

        const socket = io(SOCKET_URL, {
            transports: ['websocket', 'polling'],
        });
        socketRef.current = socket;

        socket.on('connect', async () => {
            console.log('Socket connected:', socket.id);
            setIsConnected(true);
            socket.emit('join_room', interactionId);

            // Fetch existing messages and status
            try {
                const response = await axios.get(`${API_URL}/interactions?interactionId=${interactionId}`);
                if (response.data && response.data.length > 0) {
                    const interaction = response.data[0];
                    setMessages(interaction.messages || []);
                    setChatStatus(interaction.status as 'active' | 'resolved' | 'reported');
                }
            } catch (err) {
                console.error('Failed to fetch interaction:', err);
            }

            // Update interaction type to 'chat' if still active
            try {
                await InteractionService.updateInteraction(interactionId, { contactType: 'chat' });
            } catch (err) {
                console.error('Failed to update interaction type:', err);
            }
        });

        socket.on('receive_message', (message: Message) => {
            setMessages((prev) => [...prev, message]);
        });

        socket.on('session_ended', (data: { status: string }) => {
            setChatStatus(data.status as 'active' | 'resolved' | 'reported');
        });

        socket.on('disconnect', () => {
            console.log('Socket disconnected');
            setIsConnected(false);
        });

        socket.on('error', (error: { message: string }) => {
            console.error('Socket error:', error.message);
        });

        return () => {
            socket.emit('leave_room', interactionId);
            socket.disconnect();
        };
    }, [interactionId, navigate]);

    const handleSend = () => {
        if (!inputText.trim() || !socketRef.current || !isConnected || chatStatus !== 'active') return;

        socketRef.current.emit('send_message', {
            interactionId,
            text: inputText.trim(),
            senderId: 'scanner',
        });

        setInputText('');
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleEndSession = () => {
        if (!socketRef.current || chatStatus !== 'active') return;
        socketRef.current.emit('end_session', { interactionId, endedBy: 'scanner' });
    };

    const handleReportSubmit = async () => {
        if (!reportCategory || isSubmitting) return;
        setIsSubmitting(true);

        try {
            await axios.post(`${API_URL}/reports`, {
                interactionId,
                reportedBy: 'scanner',
                category: reportCategory,
                description: reportDescription
            });

            socketRef.current?.emit('report_submitted', { interactionId, reportedBy: 'scanner' });
            setShowReportModal(false);
            setChatStatus('reported');
        } catch (err) {
            console.error('Failed to submit report:', err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const isActive = chatStatus === 'active';

    return (
        <MobileLayout className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center gap-3 p-4 border-b border-border bg-white/80 backdrop-blur-sm">
                <button
                    onClick={() => navigate(-1)}
                    className="p-2 -ml-2 rounded-full hover:bg-surface transition-colors"
                >
                    <ArrowLeft size={20} className="text-text-primary" />
                </button>
                <div className="flex-1">
                    <h1 className="font-semibold text-text-primary">{ownerName || 'Vehicle Owner'}</h1>
                    <p className="text-xs text-text-secondary">
                        {!isActive ? (
                            <span className={`capitalize ${chatStatus === 'reported' ? 'text-red-500' : 'text-amber-500'}`}>
                                {chatStatus}
                            </span>
                        ) : isConnected ? (
                            <span className="flex items-center gap-1">
                                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                Online
                            </span>
                        ) : (
                            'Connecting...'
                        )}
                    </p>
                </div>
                {isActive && (
                    <div className="flex gap-2">
                        <button
                            onClick={() => setShowReportModal(true)}
                            className="p-2 rounded-full hover:bg-red-50 text-red-500 transition-colors"
                            title="Report"
                        >
                            <Flag size={18} />
                        </button>
                        <button
                            onClick={handleEndSession}
                            className="px-3 py-1.5 text-xs bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors"
                        >
                            End Session
                        </button>
                    </div>
                )}
                {chatStatus === 'resolved' && (
                    <button
                        onClick={() => setShowReportModal(true)}
                        className="p-2 rounded-full hover:bg-red-50 text-red-500 transition-colors"
                        title="Report"
                    >
                        <Flag size={18} />
                    </button>
                )}
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gradient-to-b from-surface/50 to-white">
                {messages.length === 0 && (
                    <div className="text-center text-text-secondary text-sm py-8">
                        <p>No messages yet.</p>
                        <p className="text-xs mt-1">Start the conversation!</p>
                    </div>
                )}
                {messages.map((msg) => (
                    <div
                        key={msg.messageId}
                        className={`flex ${msg.senderId === 'scanner' ? 'justify-end' : 'justify-start'}`}
                    >
                        <div
                            className={`max-w-[75%] px-4 py-2.5 rounded-2xl shadow-sm ${msg.senderId === 'scanner'
                                ? 'bg-primary text-white rounded-br-md'
                                : 'bg-white text-text-primary border border-border/50 rounded-bl-md'
                                }`}
                        >
                            <p className="text-sm leading-relaxed">{msg.text}</p>
                            <p className={`text-[10px] mt-1 ${msg.senderId === 'scanner' ? 'text-white/70' : 'text-text-secondary'}`}>
                                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />

                {/* Status Banner */}
                {!isActive && (
                    <div className={`text-center py-3 px-4 rounded-lg ${chatStatus === 'reported' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                        <CheckCircle size={16} className="inline mr-2" />
                        Chat session has been {chatStatus}.
                    </div>
                )}
            </div>

            {/* Input - Only show if active */}
            {isActive && (
                <div className="p-4 border-t border-border bg-white">
                    <div className="flex items-center gap-2">
                        <input
                            type="text"
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Type a message..."
                            className="flex-1 px-4 py-3 bg-surface rounded-full border border-border focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 text-sm transition-all"
                        />
                        <button
                            onClick={handleSend}
                            disabled={!inputText.trim() || !isConnected}
                            className="p-3 bg-primary text-white rounded-full shadow-lg shadow-primary/30 hover:bg-primary-dark disabled:opacity-50 disabled:shadow-none transition-all hover:scale-105 active:scale-95"
                        >
                            <Send size={18} />
                        </button>
                    </div>
                </div>
            )}

            {/* Report Modal */}
            {showReportModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-xl">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-bold text-text-primary">Report Issue</h2>
                            <button onClick={() => setShowReportModal(false)} className="p-1 hover:bg-surface rounded-full">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-2">Category *</label>
                                <select
                                    value={reportCategory}
                                    onChange={(e) => setReportCategory(e.target.value)}
                                    className="w-full px-4 py-3 border border-border rounded-xl bg-surface focus:outline-none focus:border-primary"
                                >
                                    <option value="">Select a category</option>
                                    {REPORT_CATEGORIES.map((cat) => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-2">Description</label>
                                <textarea
                                    value={reportDescription}
                                    onChange={(e) => setReportDescription(e.target.value)}
                                    placeholder="Describe the issue (optional)"
                                    rows={3}
                                    className="w-full px-4 py-3 border border-border rounded-xl bg-surface focus:outline-none focus:border-primary resize-none"
                                />
                            </div>

                            <button
                                onClick={handleReportSubmit}
                                disabled={!reportCategory || isSubmitting}
                                className="w-full py-3 bg-red-500 text-white rounded-xl font-semibold hover:bg-red-600 disabled:opacity-50 transition-colors"
                            >
                                {isSubmitting ? 'Submitting...' : 'Submit Report'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </MobileLayout>
    );
};
