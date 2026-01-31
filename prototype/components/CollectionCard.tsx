import { ArrowRight } from 'lucide-react';

interface Collection {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  itemCount: number;
}

interface CollectionCardProps {
  collection: Collection;
}

export default function CollectionCard({ collection }: CollectionCardProps) {
  return (
    <div className="group cursor-pointer">
      <div className="relative aspect-[4/5] mb-4 overflow-hidden bg-muted">
        <img
          src={collection.image}
          alt={collection.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        {/* Hover Content */}
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
          <div className="flex items-center space-x-2 text-sm">
            <span>Explore collection</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </div>
      </div>
      
      <div className="space-y-2">
        <h3 className="text-lg font-serif">{collection.title}</h3>
        <p className="text-sm text-muted-foreground">{collection.subtitle}</p>
        <p className="text-xs text-muted-foreground">{collection.itemCount} items</p>
      </div>
    </div>
  );
}
