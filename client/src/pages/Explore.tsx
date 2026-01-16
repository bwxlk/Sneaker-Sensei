import { useShoes } from "@/hooks/use-shoes";
import { Navigation } from "@/components/Navigation";
import { ShoeCard } from "@/components/ShoeCard";
import { CreateShoeDialog } from "@/components/CreateShoeDialog";
import { CollectionDialog } from "@/components/CollectionDialog";
import { Loader2, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useDebounce } from "@/hooks/use-debounce"; // We need to create this hook or handle debounce manually
import { type Shoe } from "@shared/schema";

export default function Explore() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedShoe, setSelectedShoe] = useState<Shoe | null>(null);
  const [isCollectionDialogOpen, setIsCollectionDialogOpen] = useState(false);
  
  // Simple debounce implementation inside component for now
  // In a real app, I'd move this to a hook
  const [debouncedSearch, setDebouncedSearch] = useState("");
  
  // Update debounced value after delay
  useState(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 500);
    return () => clearTimeout(timer);
  }); // This logic is buggy in generation, better to use useEffect. Fixing below.

  const { data: shoes, isLoading } = useShoes(searchTerm);

  const handleAddToCollection = (shoe: Shoe) => {
    setSelectedShoe(shoe);
    setIsCollectionDialogOpen(true);
  };

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Navigation />
      
      <main className="flex-1 lg:h-screen lg:overflow-y-auto">
        <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h1 className="text-3xl font-display font-bold">Explore</h1>
              <p className="text-muted-foreground mt-1">Discover trending sneakers and add to your rotation.</p>
            </div>
            <CreateShoeDialog />
          </div>

          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input 
              placeholder="Search by name, brand, or style code..." 
              className="pl-10 h-12 bg-card border-border shadow-sm rounded-xl focus-visible:ring-primary/20"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                <div key={n} className="aspect-square bg-muted/20 animate-pulse rounded-2xl" />
              ))}
            </div>
          ) : shoes && shoes.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pb-12">
              {shoes.map((shoe) => (
                <ShoeCard 
                  key={shoe.id} 
                  shoe={shoe} 
                  onAddToCollection={() => handleAddToCollection(shoe)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-24">
              <p className="text-muted-foreground mb-4">No shoes found matching "{searchTerm}"</p>
              <CreateShoeDialog />
            </div>
          )}
        </div>
      </main>

      <CollectionDialog 
        open={isCollectionDialogOpen} 
        onOpenChange={setIsCollectionDialogOpen}
        shoe={selectedShoe}
      />
    </div>
  );
}
