"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/app/utils/formatCurrency";
import { Search, Plus, Package } from "lucide-react";

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
  variations: ProductVariation[];
}

interface ProductVariation {
  id: string;
  name: string;
  value: string;
  priceAdjust: number;
  stockQty: number;
}

interface InvoiceItem {
  id: string;
  productId: string | null;
  variationId: string | null;
  description: string;
  quantity: number;
  rate: number;
  product?: Product;
  variation?: ProductVariation;
}

interface ProductSelectorProps {
  items: InvoiceItem[];
  onItemsChange: (items: InvoiceItem[]) => void;
  currency: string;
}

export function ProductSelector({ items, onItemsChange, currency }: ProductSelectorProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedVariation, setSelectedVariation] = useState<ProductVariation | null>(null);
  const [quantity, setQuantity] = useState(1);

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch("/api/products");
        if (response.ok) {
          const data = await response.json();
          setProducts(data);
        }
      } catch (error) {
        console.error("Failed to fetch products:", error);
      }
    };

    fetchProducts();
  }, []);

  // Filter products based on search
  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.sku?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate price
  const calculatePrice = (product: Product, variation?: ProductVariation) => {
    const basePrice = product.basePrice;
    const adjustment = variation?.priceAdjust || 0;
    return basePrice + adjustment;
  };

  // Add item to invoice
  const addItem = () => {
    if (!selectedProduct) return;

    const price = calculatePrice(selectedProduct, selectedVariation || undefined);
    const description = selectedVariation 
      ? `${selectedProduct.name} - ${selectedVariation.name}: ${selectedVariation.value}`
      : selectedProduct.name;

    const newItem: InvoiceItem = {
      id: Date.now().toString(),
      productId: selectedProduct.id,
      variationId: selectedVariation?.id || null,
      description,
      quantity,
      rate: price,
      product: selectedProduct,
      variation: selectedVariation || undefined,
    };

    onItemsChange([...items, newItem]);
    
    // Reset form
    setSelectedProduct(null);
    setSelectedVariation(null);
    setQuantity(1);
  };

  // Remove item from invoice
  const removeItem = (itemId: string) => {
    onItemsChange(items.filter(item => item.id !== itemId));
  };

  // Update item quantity
  const updateQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(itemId);
      return;
    }

    onItemsChange(items.map(item => 
      item.id === itemId ? { ...item, quantity: newQuantity } : item
    ));
  };

  // Calculate total
  const total = items.reduce((sum, item) => sum + (item.quantity * item.rate), 0);

  return (
    <div className="space-y-6">
      {/* Product Selection */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-4">Add Products</h3>
          
          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Product Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Product</label>
              <Select onValueChange={(productId) => {
                const product = products.find(p => p.id === productId);
                setSelectedProduct(product || null);
                setSelectedVariation(null);
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a product" />
                </SelectTrigger>
                <SelectContent>
                  {filteredProducts.map((product) => (
                    <SelectItem key={product.id} value={product.id}>
                      <div className="flex items-center gap-2">
                        <span>{product.name}</span>
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
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Variations */}
            {selectedProduct && selectedProduct.variations.length > 0 && (
              <div>
                <label className="text-sm font-medium mb-2 block">Variation</label>
                <Select onValueChange={(variationId) => {
                  const variation = selectedProduct.variations.find(v => v.id === variationId);
                  setSelectedVariation(variation || null);
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select variation" />
                  </SelectTrigger>
                  <SelectContent>
                    {selectedProduct.variations.map((variation) => (
                      <SelectItem key={variation.id} value={variation.id}>
                        {variation.name}: {variation.value}
                        {variation.priceAdjust !== 0 && (
                          <span className="text-muted-foreground ml-2">
                            ({variation.priceAdjust > 0 ? '+' : ''}{formatCurrency({
                              amount: variation.priceAdjust,
                              currency: currency as "USD" | "EUR",
                            })})
                          </span>
                        )}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {/* Quantity and Add */}
          {selectedProduct && (
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <label className="text-sm font-medium mb-2 block">Quantity</label>
                <Input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                />
              </div>
              <div className="flex-1">
                <label className="text-sm font-medium mb-2 block">Price</label>
                <Input
                  value={formatCurrency({
                    amount: calculatePrice(selectedProduct, selectedVariation || undefined),
                    currency: currency as "USD" | "EUR",
                  })}
                  disabled
                />
              </div>
              <div className="flex items-end">
                <Button onClick={addItem} disabled={!selectedProduct}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Invoice Items */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-4">Invoice Items</h3>
          
          {items.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No items added yet. Select products above to get started.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium">{item.description}</h4>
                    {item.product && (
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant={item.product.type === "SERVICE" ? "secondary" : "default"}>
                          {item.product.type === "SERVICE" ? "Service" : "Product"}
                        </Badge>
                        {item.product.sku && (
                          <span className="text-sm text-muted-foreground">SKU: {item.product.sku}</span>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <label className="text-sm font-medium">Qty:</label>
                      <Input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => updateQuantity(item.id, parseInt(e.target.value) || 1)}
                        className="w-20"
                      />
                    </div>
                    <div className="text-right">
                      <div className="font-medium">
                        {formatCurrency({
                          amount: item.rate,
                          currency: currency as "USD" | "EUR",
                        })}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {formatCurrency({
                          amount: item.quantity * item.rate,
                          currency: currency as "USD" | "EUR",
                        })}
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeItem(item.id)}
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              ))}
              
              {/* Total */}
              <div className="border-t pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold">Total:</span>
                  <span className="text-lg font-semibold">
                    {formatCurrency({
                      amount: total,
                      currency: currency as "USD" | "EUR",
                    })}
                  </span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}