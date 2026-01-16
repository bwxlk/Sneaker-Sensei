import { useShoe } from "@/hooks/use-shoes";
import { useAuth } from "@/hooks/use-auth";
import { Navigation } from "@/components/Navigation";
import { CollectionDialog } from "@/components/CollectionDialog";
import { Button } from "@/components/ui/button";
import { useRoute } from "wouter";
import { Loader2, ArrowLeft, Heart, Share2, Plus } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";

// Mock data for price history since we don't have real historical data yet
const mockPriceHistory = [
  { month: 'Jan', price: 180 },
  { month: 'Feb', price: 195 },
  { month: 'Mar', price: 190 },
  { month: 'Apr', price: 210 },
  { month: 'May', price: 205 },
  { month: 'Jun', price: 225 },
];

export default function ShoeDetail() {
  const [, params] = useRoute("/shoes/:id");
  const id = params ? parseInt(params.id) : 0;
  const { data: shoe, isLoading } = useShoe(id);
  const [isCollectionDialogOpen, setIsCollectionDialogOpen] = useState(false);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price / 100);
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="animate-spin w-8 h-8 text-primary" />
      </div>
    );
  }

  if (!shoe) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-bold">Shoe not found</h1>
        <Link href="/explore"><Button>Back to Explore</Button></Link>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Navigation />
      
      <main className="flex-1 lg:h-screen lg:overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          {/* Back Button Header */}
          <div className="p-6 md:p-8 border-b">
             <Link href="/explore">
               <Button variant="ghost" className="gap-2 pl-0 hover:bg-transparent hover:text-primary">
                 <ArrowLeft className="w-4 h-4" /> Back to Explore
               </Button>
             </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2">
            {/* Image Section - Sticky on Desktop */}
            <div className="bg-muted/10 p-8 md:p-12 lg:h-[calc(100vh-80px)] lg:sticky lg:top-0 flex items-center justify-center">
              <img 
                src={shoe.imageUrl} 
                alt={shoe.name}
                className="w-full max-w-lg object-contain drop-shadow-2xl hover:scale-105 transition-transform duration-500"
              />
            </div>

            {/* Content Section */}
            <div className="p-6 md:p-8 md:pr-12 space-y-8">
              <div>
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest mb-2">{shoe.brand} • {shoe.model}</p>
                <h1 className="text-4xl md:text-5xl font-display font-bold leading-tight mb-4">{shoe.name}</h1>
                <p className="text-lg text-muted-foreground">{shoe.colorway}</p>
              </div>

              <div className="flex flex-wrap gap-4 py-6 border-y border-border/50">
                <div className="flex-1 min-w-[120px]">
                   <p className="text-xs uppercase text-muted-foreground mb-1">Retail Price</p>
                   <p className="text-2xl font-mono">{formatPrice(shoe.retailPrice)}</p>
                </div>
                {shoe.marketPrice && (
                  <div className="flex-1 min-w-[120px]">
                     <p className="text-xs uppercase text-muted-foreground mb-1">Market Value</p>
                     <p className={`text-2xl font-mono font-semibold ${shoe.marketPrice > shoe.retailPrice ? 'text-green-600' : ''}`}>
                       {formatPrice(shoe.marketPrice)}
                     </p>
                  </div>
                )}
              </div>

              <div className="flex gap-4">
                <Button size="lg" className="flex-1 text-base h-14" onClick={() => setIsCollectionDialogOpen(true)}>
                  <Plus className="w-5 h-5 mr-2" />
                  Add to Collection
                </Button>
                <Button size="icon" variant="outline" className="h-14 w-14 rounded-xl">
                  <Heart className="w-6 h-6" />
                </Button>
                <Button size="icon" variant="outline" className="h-14 w-14 rounded-xl">
                  <Share2 className="w-6 h-6" />
                </Button>
              </div>

              <div className="space-y-4">
                <h3 className="text-xl font-bold font-display">About this shoe</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {shoe.description}
                </p>
              </div>

              <div className="space-y-4 pt-4">
                <h3 className="text-xl font-bold font-display">Price History</h3>
                <div className="h-64 w-full bg-card rounded-xl p-4 border shadow-sm">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={mockPriceHistory}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                      <XAxis 
                        dataKey="month" 
                        stroke="hsl(var(--muted-foreground))" 
                        fontSize={12} 
                        tickLine={false} 
                        axisLine={false} 
                      />
                      <YAxis 
                        stroke="hsl(var(--muted-foreground))" 
                        fontSize={12} 
                        tickLine={false} 
                        axisLine={false}
                        tickFormatter={(value) => `$${value}`}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--background))', 
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px' 
                        }} 
                      />
                      <Line 
                        type="monotone" 
                        dataKey="price" 
                        stroke="hsl(var(--primary))" 
                        strokeWidth={2} 
                        dot={{ r: 4, fill: 'hsl(var(--primary))' }} 
                        activeDot={{ r: 6 }} 
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

            </div>
          </div>
        </div>
      </main>

      <CollectionDialog 
        open={isCollectionDialogOpen} 
        onOpenChange={setIsCollectionDialogOpen}
        shoe={shoe}
      />
    </div>
  );
}
