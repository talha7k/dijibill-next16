import { requireUser } from "@/app/utils/hooks";
import prisma from "@/app/utils/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/app/utils/formatCurrency";
import { Plus, Package, Settings, Edit, Trash2 } from "lucide-react";
import Link from "next/link";
import { deleteProduct } from "@/app/actions";

async function getProducts(userId: string) {
  return await prisma.product.findMany({
    where: {
      userId: userId,
    },
    include: {
      variations: true,
      _count: {
        select: {
          invoiceItems: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

export default async function ProductsPage() {
  const session = await requireUser();
  const products = await getProducts(session.user?.id as string);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Products & Services</h1>
          <p className="text-muted-foreground">
            Manage your product catalog and inventory
          </p>
        </div>
        <Link href="/dashboard/products/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Add Product
          </Button>
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{products.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Services</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {products.filter(p => p.type === "SERVICE").length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Physical Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {products.filter(p => p.type === "PRODUCT").length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Products List */}
      <Card>
        <CardHeader>
          <CardTitle>Product Catalog</CardTitle>
        </CardHeader>
        <CardContent>
          {products.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No products yet</h3>
              <p className="text-muted-foreground mb-4">
                Get started by adding your first product or service
              </p>
              <Link href="/dashboard/products/new">
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Product
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold">{product.name}</h3>
                      <Badge variant={product.type === "SERVICE" ? "secondary" : "default"}>
                        {product.type === "SERVICE" ? "Service" : "Product"}
                      </Badge>
                      {product.trackStock && (
                        <Badge 
                          variant={product.stockQty <= product.minStockLevel ? "destructive" : "outline"}
                        >
                          Stock: {product.stockQty}
                        </Badge>
                      )}
                    </div>
                    {product.description && (
                      <p className="text-sm text-muted-foreground mb-2">
                        {product.description}
                      </p>
                    )}
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>
                        {formatCurrency({
                          amount: product.basePrice,
                          currency: product.currency as "USD" | "EUR",
                        })}
                      </span>
                      {product.sku && <span>SKU: {product.sku}</span>}
                      <span>Used in {product._count.invoiceItems} invoices</span>
                      {product.variations.length > 0 && (
                        <span>{product.variations.length} variations</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Link href={`/dashboard/products/${product.id}`}>
                      <Button variant="outline" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                    </Link>
                    <form action={async () => {
                      await deleteProduct(product.id);
                    }}>
                      <Button type="submit" variant="destructive" size="sm">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </form>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}