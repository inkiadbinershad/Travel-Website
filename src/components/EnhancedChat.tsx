import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Brain, Send, Shield, Zap } from 'lucide-react';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  neuroState?: {
    coherence: number;
    complexity: number;
    resonance: number;
  };
}

interface NeuroFractalState {
  coherence: number;
  complexity: number;
  resonance: number;
  adaptationLevel: number;
}

const EnhancedChat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [neuroState, setNeuroState] = useState<NeuroFractalState>({
    coherence: 0.8,
    complexity: 0.6,
    resonance: 0.7,
    adaptationLevel: 0.5
  });
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    // Simulate AI response with NeuroFractal processing
    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: `Réponse NeuroFractal: ${inputMessage}. État: Cohérence ${neuroState.coherence.toFixed(2)}, Complexité ${neuroState.complexity.toFixed(2)}`,
        sender: 'ai',
        timestamp: new Date(),
        neuroState: {
          coherence: Math.random() * 0.3 + 0.7,
          complexity: Math.random() * 0.4 + 0.4,
          resonance: Math.random() * 0.3 + 0.6
        }
      };

      setMessages(prev => [...prev, aiMessage]);
      setIsLoading(false);

      // Update NeuroFractal state
      setNeuroState(prev => ({
        ...prev,
        coherence: Math.min(1, prev.coherence + 0.01),
        complexity: Math.min(1, prev.complexity + 0.005),
        resonance: Math.min(1, prev.resonance + 0.008),
        adaptationLevel: Math.min(1, prev.adaptationLevel + 0.002)
      }));
    }, 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Sidebar with NeuroFractal State */}
      <div className="w-80 bg-black/20 backdrop-blur-sm border-r border-white/10 p-6">
        <div className="flex items-center gap-2 mb-6">
          <Brain className="w-8 h-8 text-purple-400" />
          <h2 className="text-xl font-bold text-white">NeuroFractal Chat</h2>
        </div>

        <Card className="bg-black/30 border-white/10 mb-6">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Shield className="w-5 h-5" />
              État Cognitif
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm text-gray-300 mb-1">
                <span>Cohérence</span>
                <span>{(neuroState.coherence * 100).toFixed(0)}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div
                  className="bg-purple-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${neuroState.coherence * 100}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm text-gray-300 mb-1">
                <span>Complexité</span>
                <span>{(neuroState.complexity * 100).toFixed(0)}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${neuroState.complexity * 100}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm text-gray-300 mb-1">
                <span>Résonance</span>
                <span>{(neuroState.resonance * 100).toFixed(0)}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${neuroState.resonance * 100}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm text-gray-300 mb-1">
                <span>Adaptation</span>
                <span>{(neuroState.adaptationLevel * 100).toFixed(0)}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div
                  className="bg-yellow-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${neuroState.adaptationLevel * 100}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-black/30 border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Zap className="w-5 h-5" />
              Fonctionnalités
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Badge variant="secondary" className="bg-purple-500/20 text-purple-300">
                Chiffrement Quantique
              </Badge>
              <Badge variant="secondary" className="bg-blue-500/20 text-blue-300">
                Auto-optimisation
              </Badge>
              <Badge variant="secondary" className="bg-green-500/20 text-green-300">
                Apprentissage Continu
              </Badge>
              <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-300">
                Monitoring Temps Réel
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        <div className="flex-1 p-6">
          <ScrollArea className="h-full" ref={scrollAreaRef}>
            <div className="space-y-4">
              {messages.length === 0 && (
                <div className="text-center text-gray-400 mt-20">
                  <Brain className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg">Bienvenue dans NeuroFractal Chat</p>
                  <p className="text-sm">Commencez une conversation pour explorer les états neuronaux</p>
                </div>
              )}

              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      message.sender === 'user'
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-700 text-gray-100'
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                    {message.neuroState && (
                      <div className="mt-2 text-xs text-gray-300">
                        <div>C: {message.neuroState.coherence.toFixed(2)}</div>
                        <div>X: {message.neuroState.complexity.toFixed(2)}</div>
                        <div>R: {message.neuroState.resonance.toFixed(2)}</div>
                      </div>
                    )}
                    <p className="text-xs opacity-70 mt-1">
                      {message.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-700 text-gray-100 px-4 py-2 rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" />
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse delay-75" />
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse delay-150" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Input Area */}
        <div className="p-6 border-t border-white/10 bg-black/20 backdrop-blur-sm">
          <div className="flex gap-2">
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Tapez votre message NeuroFractal..."
              className="flex-1 bg-black/30 border-white/20 text-white placeholder-gray-400"
              disabled={isLoading}
            />
            <Button
              onClick={handleSendMessage}
              disabled={isLoading || !inputMessage.trim()}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedChat;
