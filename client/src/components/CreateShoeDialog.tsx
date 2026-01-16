import { useCreateShoe } from "@/hooks/use-shoes";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useState } from "react";
import { Plus } from "lucide-react";

export function CreateShoeDialog() {
  const [open, setOpen] = useState(false);
  const { mutate, isPending } = useCreateShoe();
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    // Convert retailPrice from dollars string to cents integer
    const retailPriceDollars = parseFloat(formData.get("retailPrice") as string);
    const retailPriceCents = Math.round(retailPriceDollars * 100);

    const data = {
      name: formData.get("name") as string,
      brand: formData.get("brand") as string,
      model: formData.get("model") as string,
      colorway: formData.get("colorway") as string,
      retailPrice: retailPriceCents,
      description: formData.get("description") as string,
      imageUrl: formData.get("imageUrl") as string,
      isTrending: formData.get("isTrending") === "on",
    };

    mutate(data, {
      onSuccess: () => {
        setOpen(false);
        toast({ title: "Shoe Created", description: "Successfully added to the catalog." });
      },
      onError: (err) => {
        toast({ title: "Error", description: err.message, variant: "destructive" });
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Add Shoe
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Shoe to Catalog</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="brand">Brand</Label>
              <Input id="brand" name="brand" placeholder="Nike" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="model">Model</Label>
              <Input id="model" name="model" placeholder="Air Jordan 1" required />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="name">Shoe Name</Label>
            <Input id="name" name="name" placeholder="Nike Air Jordan 1 High OG" required />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="colorway">Colorway</Label>
              <Input id="colorway" name="colorway" placeholder="Chicago" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="retailPrice">Retail Price ($)</Label>
              <Input id="retailPrice" name="retailPrice" type="number" min="0" step="0.01" placeholder="180.00" required />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="imageUrl">Image URL</Label>
            <Input id="imageUrl" name="imageUrl" placeholder="https://..." required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" name="description" placeholder="Details about the shoe..." required />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox id="isTrending" name="isTrending" />
            <Label htmlFor="isTrending">Mark as Trending</Label>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={isPending}>{isPending ? "Creating..." : "Create Shoe"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
