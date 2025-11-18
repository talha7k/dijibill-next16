"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import { getInputProps } from "@conform-to/react";
import { productSchema } from "@/app/utils/zodSchemas";
import { createProduct } from "@/app/actions";
import { SubmitButton } from "@/app/components/SubmitButtons";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useActionState } from "react";

export default function CreateProductPage() {
  const [lastResult, action] = useActionState(createProduct, undefined);
  const [form, fields] = useForm({
    lastResult,
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: productSchema });
    },
    shouldValidate: "onBlur",
    shouldRevalidate: "onInput",
  });

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
          <h1 className="text-3xl font-bold">Create Product</h1>
          <p className="text-muted-foreground">
            Add a new product or service to your catalog
          </p>
        </div>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Product Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form id={form.id} action={action} onSubmit={form.onSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor={fields.name.name}>Product Name *</Label>
                <Input
                  {...getInputProps(fields.name, { type: 'text' })}
                  placeholder="e.g., Web Design Service"
                />
                {fields.name.errors && (
                  <p className="text-sm text-red-500">{fields.name.errors}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor={fields.sku.name}>SKU</Label>
                <Input
                  {...getInputProps(fields.sku, { type: 'text' })}
                  placeholder="e.g., WEB-001"
                />
                {fields.sku.errors && (
                  <p className="text-sm text-red-500">{fields.sku.errors}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor={fields.description.name}>Description</Label>
              <Textarea
                {...getInputProps(fields.description, { type: 'text' })}
                placeholder="Describe your product or service..."
                rows={3}
              />
              {fields.description.errors && (
                <p className="text-sm text-red-500">{fields.description.errors}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor={fields.type.name}>Type *</Label>
                <Select
                  name={fields.type.name}
                  key={fields.type.key}
                  defaultValue={fields.type.initialValue as string}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SERVICE">Service</SelectItem>
                    <SelectItem value="PRODUCT">Product</SelectItem>
                  </SelectContent>
                </Select>
                {fields.type.errors && (
                  <p className="text-sm text-red-500">{fields.type.errors}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor={fields.currency.name}>Currency *</Label>
                <Select
                  name={fields.currency.name}
                  key={fields.currency.key}
                  defaultValue={fields.currency.initialValue as string}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD - US Dollar</SelectItem>
                    <SelectItem value="EUR">EUR - Euro</SelectItem>
                  </SelectContent>
                </Select>
                {fields.currency.errors && (
                  <p className="text-sm text-red-500">{fields.currency.errors}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor={fields.basePrice.name}>Base Price *</Label>
              <Input
                {...getInputProps(fields.basePrice, { type: 'number' })}
                step="0.01"
                min="0"
                placeholder="0.00"
              />
              {fields.basePrice.errors && (
                <p className="text-sm text-red-500">{fields.basePrice.errors}</p>
              )}
            </div>

            {/* Inventory Settings */}
            <div className="space-y-4 p-4 border rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Track Inventory</h3>
                  <p className="text-sm text-muted-foreground">
                    Enable stock tracking for this product
                  </p>
                </div>
                <Switch
                  name={fields.trackStock.name}
                  defaultChecked={fields.trackStock.initialValue === 'true'}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor={fields.stockQty.name}>Stock Quantity</Label>
                  <Input
                    {...getInputProps(fields.stockQty, { type: 'number' })}
                    min="0"
                    placeholder="0"
                  />
                  {fields.stockQty.errors && (
                    <p className="text-sm text-red-500">{fields.stockQty.errors}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor={fields.minStockLevel.name}>Min Stock Level</Label>
                  <Input
                    {...getInputProps(fields.minStockLevel, { type: 'number' })}
                    min="0"
                    placeholder="0"
                  />
                  {fields.minStockLevel.errors && (
                    <p className="text-sm text-red-500">{fields.minStockLevel.errors}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor={fields.reorderPoint.name}>Reorder Point</Label>
                  <Input
                    {...getInputProps(fields.reorderPoint, { type: 'number' })}
                    min="0"
                    placeholder="0"
                  />
                  {fields.reorderPoint.errors && (
                    <p className="text-sm text-red-500">{fields.reorderPoint.errors}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-4">
              <Link href="/dashboard/products">
                <Button variant="outline">Cancel</Button>
              </Link>
              <SubmitButton text="Create Product" />
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}