'use client';

import { useState } from 'react';
import { Sparkles, ArrowRight, Plus } from 'lucide-react';
import ChatInterface from '@/components/ChatInterface';
import Header from '@/components/Header';
import CollectionCard from '@/components/CollectionCard';
import EditorialProductCard from '@/components/EditorialProductCard';

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

interface Collection {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  itemCount: number;
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showChat, setShowChat] = useState(false);

  const collections: Collection[] = [
    {
      id: '1',
      title: 'The Minimalist',
      subtitle: 'For those who appreciate restraint',
      image: 'https://images.unsplash.com/photo-1595814432314-90095f342694?w=1200&h=800&fit=crop',
      itemCount: 12,
    },
    {
      id: '2',
      title: 'Makers & Craft',
      subtitle: 'Hand-made objects with stories',
      image: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=1200&h=800&fit=crop',
      itemCount: 18,
    },
    {
      id: '3',
      title: 'The Home Edit',
      subtitle: 'Thoughtful pieces for living spaces',
      image: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=1200&h=800&fit=crop',
      itemCount: 24,
    },
  ];

  const featuredProducts: Product[] = [
    {
      id: '1',
      title: 'Ceramic Sake Set',
      price: 185.00,
      image: 'https://images.unsplash.com/photo-1578500494198-246f612d3b3d?w=800&h=1000&fit=crop',
      merchant: 'Atelier Ceramics',
      category: 'Tableware',
      description: 'Hand-thrown stoneware with natural glaze variations',
    },
    {
      id: '2',
      title: 'Brass Desk Set',
      price: 240.00,
      image: 'https://images.unsplash.com/photo-1611269154421-4e27233ac5c7?w=800&h=1000&fit=crop',
      merchant: 'Workshop',
      category: 'Office',
      description: 'Precision-machined brass with patina finish',
    },
    {
      id: '3',
      title: 'Linen Throw',
      price: 295.00,
      image: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=800&h=1000&fit=crop',
      merchant: 'Textile Studio',
      category: 'Home',
      description: 'Belgian linen, naturally dyed and stone-washed',
    },
    {
      id: '4',
      title: 'Glass Carafe',
      price: 165.00,
      image: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=800&h=1000&fit=crop',
      merchant: 'Glassworks',
      category: 'Barware',
      description: 'Mouth-blown borosilicate glass',
    },
  ];

  const simulateAIResponse = (userMessage: string): Message => {
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes('mom') || lowerMessage.includes('mother') || 
        lowerMessage.includes('home') || lowerMessage.includes('cozy')) {
      return {
        id: Date.now().toString(),
        role: 'assistant',
        content: "Based on your description, I've selected pieces that balance warmth with refinement. Each object has been chosen for its tactile quality and enduring design.",
        products: [
          {
            id: '1',
            title: 'Ceramic Sake Set',
            price: 185.00,
            image: 'https://images.unsplash.com/photo-1578500494198-246f612d3b3d?w=800&h=1000&fit=crop',
            merchant: 'Atelier Ceramics',
            category: 'Tableware',
          },
          {
            id: '3',
            title: 'Linen Throw',
            price: 295.00,
            image: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=800&h=1000&fit=crop',
            merchant: 'Textile Studio',
            category: 'Home',
          },
        ],
        timestamp: new Date(),
      };
    }
    
    return {
      id: Date.now().toString(),
      role: 'assistant',
      content: "I'd like to understand more about who you're selecting for. What draws them? What do they value in the objects around them?",
      timestamp: new Date(),
    };
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    setTimeout(() => {
      const aiResponse = simulateAIResponse(input);
      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1400);
  };

  const handleStartChat = () => {
    setShowChat(true);
    setMessages([{
      id: '1',
      role: 'assistant',
      content: "Welcome. I'm here to help you discover objects that resonate. Tell me about the person you're thinking of.",
      timestamp: new Date(),
    }]);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header onStartChat={handleStartChat} />
      
      {/* Hero Section */}
      <div className="border-b">
        <div className="max-w-7xl mx-auto px-8 py-20">
          <div className="max-w-3xl mx-auto text-center space-y-8">
            <div className="space-y-4">
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                Issue No. 01 — Winter 2026
              </p>
              <h1 className="text-6xl md:text-7xl font-serif font-light leading-[1.1] tracking-tight">
                The Gift Edit
              </h1>
              <p className="text-lg text-muted-foreground font-light max-w-xl mx-auto leading-relaxed">
                A curated journal of objects worth giving. Discover pieces selected for their craft, purpose, and the stories they tell.
              </p>
            </div>
            
            {!showChat ? (
              <button
                onClick={handleStartChat}
                className="inline-flex items-center space-x-2 px-6 py-3 bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-sm tracking-wide"
              >
                <Sparkles className="w-4 h-4" />
                <span>Begin Conversation</span>
              </button>
            ) : (
              <div className="pt-4">
                <ChatInterface
                  messages={messages}
                  input={input}
                  setInput={setInput}
                  isTyping={isTyping}
                  onSend={handleSend}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Featured Collections */}
      <div className="border-b">
        <div className="max-w-7xl mx-auto px-8 py-20">
          <div className="flex items-end justify-between mb-12">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-3">
                Curated Collections
              </p>
              <h2 className="text-4xl font-serif font-light">
                Edited by theme
              </h2>
            </div>
            <button className="text-sm flex items-center space-x-2 hover:opacity-60 transition-opacity">
              <span>View all collections</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {collections.map((collection) => (
              <CollectionCard key={collection.id} collection={collection} />
            ))}
          </div>
        </div>
      </div>

      {/* Editorial Grid */}
      <div className="max-w-7xl mx-auto px-8 py-20">
        <div className="mb-12">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-3">
            This Month's Selection
          </p>
          <h2 className="text-4xl font-serif font-light mb-4">
            Objects of intention
          </h2>
          <p className="text-muted-foreground max-w-2xl leading-relaxed">
            Each piece in this collection has been chosen for its relationship between form and function. 
            These are objects designed to last, made by artisans who understand their materials.
          </p>
        </div>

        {/* Asymmetric Editorial Layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Large Feature */}
          <div className="md:col-span-8">
            <EditorialProductCard product={featuredProducts[0]} featured />
          </div>
          
          {/* Small Feature */}
          <div className="md:col-span-4">
            <EditorialProductCard product={featuredProducts[1]} />
          </div>
          
          {/* Two Medium */}
          <div className="md:col-span-6">
            <EditorialProductCard product={featuredProducts[2]} />
          </div>
          <div className="md:col-span-6">
            <EditorialProductCard product={featuredProducts[3]} />
          </div>
        </div>
      </div>

      {/* Editorial Footer */}
      <div className="border-t">
        <div className="max-w-7xl mx-auto px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div>
              <h3 className="text-sm font-medium mb-4">About</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                The Gift Edit is a curated platform connecting thoughtful givers with objects of lasting value.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium mb-4">Subscribe</h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                Receive our monthly edit of new discoveries and seasonal collections.
              </p>
              <div className="flex">
                <input
                  type="email"
                  placeholder="Email address"
                  className="flex-1 px-4 py-2 bg-background border text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                />
                <button className="px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-medium mb-4">Follow</h3>
              <div className="flex space-x-4 text-sm text-muted-foreground">
                <button className="hover:text-foreground transition-colors">Instagram</button>
                <button className="hover:text-foreground transition-colors">Pinterest</button>
                <button className="hover:text-foreground transition-colors">Twitter</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
