import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { ShoppingCart } from "lucide-react";

interface ProductCardProps {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  onAddToCart?: (id: string) => void;
}

export const ProductCard = ({ id, name, description, price, image, onAddToCart }: ProductCardProps) => {
  return (
    <Card className="overflow-hidden group hover:shadow-[var(--shadow-warm)] transition-all duration-500 animate-fade-in hover:-translate-y-2 border-2 border-transparent hover:border-primary/20">
      <div className="relative overflow-hidden">
        <img
          src={image}
          alt={name}
          className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Premium Badge */}
        <div className="absolute top-4 right-4 bg-primary/90 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          Premium
        </div>
      </div>
      
      <div className="p-6 bg-gradient-to-b from-card to-card/50">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors duration-300">{name}</h3>
          <ShoppingCart className="h-5 w-5 text-primary/60 group-hover:text-primary group-hover:scale-110 transition-all duration-300" />
        </div>
        <p className="text-muted-foreground text-sm mb-4 line-clamp-2 leading-relaxed">{description}</p>
        
        <div className="flex items-center justify-between pt-4 border-t border-border/50">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Price per kg</p>
            <span className="text-2xl font-bold text-primary group-hover:scale-110 inline-block transition-transform duration-300">R{price.toFixed(2)}</span>
          </div>
          <Button 
            variant="hero" 
            size="sm"
            onClick={() => onAddToCart?.(id)}
            className="gap-2 shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <ShoppingCart className="h-4 w-4" />
            Add to Cart
          </Button>
        </div>
      </div>
    </Card>
  );
};
