# Product & Inventory Management System Plan

## Current State Analysis

### Existing System
- **Invoice Items**: Currently stored as simple text descriptions with quantity and rate
- **No Product Catalog**: Each invoice item is free-text entry
- **No Inventory Tracking**: No stock management or variations
- **Single Item per Invoice**: Current forms only support one item per invoice

### Database Schema (Current)
```prisma
model InvoiceItem {
  id          String @id @default(cuid())
  description String
  quantity    Int
  rate        Int
  invoice     Invoice @relation(fields: [invoiceId], references: [id], onDelete: Cascade)
  invoiceId   String
}
```

## Proposed System Architecture

### 1. New Database Models

#### Product/Service Catalog
```prisma
model Product {
  id          String @id @default(cuid())
  name        String
  description String?
  sku         String? @unique
  type        ProductType @default(SERVICE)
  basePrice   Int
  currency    String @default("USD")
  
  // Inventory tracking (for products)
  trackStock  Boolean @default(false)
  stockQty    Int @default(0)
  minStockLevel Int @default(0)
  reorderPoint Int @default(0)
  
  // Relationships
  variations  ProductVariation[]
  invoiceItems InvoiceItem[]
  user        User @relation(fields: [userId], references: [id])
  userId      String
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model ProductVariation {
  id          String @id @default(cuid())
  name        String // e.g., "Size", "Color"
  value       String // e.g., "Large", "Red"
  priceAdjust Int @default(0) // Price difference from base
  stockQty    Int @default(0)
  
  product     Product @relation(fields: [productId], references: [id], onDelete: Cascade)
  productId   String
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

enum ProductType {
  SERVICE
  PRODUCT
}
```

#### Updated InvoiceItem Model
```prisma
model InvoiceItem {
  id          String @id @default(cuid())
  description String // Keep for custom items
  quantity    Int
  rate        Int
  
  // New fields for product integration
  product     Product? @relation(fields: [productId], references: [id])
  productId   String?
  variation   ProductVariation? @relation(fields: [variationId], references: [id])
  variationId String?
  
  invoice     Invoice @relation(fields: [invoiceId], references: [id], onDelete: Cascade)
  invoiceId   String
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

### 2. New Pages & Components

#### Product Management Pages
- `/dashboard/products` - Main product catalog
- `/dashboard/products/new` - Create new product
- `/dashboard/products/[productId]` - Edit product
- `/dashboard/products/[productId]/variations` - Manage variations

#### Components
- `ProductList.tsx` - Display all products with search/filter
- `ProductForm.tsx` - Create/edit product form
- `ProductVariationManager.tsx` - Manage product variations
- `ProductSelector.tsx` - Select products for invoices
- `InventoryAlert.tsx` - Low stock notifications
- `StockUpdater.tsx` - Quick stock quantity updates

### 3. Enhanced Invoice Creation

#### Updated Invoice Flow
1. **Product Selection**: Choose from catalog or create custom item
2. **Variation Selection**: If product has variations
3. **Stock Validation**: Check availability before adding
4. **Auto-population**: Fill description, rate from product data
5. **Inventory Deduction**: Reduce stock on invoice creation

#### New Invoice Features
- Multi-item support (already in schema, need UI)
- Product search and selection
- Real-time stock validation
- Bulk pricing options
- Recurring invoice templates

### 4. Inventory Management Features

#### Stock Tracking
- Automatic stock deduction on invoice creation
- Stock addition on invoice deletion/cancellation
- Low stock alerts
- Stock movement history

#### Reporting
- Inventory valuation reports
- Best/worst selling products
- Stock turnover analysis
- Reorder recommendations

### 5. Implementation Phases

#### Phase 1: Database & Basic Product Management
1. Create new Prisma models
2. Run database migration
3. Build basic product CRUD operations
4. Create product management pages

#### Phase 2: Invoice Integration
1. Update invoice forms to support multiple items
2. Add product selector to invoice creation
3. Implement stock validation
4. Update invoice item creation logic

#### Phase 3: Advanced Features
1. Product variations
2. Inventory tracking and alerts
3. Bulk operations
4. Reporting dashboard

#### Phase 4: Enhanced Features
1. Advanced analytics
2. Business intelligence dashboard
3. Forecasting and trends

### 6. Technical Considerations

#### Database Performance
- Index on product SKU and name
- Composite indexes for stock queries
- Consider soft deletes for audit trail

#### User Experience
- Real-time stock validation
- Auto-save for product forms
- Bulk import/export functionality
- Mobile-responsive design

#### Security
- User-scoped product access
- Audit logging for stock changes
- Rate limiting for API endpoints

### 7. File Structure

```
app/
├── dashboard/
│   ├── products/
│   │   ├── page.tsx              # Product listing
│   │   ├── new/page.tsx          # Create product
│   │   └── [productId]/
│   │       ├── page.tsx          # Edit product
│   │       └── variations/page.tsx # Manage variations
│   └── invoices/
│       ├── create/page.tsx       # Enhanced with product selector
│       └── [invoiceId]/page.tsx  # Enhanced with product details
├── components/
│   ├── products/
│   │   ├── ProductList.tsx
│   │   ├── ProductForm.tsx
│   │   ├── ProductSelector.tsx
│   │   └── InventoryAlert.tsx
│   └── invoices/
│       └── InvoiceItemsManager.tsx # Multi-item support
└── utils/
    ├── productActions.ts         # Server actions
    ├── inventoryActions.ts       # Stock management
    └── productSchemas.ts         # Zod schemas
```

### 8. Migration Strategy

#### Backward Compatibility
- Keep existing `description` field in InvoiceItem
- Support mixed invoices (products + custom items)
- Gradual migration of existing invoice items

#### Data Migration
- Option to convert existing invoice items to products
- Bulk import from CSV/Excel
- API for external system integration

### 9. Success Metrics

#### User Adoption
- % of invoices using product catalog
- Reduction in invoice creation time
- Product catalog utilization rate

#### Inventory Efficiency
- Stock accuracy improvement
- Reduction in stockouts
- Improved cash flow from better inventory management

#### System Performance
- Invoice creation speed
- Search response times
- Report generation performance

## Next Steps

1. **Stakeholder Approval**: Review and approve the plan
2. **Database Design**: Finalize schema and create migration
3. **UI/UX Design**: Mock up key interfaces
4. **Development**: Begin Phase 1 implementation
5. **Testing**: Comprehensive testing at each phase
6. **Rollout**: Gradual feature release with user training

This plan provides a comprehensive roadmap for transforming the current invoice system into a full-featured invoicing and inventory management platform while maintaining backward compatibility and ensuring a smooth transition for existing users.