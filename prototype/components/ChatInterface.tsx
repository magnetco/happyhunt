import { Send, Sparkles, User } from 'lucide-react';
import { useRef, useEffect } from 'react';
import EditorialProductCard from './EditorialProductCard';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  products?: Product[];
  timestamp: Date;
}

interface Product {
  id: string;
  title: string;
  price: number;
  image: string;
  merchant: string;
  category: string;
  description?: string;
}

interface ChatInterfaceProps {
  messages: Message[];
  input: string;
  setInput: (value: string) => void;
  isTyping: boolean;
  onSend: () => void;
}

export default function ChatInterface({ messages, input, setInput, isTyping, onSend }: ChatInterfaceProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto border bg-card animate-fade-in">
      {/* Messages */}
      <div className="h-[500px] overflow-y-auto p-8 space-y-8 custom-scrollbar">
        {messages.map((message) => (
          <div key={message.id} className="space-y-6">
            <div className={`flex items-start space-x-4 ${message.role === 'user' ? 'justify-end' : ''}`}>
              {message.role === 'assistant' && (
                <div className="w-8 h-8 bg-primary flex items-center justify-center flex-shrink-0 mt-1">
                  <Sparkles className="w-4 h-4 text-primary-foreground" />
                </div>
              )}
              
              <div className={`max-w-lg ${message.role === 'user' ? 'text-right' : ''}`}>
                <div className={`inline-block px-5 py-3 text-sm leading-relaxed ${
                  message.role === 'assistant' 
                    ? 'bg-muted text-foreground' 
                    : 'bg-primary text-primary-foreground'
                }`}>
                  {message.content}
                </div>
              </div>

              {message.role === 'user' && (
                <div className="w-8 h-8 bg-secondary flex items-center justify-center flex-shrink-0 mt-1">
                  <User className="w-4 h-4 text-secondary-foreground" />
                </div>
              )}
            </div>

            {/* Product Recommendations */}
            {message.products && message.products.length > 0 && (
              <div className="grid grid-cols-2 gap-6 ml-12">
                {message.products.map((product) => (
                  <EditorialProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        ))}
        
        {isTyping && (
          <div className="flex items-start space-x-4">
            <div className="w-8 h-8 bg-primary flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-4 h-4 text-primary-foreground" />
            </div>
            <div className="bg-muted px-5 py-3">
              <div className="flex space-x-1.5">
                <div className="w-2 h-2 bg-muted-foreground/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-muted-foreground/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-muted-foreground/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t p-6">
        <div className="flex items-center space-x-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Describe who you're selecting for..."
            className="flex-1 px-4 py-3 bg-background border focus:outline-none focus:ring-1 focus:ring-ring text-sm"
          />
          <button
            onClick={onSend}
            disabled={!input.trim()}
            className="px-4 py-3 bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
