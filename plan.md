# Invoice Payment System Implementation Plan

## Overview
This plan outlines the implementation of a payment recording system for the invoice platform, allowing users to track partial payments and manage invoice statuses accordingly.

## Current State
- Basic invoice system with PAID/PENDING status
- No payment tracking capability
- Limited status management

## Implementation Steps

### Phase 1: Database Schema Updates

#### 1. Update InvoiceStatus Enum
- Add `PARTIALLY_PAID` status
- Add `OVERDUE` status
- Keep existing `PAID` and `PENDING` statuses

#### 2. Create Payment Model
```prisma
model Payment {
  id          String   @id @default(cuid())
  amount      Int
  paymentDate DateTime @default(now())
  method      String?  // e.g., "bank_transfer", "credit_card", "cash"
  notes       String?
  
  invoice     Invoice  @relation(fields: [invoiceId], references: [id], onDelete: Cascade)
  invoiceId   String
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

#### 3. Update Invoice Model
- Add `payments` relation to Payment model
- Add `totalPaid` field to track cumulative payments
- Update status calculation logic

### Phase 2: Database Migration
- Generate and apply Prisma migration
- Update existing invoices with appropriate `totalPaid` values

### Phase 3: Backend Logic

#### 1. Server Actions
- `recordPayment(invoiceId, amount, method?, notes?)`
- `updateInvoiceStatus(invoiceId)` - automatic status calculation
- `getPaymentHistory(invoiceId)`

#### 2. Status Calculation Logic
- PENDING: totalPaid = 0
- PARTIALLY_PAID: 0 < totalPaid < total
- PAID: totalPaid >= total
- OVERDUE: dueDate passed AND status != PAID

### Phase 4: Frontend Implementation

#### 1. Payment Recording UI
- Add payment form on invoice detail pages
- Payment amount input
- Payment method selection
- Notes field
- Submit button

#### 2. Invoice Status Display
- Visual indicators for different statuses
- Progress bars showing payment completion
- Payment history table

#### 3. Dashboard Updates
- Show payment status in invoice lists
- Add payment-related metrics

### Phase 5: Additional Features

#### 1. Payment Reminders
- Automatic overdue detection
- Email notifications for overdue invoices

#### 2. Payment Reports
- Monthly payment summaries
- Client payment history

## File Changes Required

### Database
- `prisma/schema.prisma` - Update models and enums
- New migration files

### Backend
- `app/actions.ts` - Add payment-related server actions
- `app/utils/` - Add payment calculation utilities

### Frontend
- `app/dashboard/invoices/[invoiceId]/page.tsx` - Add payment recording
- `app/components/` - New payment-related components
- `app/components/InvoiceList.tsx` - Update status display

## Testing Considerations
- Test payment recording with various amounts
- Verify status calculations (partial, full, overdue)
- Test payment history display
- Validate data integrity during concurrent payments

## Timeline Estimate
- Phase 1-2: 2-3 hours (Database setup)
- Phase 3: 2-3 hours (Backend logic)
- Phase 4: 4-5 hours (Frontend implementation)
- Phase 5: Future enhancement

Total estimated time: 8-11 hours for core functionality