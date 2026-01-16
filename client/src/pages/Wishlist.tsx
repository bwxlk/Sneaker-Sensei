import { useWishlist, useDeleteFromWishlist } from "@/hooks/use-wishlist";
import { Navigation } from "@/components/Navigation";
import { Loader2, Trash2, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "wouter";

export default function Wishlist() {
  const { data: wishlist, isLoading } = useWishlist();
  const { mutate: deleteItem } = useDeleteFromWishlist();
  const [, setLocation] = useLocation();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price / 100);
  };

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Navigation />
      
      <main className="flex-1 lg:h-screen lg:overflow-y-auto">
        <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl font-display font-bold">Wishlist</h1>
              <p className="text-muted-foreground mt-1">Keep track of shoes you want to cop.</p>
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center p-24">
              <Loader2 className="animate-spin w-8 h-8 text-primary" />
            </div>
          ) : wishlist && wishlist.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-12">
              {wishlist.map((item) => (
                <div 
                  key={item.id} 
                  className="bg-card rounded-2xl border shadow-sm overflow-hidden hover:shadow-md transition-shadow group relative"
                >
                   {/* Remove Button */}
                   <button 
                     onClick={() => deleteItem(item.id)}
                     className="absolute top-3 right-3 z-10 bg-background/80 backdrop-blur rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive hover:text-destructive-foreground"
                   >
                     <Trash2 className="w-4 h-4" />
                   </button>

                  <div 
                    className="aspect-square bg-muted/20 relative cursor-pointer"
                    onClick={() => setLocation(`/shoes/${item.shoe.id}`)}
                  >
                    <img 
                      src={item.shoe.imageUrl} 
                      alt={item.shoe.name} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  <div className="p-4 space-y-3">
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider">{item.shoe.brand}</p>
                      <h3 className="font-semibold truncate leading-tight">{item.shoe.name}</h3>
                    </div>
                    
                    <div className="flex items-center justify-between pt-2">
                       <p className="font-mono font-semibold">{formatPrice(item.shoe.retailPrice)}</p>
                       <Link href={`/shoes/${item.shoe.id}`}>
                         <Button size="sm" variant="outline" className="h-8 text-xs">View Details</Button>
                       </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-24 border rounded-2xl border-dashed">
              <p className="text-muted-foreground mb-4">Your wishlist is empty.</p>
              <Link href="/explore">
                <Button>Browse Shoes</Button>
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
