import { Heart, ShoppingBag, ExternalLink } from 'lucide-react';
import { useState } from 'react';

interface Product {
  id: string;
  title: string;
  price: number;
  image: string;
  merchant: string;
  category: string;
  description?: string;
}

interface EditorialProductCardProps {
  product: Product;
  featured?: boolean;
}

export default function EditorialProductCard({ product, featured = false }: EditorialProductCardProps) {
  const [isSaved, setIsSaved] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className="group cursor-pointer h-full flex flex-col"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image */}
      <div className={`relative overflow-hidden bg-muted mb-4 ${featured ? 'aspect-[3/4]' : 'aspect-square'}`}>
        <img
          src={product.image}
          alt={product.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        
        {/* Gradient Overlay on Hover */}
        <div className={`absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent transition-opacity duration-500 ${
          isHovered ? 'opacity-100' : 'opacity-0'
        }`} />

        {/* Actions Overlay */}
        <div className={`absolute inset-0 flex items-center justify-center space-x-3 transition-opacity duration-300 ${
          isHovered ? 'opacity-100' : 'opacity-0'
        }`}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsSaved(!isSaved);
            }}
            className="p-3 bg-white/95 backdrop-blur-sm hover:bg-white transition-colors"
          >
            <Heart className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
          </button>
          <button className="p-3 bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
            <ShoppingBag className="w-4 h-4" />
          </button>
          <button className="p-3 bg-white/95 backdrop-blur-sm hover:bg-white transition-colors">
            <ExternalLink className="w-4 h-4" />
          </button>
        </div>

        {/* Category Badge */}
        <div className="absolute top-4 left-4">
          <span className="text-xs px-3 py-1 bg-white/90 backdrop-blur-sm tracking-wider">
            {product.category}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col space-y-3">
        <div className="flex-1">
          <h3 className={`font-serif mb-2 ${featured ? 'text-2xl' : 'text-xl'}`}>
            {product.title}
          </h3>
          {product.description && (
            <p className="text-sm text-muted-foreground leading-relaxed mb-3">
              {product.description}
            </p>
          )}
          <p className="text-xs text-muted-foreground">{product.merchant}</p>
        </div>
        
        <div className="flex items-center justify-between pt-2 border-t">
          <p className="text-sm font-medium">${product.price.toFixed(2)}</p>
          <button className="text-xs hover:opacity-60 transition-opacity flex items-center space-x-1">
            <span>View details</span>
            <ExternalLink className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
}
