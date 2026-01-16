import { useCollection, useDeleteFromCollection } from "@/hooks/use-collection";
import { Navigation } from "@/components/Navigation";
import { Loader2, Trash2, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "wouter";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function Collection() {
  const { data: collection, isLoading } = useCollection();
  const { mutate: deleteItem } = useDeleteFromCollection();
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
              <h1 className="text-3xl font-display font-bold">My Collection</h1>
              <p className="text-muted-foreground mt-1">Manage your personal inventory.</p>
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center p-24">
              <Loader2 className="animate-spin w-8 h-8 text-primary" />
            </div>
          ) : collection && collection.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-12">
              {collection.map((item) => (
                <div 
                  key={item.id} 
                  className="bg-card rounded-2xl border shadow-sm overflow-hidden hover:shadow-md transition-shadow group"
                >
                  <div className="flex p-4 gap-4">
                    <div 
                      className="w-24 h-24 bg-muted/20 rounded-xl overflow-hidden flex-shrink-0 cursor-pointer"
                      onClick={() => setLocation(`/shoes/${item.shoe.id}`)}
                    >
                      <img 
                        src={item.shoe.imageUrl} 
                        alt={item.shoe.name} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wider">{item.shoe.brand}</p>
                        <h3 className="font-semibold truncate">{item.shoe.name}</h3>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                         <div className="px-2 py-1 bg-secondary rounded text-xs font-medium">
                           Size {item.size}
                         </div>
                         <div className="px-2 py-1 bg-secondary rounded text-xs font-medium capitalize">
                           {item.condition}
                         </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="px-4 py-3 bg-muted/20 border-t flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">Market Value</p>
                      <p className="font-mono font-semibold">{formatPrice(item.shoe.marketPrice || item.shoe.retailPrice)}</p>
                    </div>
                    
                    <div className="flex gap-2">
                       <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setLocation(`/shoes/${item.shoe.id}`)}>
                         <ArrowUpRight className="w-4 h-4" />
                       </Button>
                       
                       <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="icon" variant="ghost" className="h-8 w-8 hover:text-destructive hover:bg-destructive/10">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Remove from collection?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will remove this shoe from your inventory. This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => deleteItem(item.id)}
                              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-24 border rounded-2xl border-dashed">
              <p className="text-muted-foreground mb-4">Your collection is empty.</p>
              <Link href="/explore">
                <Button>Start Adding Shoes</Button>
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
