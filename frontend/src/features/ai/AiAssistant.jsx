import React, { useState, useRef, useEffect } from 'react';
import apiClient from '../../api/apiClient';
import { Bot, User, Send, Loader2, Sparkles } from 'lucide-react';
import '../../components/shared.css';

const AiAssistant = () => {
    const [messages, setMessages] = useState([
        { id: 1, sender: 'bot', text: 'Hello! I am your AI Operations Assistant. I can check your leave balances, look up your assigned assets, or track your support tickets. How can I help you today?' }
    ]);
    const [inputMsg, setInputMsg] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const endOfMessagesRef = useRef(null);

    const scrollToBottom = () => {
        endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!inputMsg.trim()) return;

        const userMsg = { id: Date.now(), sender: 'user', text: inputMsg };
        setMessages(prev => [...prev, userMsg]);
        setInputMsg('');
        setIsTyping(true);
        try {
            const res = await apiClient.post('/ai/chat', { message: userMsg.text });
            
            const botMsg = { id: Date.now(), sender: 'bot', text: res.data.reply };
            setMessages(prev => [...prev, botMsg]);
        } catch (error) {
            const errorMsg = { id: Date.now(), sender: 'bot', text: 'Sorry, I am having trouble connecting to the server right now.' };
            setMessages(prev => [...prev, errorMsg]);
        } finally {
            setIsTyping(false);
        }
    };

    // Helper to render markdown-like bold syntax
    const renderMessage = (text) => {
        const parts = text.split(/(\*\*.*?\*\*)/g);
        return parts.map((part, i) => {
            if (part.startsWith('**') && part.endsWith('**')) {
                return <strong key={i} style={{ color: 'var(--primary)' }}>{part.slice(2, -2)}</strong>;
            }
            return <span key={i}>{part}</span>;
        });
    };

    return (
        <>
            <div className="page-header" style={{ marginBottom: 15 }}>
                <div className="page-header-left">
                    <h1 style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <Sparkles size={28} color="var(--primary)" /> 
                        Operations Assistant
                    </h1>
                    <p>Ask me about your leave balances, assigned assets, or open support tickets.</p>
                </div>
            </div>

            <div style={{
                display: 'flex',
                flexDirection: 'column',
                height: 'calc(100vh - 200px)',
                background: 'var(--bg-card)',
                borderRadius: 12,
                border: '1px solid var(--border)',
                overflow: 'hidden'
            }}>
                {/* Chat History */}
                <div style={{ flex: 1, padding: 20, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 20 }}>
                    {messages.map(msg => (
                        <div key={msg.id} style={{
                            display: 'flex',
                            gap: 15,
                            alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                            maxWidth: '80%',
                            flexDirection: msg.sender === 'user' ? 'row-reverse' : 'row'
                        }}>
                            <div style={{
                                width: 36, height: 36, borderRadius: '50%',
                                background: msg.sender === 'user' ? 'var(--primary)' : 'var(--bg-main)',
                                border: msg.sender === 'bot' ? '1px solid var(--border)' : 'none',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                flexShrink: 0
                            }}>
                                {msg.sender === 'user' ? <User size={18} color="#fff" /> : <Bot size={18} color="var(--primary)" />}
                            </div>
                            <div style={{
                                background: msg.sender === 'user' ? 'var(--primary)' : 'rgba(255,255,255,0.03)',
                                color: msg.sender === 'user' ? '#fff' : 'var(--text-main)',
                                padding: '12px 18px',
                                borderRadius: 12,
                                border: msg.sender === 'bot' ? '1px solid var(--border)' : 'none',
                                fontSize: 14,
                                lineHeight: '1.5',
                                whiteSpace: 'pre-wrap'
                            }}>
                                {renderMessage(msg.text)}
                            </div>
                        </div>
                    ))}
                    
                    {isTyping && (
                        <div style={{ display: 'flex', gap: 15, alignSelf: 'flex-start' }}>
                            <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--bg-main)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Bot size={18} color="var(--primary)" />
                            </div>
                            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '12px 18px', borderRadius: 12, border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10 }}>
                                <Loader2 size={16} className="spinner" style={{ animation: 'spin 1s linear infinite' }} />
                                <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>AI is thinking...</span>
                                <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
                            </div>
                        </div>
                    )}
                    <div ref={endOfMessagesRef} />
                </div>

                {/* Input Area */}
                <div style={{ padding: 20, borderTop: '1px solid var(--border)', background: 'rgba(0,0,0,0.2)' }}>
                    <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: 10 }}>
                        <input
                            type="text"
                            value={inputMsg}
                            onChange={e => setInputMsg(e.target.value)}
                            placeholder="Ask me anything..."
                            style={{
                                flex: 1,
                                padding: '14px 20px',
                                background: 'var(--bg-main)',
                                border: '1px solid var(--border)',
                                borderRadius: 24,
                                color: '#fff',
                                fontSize: 15,
                                outline: 'none'
                            }}
                            disabled={isTyping}
                        />
                        <button 
                            type="submit" 
                            disabled={isTyping || !inputMsg.trim()}
                            style={{
                                width: 50, height: 50,
                                borderRadius: '50%',
                                background: inputMsg.trim() ? 'var(--primary)' : 'var(--bg-main)',
                                color: '#fff',
                                border: 'none',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                cursor: inputMsg.trim() ? 'pointer' : 'not-allowed',
                                transition: 'all 0.2s'
                            }}
                        >
                            <Send size={18} style={{ marginLeft: -2, marginTop: 2 }} />
                        </button>
                    </form>
                </div>
            </div>
        </>
    );
};

export default AiAssistant;
