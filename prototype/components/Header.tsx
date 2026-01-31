import { Search, User, ShoppingBag, Sparkles } from 'lucide-react';

interface HeaderProps {
  onStartChat: () => void;
}

export default function Header({ onStartChat }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-7xl mx-auto px-8 h-20 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center space-x-12">
          <h1 className="text-xl font-serif tracking-tight">The Gift Edit</h1>
          
          <nav className="hidden md:flex items-center space-x-8 text-sm">
            <button className="text-muted-foreground hover:text-foreground transition-colors">
              Collections
            </button>
            <button className="text-muted-foreground hover:text-foreground transition-colors">
              Objects
            </button>
            <button className="text-muted-foreground hover:text-foreground transition-colors">
              Journal
            </button>
            <button className="text-muted-foreground hover:text-foreground transition-colors">
              About
            </button>
          </nav>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-1">
          <button 
            onClick={onStartChat}
            className="px-4 py-2 hover:bg-accent transition-colors text-sm flex items-center space-x-2"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Advisor</span>
          </button>
          <button className="p-2 hover:bg-accent transition-colors">
            <Search className="w-4 h-4" />
          </button>
          <button className="p-2 hover:bg-accent transition-colors">
            <User className="w-4 h-4" />
          </button>
          <button className="p-2 hover:bg-accent transition-colors">
            <ShoppingBag className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
