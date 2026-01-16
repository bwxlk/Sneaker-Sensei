import { useAuth } from "@/hooks/use-auth";
import { useShoes } from "@/hooks/use-shoes";
import { useCollection } from "@/hooks/use-collection";
import { Navigation } from "@/components/Navigation";
import { ShoeCard } from "@/components/ShoeCard";
import { Loader2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { CollectionDialog } from "@/components/CollectionDialog";
import { useState } from "react";
import { type Shoe } from "@shared/schema";

export default function Dashboard() {
  const { user } = useAuth();
  const { data: trendingShoes, isLoading: isLoadingTrending } = useShoes(undefined, true);
  const { data: collection, isLoading: isLoadingCollection } = useCollection();
  
  const [selectedShoe, setSelectedShoe] = useState<Shoe | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Calculate total collection value
  const totalValue = collection?.reduce((acc, item) => {
    // Use market price if available, otherwise retail, otherwise purchase
    const val = item.shoe.marketPrice || item.shoe.retailPrice || item.purchasePrice || 0;
    return acc + val;
  }, 0) || 0;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(price / 100);
  };

  const handleAddToCollection = (shoe: Shoe) => {
    setSelectedShoe(shoe);
    setIsDialogOpen(true);
  };

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Navigation />
      
      <main className="flex-1 lg:h-screen lg:overflow-y-auto">
        <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
          
          {/* Welcome Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl font-display font-bold">Dashboard</h1>
              <p className="text-muted-foreground mt-1">Welcome back, {user?.firstName}. Here's what's happening.</p>
            </div>
            <div className="flex gap-3">
              <Link href="/explore">
                <Button variant="outline">Browse Catalog</Button>
              </Link>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-card p-6 rounded-2xl border shadow-sm">
              <p className="text-sm font-medium text-muted-foreground mb-1">Total Collection Value</p>
              <h2 className="text-3xl font-mono font-bold">{formatPrice(totalValue)}</h2>
            </div>
            <div className="bg-card p-6 rounded-2xl border shadow-sm">
              <p className="text-sm font-medium text-muted-foreground mb-1">Pairs in Collection</p>
              <h2 className="text-3xl font-mono font-bold">{collection?.length || 0}</h2>
            </div>
            <div className="bg-primary text-primary-foreground p-6 rounded-2xl border shadow-sm relative overflow-hidden">
              <div className="relative z-10">
                <p className="text-sm font-medium text-primary-foreground/80 mb-1">Market Trend</p>
                <h2 className="text-3xl font-mono font-bold">+12.5%</h2>
              </div>
              <div className="absolute right-0 bottom-0 opacity-10 transform translate-y-1/4 translate-x-1/4">
                <svg width="150" height="150" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Trending Section */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-display font-semibold">Trending Now</h2>
              <Link href="/explore">
                <Button variant="ghost" className="text-sm">View All <ArrowRight className="ml-2 w-4 h-4" /></Button>
              </Link>
            </div>
            
            {isLoadingTrending ? (
              <div className="flex justify-center p-12">
                <Loader2 className="animate-spin w-8 h-8 text-primary" />
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {trendingShoes?.slice(0, 4).map((shoe) => (
                  <ShoeCard 
                    key={shoe.id} 
                    shoe={shoe} 
                    onAddToCollection={() => handleAddToCollection(shoe)}
                  />
                ))}
              </div>
            )}
          </section>

          {/* Recent Collection Adds */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-display font-semibold">Recently Added</h2>
              <Link href="/collection">
                <Button variant="ghost" className="text-sm">View Collection <ArrowRight className="ml-2 w-4 h-4" /></Button>
              </Link>
            </div>
            
            {isLoadingCollection ? (
              <div className="flex justify-center p-12">
                <Loader2 className="animate-spin w-8 h-8 text-primary" />
              </div>
            ) : collection && collection.length > 0 ? (
              <div className="bg-card rounded-2xl border shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-muted/30">
                        <th className="px-6 py-4 text-left font-medium text-muted-foreground">Shoe</th>
                        <th className="px-6 py-4 text-left font-medium text-muted-foreground">Size</th>
                        <th className="px-6 py-4 text-left font-medium text-muted-foreground">Condition</th>
                        <th className="px-6 py-4 text-right font-medium text-muted-foreground">Value</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {collection.slice(0, 5).map((item) => (
                        <tr key={item.id} className="hover:bg-muted/10 transition-colors">
                          <td className="px-6 py-4 flex items-center gap-4">
                            <img 
                              src={item.shoe.imageUrl} 
                              alt={item.shoe.name} 
                              className="w-10 h-10 rounded-md object-cover bg-muted"
                            />
                            <div>
                              <p className="font-medium">{item.shoe.name}</p>
                              <p className="text-xs text-muted-foreground">{item.shoe.brand}</p>
                            </div>
                          </td>
                          <td className="px-6 py-4">{item.size}</td>
                          <td className="px-6 py-4 capitalize">{item.condition}</td>
                          <td className="px-6 py-4 text-right font-mono">
                            {formatPrice(item.shoe.marketPrice || item.shoe.retailPrice)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 bg-muted/10 rounded-2xl border border-dashed">
                <p className="text-muted-foreground mb-4">No shoes in your collection yet.</p>
                <Link href="/explore">
                  <Button>Start Collecting</Button>
                </Link>
              </div>
            )}
          </section>

        </div>
      </main>

      <CollectionDialog 
        open={isDialogOpen} 
        onOpenChange={setIsDialogOpen}
        shoe={selectedShoe}
      />
    </div>
  );
}
