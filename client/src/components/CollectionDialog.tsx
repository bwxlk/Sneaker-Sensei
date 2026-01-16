import { useAddToCollection } from "@/hooks/use-collection";
import { useToast } from "@/hooks/use-toast";
import { type Shoe } from "@shared/schema";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";

interface CollectionDialogProps {
  shoe: Shoe | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CollectionDialog({ shoe, open, onOpenChange }: CollectionDialogProps) {
  const { mutate, isPending } = useAddToCollection();
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!shoe) return;

    const formData = new FormData(e.currentTarget);
    const purchasePriceDollars = formData.get("purchasePrice") ? parseFloat(formData.get("purchasePrice") as string) : null;
    const purchasePriceCents = purchasePriceDollars ? Math.round(purchasePriceDollars * 100) : null;

    const data = {
      shoeId: shoe.id,
      size: formData.get("size") as string,
      condition: formData.get("condition") as string,
      purchasePrice: purchasePriceCents || 0, // Fallback to 0 if empty
      notes: formData.get("notes") as string,
      purchaseDate: new Date().toISOString().split('T')[0], // Default to today for simplicity
    };

    mutate(data, {
      onSuccess: () => {
        onOpenChange(false);
        toast({ title: "Added to Collection", description: `${shoe.name} is now in your collection.` });
      },
      onError: (err) => {
        toast({ title: "Error", description: err.message, variant: "destructive" });
      }
    });
  };

  if (!shoe) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add to Collection</DialogTitle>
          <p className="text-sm text-muted-foreground">{shoe.name}</p>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="size">Size (US)</Label>
              <Input id="size" name="size" placeholder="10.5" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="condition">Condition</Label>
              <Select name="condition" defaultValue="new">
                <SelectTrigger>
                  <SelectValue placeholder="Select condition" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new">New (Deadstock)</SelectItem>
                  <SelectItem value="used">Used (Like New)</SelectItem>
                  <SelectItem value="worn">Worn</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="purchasePrice">Purchase Price ($)</Label>
            <Input id="purchasePrice" name="purchasePrice" type="number" min="0" step="0.01" placeholder="Optional" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" name="notes" placeholder="Got from SNKRS app..." />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={isPending}>{isPending ? "Adding..." : "Add Item"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
