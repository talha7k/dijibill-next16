import { requireUser } from "@/app/utils/hooks";
import prisma from "@/app/utils/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Package } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { EditProductForm } from "./EditProductForm";

async function getProduct(productId: string, userId: string) {
  const product = await prisma.product.findUnique({
    where: {
      id: productId,
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
  });

  if (!product) {
    notFound();
  }

  return product;
}

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ productId: string }>;
}) {
  const { productId } = await params;
  const session = await requireUser();
  const product = await getProduct(productId, session.user?.id as string);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/products">
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Products
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Edit Product</h1>
          <p className="text-muted-foreground">
            Update product information and settings
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Product Information</CardTitle>
            </CardHeader>
            <CardContent>
              <EditProductForm product={product} />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Product Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">Used in {product._count.invoiceItems} invoices</span>
              </div>
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">{product.variations.length} variations</span>
              </div>
              {product.trackStock && (
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">Current stock: {product.stockQty}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {product.type === "PRODUCT" && (
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Link href={`/dashboard/products/${productId}/variations`}>
                  <Button variant="outline" className="w-full">
                    Manage Variations
                  </Button>
                </Link>
                <Link href={`/dashboard/products/${productId}/stock`}>
                  <Button variant="outline" className="w-full">
                    Update Stock
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}