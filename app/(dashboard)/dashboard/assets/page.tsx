import { AssetList } from "@/components/assets/asset-list";
import { CreateAssetDialog } from "@/components/assets/create-asset-dialog";
import { getAssets } from "@/app/actions/assets";
import { getCategories } from "@/app/actions/organization";

export default async function AssetsPage() {
  const [assets, categories] = await Promise.all([
    getAssets(),
    getCategories(),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Assets Directory</h2>
          <p className="text-muted-foreground">
            Register and track assets through their full lifecycle.
          </p>
        </div>
        <CreateAssetDialog categories={categories} />
      </div>

      <AssetList initialData={assets} />
    </div>
  );
}
