import { Heart, ShoppingBag } from 'lucide-react';
import { useState } from 'react';

interface Product {
  id: string;
  title: string;
  price: number;
  image: string;
  merchant: string;
  category: string;
}

interface ProductCardProps {
  product: Product;
  compact?: boolean;
}

export default function ProductCard({ product, compact = false }: ProductCardProps) {
  const [isSaved, setIsSaved] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  if (compact) {
    return (
      <div 
        className="group flex space-x-4 border bg-card hover:bg-accent/50 transition-colors cursor-pointer"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="w-24 h-24 flex-shrink-0 overflow-hidden bg-muted">
          <img
            src={product.image}
            alt={product.title}
            className="w-full h-full object-cover"
          />
        </div>
        
        <div className="flex-1 py-3 pr-4 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-light mb-1">{product.title}</h3>
            <p className="text-xs text-muted-foreground">{product.merchant}</p>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">${product.price.toFixed(2)}</p>
            <button
              onClick={() => setIsSaved(!isSaved)}
              className="p-1.5 hover:bg-background transition-colors"
            >
              <Heart className={`w-3.5 h-3.5 ${isSaved ? 'fill-current' : ''}`} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="group cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image */}
      <div className="relative aspect-square mb-4 overflow-hidden bg-muted">
        <img
          src={product.image}
          alt={product.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        
        {/* Overlay Actions */}
        <div className={`absolute inset-0 bg-background/80 flex items-center justify-center space-x-3 transition-opacity duration-300 ${
          isHovered ? 'opacity-100' : 'opacity-0'
        }`}>
          <button
            onClick={() => setIsSaved(!isSaved)}
            className="p-3 bg-background border hover:bg-accent transition-colors"
          >
            <Heart className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
          </button>
          <button className="p-3 bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
            <ShoppingBag className="w-4 h-4" />
          </button>
        </div>

        {/* Category Badge */}
        <div className="absolute top-3 left-3">
          <span className="text-xs px-2 py-1 bg-background/90 backdrop-blur-sm">
            {product.category}
          </span>
        </div>
      </div>

      {/* Info */}
      <div className="space-y-1">
        <h3 className="text-sm font-light">{product.title}</h3>
        <p className="text-xs text-muted-foreground">{product.merchant}</p>
        <p className="text-sm font-medium pt-1">${product.price.toFixed(2)}</p>
      </div>
    </div>
  );
}
