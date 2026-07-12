"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye, Settings2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { AssetViewDialog } from "./asset-view-dialog";

export function AssetList({ initialData }: { initialData: any[] }) {
  const [search, setSearch] = useState("");
  const [selectedAsset, setSelectedAsset] = useState<any>(null);

  const filteredAssets = initialData.filter(asset => 
    asset.name.toLowerCase().includes(search.toLowerCase()) || 
    asset.assetTag.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Input 
          placeholder="Search by tag or name..." 
          className="max-w-sm" 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Button variant="outline">
          <Settings2 className="mr-2 h-4 w-4" />
          Filters
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Asset Tag</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Condition</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Current Allocation</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAssets.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center h-24 text-muted-foreground">
                    No assets found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredAssets.map((asset) => (
                  <TableRow key={asset.id}>
                    <TableCell className="font-medium">{asset.assetTag}</TableCell>
                    <TableCell>
                      <div>
                        <p>{asset.name}</p>
                        {asset.isSharedBookable && (
                          <span className="text-xs text-muted-foreground">Bookable Resource</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{asset.category?.name}</TableCell>
                    <TableCell>{asset.condition || "—"}</TableCell>
                    <TableCell>
                      <Badge variant={
                        asset.status === "AVAILABLE" ? "default" :
                        asset.status === "ALLOCATED" ? "secondary" :
                        asset.status === "UNDER_MAINTENANCE" ? "destructive" : "outline"
                      }>
                        {asset.status.replace("_", " ")}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {asset.allocations && asset.allocations.length > 0
                        ? asset.allocations[0].user?.name || asset.allocations[0].department?.name
                        : "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => setSelectedAsset(asset)}>
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      <AssetViewDialog 
        asset={selectedAsset} 
        open={!!selectedAsset} 
        onOpenChange={(open) => !open && setSelectedAsset(null)} 
      />
    </div>
  );
}
