"use client";

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
import { updateProduct } from "@/app/actions";
import { SubmitButton } from "@/app/components/SubmitButtons";
import Link from "next/link";
import { useActionState } from "react";

interface Product {
  id: string;
  name: string;
  description: string | null;
  sku: string | null;
  type: "SERVICE" | "PRODUCT";
  basePrice: number;
  currency: string;
  trackStock: boolean;
  stockQty: number;
  minStockLevel: number;
  reorderPoint: number;
}

interface EditProductFormProps {
  product: Product;
}

export function EditProductForm({ product }: EditProductFormProps) {
  const [lastResult, action] = useActionState(updateProduct, undefined);
  const [form, fields] = useForm({
    lastResult,
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: productSchema });
    },
    shouldValidate: "onBlur",
    shouldRevalidate: "onInput",
    defaultValue: {
      name: product.name,
      description: product.description,
      sku: product.sku,
      type: product.type,
      basePrice: product.basePrice,
      currency: product.currency,
      trackStock: product.trackStock,
      stockQty: product.stockQty,
      minStockLevel: product.minStockLevel,
      reorderPoint: product.reorderPoint,
    },
  });

  return (
    <form id={form.id} action={action} onSubmit={form.onSubmit} className="space-y-6">
      <input type="hidden" name="id" value={product.id} />
      
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
        <SubmitButton text="Update Product" />
      </div>
    </form>
  );
}