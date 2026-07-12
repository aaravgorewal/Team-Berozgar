"use client";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export function AssetViewDialog({ asset, open, onOpenChange }: { asset: any, open: boolean, onOpenChange: (open: boolean) => void }) {
  if (!asset) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Asset Details</DialogTitle>
          <DialogDescription>Detailed view for {asset.name}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {asset.photoUrl && (
            <div className="w-full h-48 rounded-md overflow-hidden bg-muted flex items-center justify-center">
              <img src={asset.photoUrl} alt={asset.name} className="w-full h-full object-cover" />
            </div>
          )}
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Asset Tag</p>
              <p className="font-medium">{asset.assetTag}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Status</p>
              <Badge variant={
                asset.status === "AVAILABLE" ? "default" :
                asset.status === "ALLOCATED" ? "secondary" :
                asset.status === "UNDER_MAINTENANCE" ? "destructive" : "outline"
              }>
                {asset.status.replace("_", " ")}
              </Badge>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Category</p>
              <p>{asset.category?.name || "—"}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Condition</p>
              <p>{asset.condition || "—"}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Serial Number</p>
              <p>{asset.serialNumber || "—"}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Location</p>
              <p>{asset.location || "—"}</p>
            </div>
          </div>
          
          <Separator />
          
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-2">Current Allocation</p>
            {asset.allocations && asset.allocations.length > 0 ? (
              <div className="bg-muted/50 p-3 rounded-md">
                <p className="font-medium">
                  {asset.allocations[0].user?.name || asset.allocations[0].department?.name}
                </p>
                <p className="text-sm text-muted-foreground">
                  Allocated on: {new Date(asset.allocations[0].createdAt).toLocaleDateString()}
                </p>
              </div>
            ) : (
              <p className="text-sm">Not currently allocated.</p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
