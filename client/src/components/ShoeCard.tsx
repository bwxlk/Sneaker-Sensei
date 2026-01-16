import { type Shoe } from "@shared/schema";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, Plus, TrendingUp, DollarSign } from "lucide-react";
import { useAddToWishlist } from "@/hooks/use-wishlist";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

interface ShoeCardProps {
  shoe: Shoe;
  onAddToCollection?: () => void;
  showActions?: boolean;
}

export function ShoeCard({ shoe, onAddToCollection, showActions = true }: ShoeCardProps) {
  const { mutate: addToWishlist, isPending: isWishlisting } = useAddToWishlist();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const handleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToWishlist(
      { shoeId: shoe.id },
      {
        onSuccess: () => {
          toast({
            title: "Added to wishlist",
            description: `${shoe.name} is now in your wishlist.`,
          });
        },
        onError: () => {
          toast({
            title: "Error",
            description: "Could not add to wishlist. Try again.",
            variant: "destructive",
          });
        },
      }
    );
  };

  const formatPrice = (priceInCents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(priceInCents / 100);
  };

  return (
    <Card 
      onClick={() => setLocation(`/shoes/${shoe.id}`)}
      className="group relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-black/5 hover:-translate-y-1 cursor-pointer border-border/50 bg-card"
    >
      <div className="aspect-square relative overflow-hidden bg-muted/20">
        <img 
          src={shoe.imageUrl || "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&q=80"}
          alt={shoe.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {shoe.isTrending && (
          <Badge className="absolute top-3 left-3 bg-black/80 backdrop-blur-md text-white border-none gap-1">
            <TrendingUp className="w-3 h-3" /> Trending
          </Badge>
        )}
        
        {showActions && (
          <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
            <Button
              size="icon"
              variant="secondary"
              className="h-8 w-8 rounded-full shadow-lg hover:bg-white"
              onClick={handleWishlist}
              disabled={isWishlisting}
            >
              <Heart className="w-4 h-4" />
            </Button>
            {onAddToCollection && (
              <Button
                size="icon"
                variant="secondary"
                className="h-8 w-8 rounded-full shadow-lg hover:bg-white"
                onClick={(e) => {
                  e.stopPropagation();
                  onAddToCollection();
                }}
              >
                <Plus className="w-4 h-4" />
              </Button>
            )}
          </div>
        )}
      </div>

      <div className="p-4 space-y-2">
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{shoe.brand}</p>
          <h3 className="font-display font-semibold text-lg leading-tight mt-0.5 truncate">{shoe.name}</h3>
        </div>
        
        <div className="flex items-center justify-between pt-2 border-t border-border/50">
          <div className="flex flex-col">
            <span className="text-[10px] text-muted-foreground uppercase tracking-wide">Retail</span>
            <span className="font-mono text-sm">{formatPrice(shoe.retailPrice)}</span>
          </div>
          {shoe.marketPrice && (
            <div className="flex flex-col items-end">
              <span className="text-[10px] text-muted-foreground uppercase tracking-wide">Market</span>
              <span className={`font-mono text-sm font-semibold ${shoe.marketPrice > shoe.retailPrice ? 'text-green-600' : ''}`}>
                {formatPrice(shoe.marketPrice)}
              </span>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
