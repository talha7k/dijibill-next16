# Forms Documentation

This guide explains how to build forms in our application using Conform for form management and shadcn/ui for UI components.

## Overview

Our form system combines:
- **Conform**: Form validation and state management
- **Zod**: Schema validation
- **shadcn/ui**: UI components
- **React Hook Form**: Form state handling

## Core Concepts

### 1. Form Structure

Every form in our application follows this pattern:

```tsx
"use client";

import { useActionState } from "react";
import { useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import { yourSchema } from "../utils/zodSchemas";
import { yourAction } from "../actions";
import { getInputProps } from "@conform-to/react";

export function YourForm({ data }: { data?: any }) {
  const [lastResult, action] = useActionState(yourAction, undefined);
  const [form, fields] = useForm({
    lastResult,
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: yourSchema });
    },
    shouldValidate: "onBlur",
    shouldRevalidate: "onInput",
  });

  return (
    <form id={form.id} action={action} onSubmit={form.onSubmit} noValidate>
      {/* Form fields here */}
    </form>
  );
}
```

### 2. Using `getInputProps()`

The `getInputProps()` helper from Conform integrates form validation with shadcn/ui components:

```tsx
import { getInputProps } from "@conform-to/react";

// Basic input
<Input
  {...getInputProps(fields.fieldName, { type: 'text' })}
  defaultValue={data?.fieldName || ""}
  placeholder="Enter value"
/>

// Email input
<Input
  {...getInputProps(fields.email, { type: 'email' })}
  defaultValue={data?.email || ""}
  placeholder="email@example.com"
/>

// Number input
<Input
  {...getInputProps(fields.quantity, { type: 'number' })}
  defaultValue={data?.quantity?.toString() || ""}
  placeholder="0"
/>

// Textarea
<Textarea
  {...getInputProps(fields.description, { type: 'text' })}
  defaultValue={data?.description || ""}
  placeholder="Enter description"
  rows={4}
/>
```

### 3. Error Handling

Display validation errors below each field:

```tsx
<Input
  {...getInputProps(fields.fieldName, { type: 'text' })}
  defaultValue={data?.fieldName || ""}
  placeholder="Enter value"
/>
<p className="text-red-500 text-sm">{fields.fieldName.errors}</p>
```

## Common Form Patterns

### 1. Simple Form (Create)

```tsx
export function CreateInvoiceForm() {
  const [lastResult, action] = useActionState(createInvoice, undefined);
  const [form, fields] = useForm({
    lastResult,
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: invoiceSchema });
    },
    shouldValidate: "onBlur",
    shouldRevalidate: "onInput",
  });

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardContent className="p-6">
        <form id={form.id} action={action} onSubmit={form.onSubmit} noValidate>
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div>
              <Label>Invoice Name</Label>
              <Input
                {...getInputProps(fields.invoiceName, { type: 'text' })}
                placeholder="Test 123"
              />
              <p className="text-sm text-red-500">{fields.invoiceName.errors}</p>
            </div>
            
            <div>
              <Label>Client Email</Label>
              <Input
                {...getInputProps(fields.clientEmail, { type: 'email' })}
                placeholder="client@example.com"
              />
              <p className="text-sm text-red-500">{fields.clientEmail.errors}</p>
            </div>
          </div>

          <div className="flex items-center justify-end mt-6">
            <SubmitButton text="Create Invoice" />
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
```

### 2. Edit Form with Data

```tsx
export function EditForm({ data }: { data: YourDataType }) {
  const [lastResult, action] = useActionState(editAction, undefined);
  const [form, fields] = useForm({
    lastResult,
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: yourSchema });
    },
    shouldValidate: "onBlur",
    shouldRevalidate: "onInput",
  });

  return (
    <form id={form.id} action={action} onSubmit={form.onSubmit} noValidate>
      {/* Hidden ID field for updates */}
      <input type="hidden" name="id" value={data.id} />
      
      <div>
        <Label>Field Name</Label>
        <Input
          {...getInputProps(fields.fieldName, { type: 'text' })}
          defaultValue={data.fieldName || ""}
          placeholder="Enter value"
        />
        <p className="text-sm text-red-500">{fields.fieldName.errors}</p>
      </div>
      
      <SubmitButton text="Update" />
    </form>
  );
}
```

### 3. Select Dropdowns

```tsx
<Select
  name={fields.currency.name}
  key={fields.currency.key}
  defaultValue={data?.currency}
>
  <SelectTrigger>
    <SelectValue placeholder="Select Currency" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="USD">United States Dollar -- USD</SelectItem>
    <SelectItem value="EUR">Euro -- EUR</SelectItem>
  </SelectContent>
</Select>
<p className="text-red-500 text-sm">{fields.currency.errors}</p>
```

### 4. Date Pickers

```tsx
<Popover>
  <PopoverTrigger asChild>
    <Button variant="outline" className="w-full text-left justify-start">
      <CalendarIcon />
      {selectedDate ? (
        new Intl.DateTimeFormat("en-US", {
          dateStyle: "long",
        }).format(selectedDate)
      ) : (
        <span>Pick a Date</span>
      )}
    </Button>
  </PopoverTrigger>
  <PopoverContent>
    <Calendar
      selected={selectedDate}
      onSelect={(date) => setSelectedDate(date || new Date())}
      mode="single"
      disabled={{ before: new Date() }}
    />
  </PopoverContent>
</Popover>

{/* Hidden field for form submission */}
<input
  type="hidden"
  name={fields.date.name}
  value={selectedDate.toISOString()}
/>
```

### 5. Complex Forms with State

```tsx
export function ComplexForm({ data }: { data?: any }) {
  const [lastResult, action] = useActionState(yourAction, undefined);
  const [form, fields] = useForm({
    lastResult,
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: yourSchema });
    },
    shouldValidate: "onBlur",
    shouldRevalidate: "onInput",
  });

  // Local state for complex interactions
  const [rate, setRate] = useState(data?.rate?.toString() || "0");
  const [quantity, setQuantity] = useState(data?.quantity?.toString() || "1");
  const [currency, setCurrency] = useState(data?.currency || "USD");

  // Calculated values
  const total = (Number(quantity) || 0) * (Number(rate) || 0);

  return (
    <form id={form.id} action={action} onSubmit={form.onSubmit} noValidate>
      {/* Hidden fields for calculated values */}
      <input type="hidden" name={fields.total.name} value={total} />
      
      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-6">
          <Label>Description</Label>
          <Textarea
            {...getInputProps(fields.description, { type: 'text' })}
            defaultValue={data?.description || ""}
            placeholder="Item description"
          />
          <p className="text-red-500 text-sm">{fields.description.errors}</p>
        </div>
        
        <div className="col-span-2">
          <Label>Quantity</Label>
          <Input
            {...getInputProps(fields.quantity, { type: 'number' })}
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            placeholder="0"
          />
          <p className="text-red-500 text-sm">{fields.quantity.errors}</p>
        </div>
        
        <div className="col-span-2">
          <Label>Rate</Label>
          <Input
            {...getInputProps(fields.rate, { type: 'number' })}
            value={rate}
            onChange={(e) => setRate(e.target.value)}
            placeholder="0"
          />
          <p className="text-red-500 text-sm">{fields.rate.errors}</p>
        </div>
        
        <div className="col-span-2">
          <Label>Total</Label>
          <Input
            value={formatCurrency({ amount: total, currency: currency as "USD" | "EUR" })}
            disabled
          />
        </div>
      </div>
    </form>
  );
}
```

## Schema Validation

### 1. Creating Schemas

```tsx
// app/utils/zodSchemas.ts
import { z } from "zod";

export const yourSchema = z.object({
  fieldName: z.string().min(1, "Field is required"),
  email: z.string().email("Invalid email address"),
  quantity: z.number().min(1, "Minimum quantity is 1"),
  rate: z.number().min(0, "Rate must be positive"),
  optionalField: z.string().optional(),
});

export const complexSchema = z.object({
  items: z.array(z.object({
    description: z.string().min(1, "Description is required"),
    quantity: z.number().min(1, "Quantity min 1"),
    rate: z.number().min(1, "Rate min 1"),
  })).min(1, "At least one item is required"),
});
```

### 2. Server Actions

```tsx
// app/actions.ts
"use server";

import { requireUser } from "./utils/hooks";
import { parseWithZod } from "@conform-to/zod";
import { yourSchema } from "./utils/zodSchemas";
import prisma from "./utils/db";
import { redirect } from "next/navigation";

export async function yourAction(prevState: unknown, formData: FormData) {
  const session = await requireUser();

  const submission = parseWithZod(formData, {
    schema: yourSchema,
  });

  if (submission.status !== "success") {
    return submission.reply();
  }

  // Create or update data
  await prisma.yourModel.create({
    data: {
      fieldName: submission.value.fieldName,
      email: submission.value.email,
      quantity: submission.value.quantity,
      rate: submission.value.rate,
      userId: session.user?.id,
    },
  });

  return redirect("/dashboard");
}
```

## Best Practices

### 1. Form Layout
- Use `Card` and `CardContent` for form containers
- Use `grid` classes for responsive layouts
- Group related fields together
- Provide clear labels with `Label` components

### 2. Validation
- Always provide meaningful error messages in Zod schemas
- Display errors below each field
- Use `noValidate` on form element to let Conform handle validation

### 3. User Experience
- Use `SubmitButton` for consistent submit buttons
- Provide helpful placeholders
- Use appropriate input types (email, number, tel, url)
- Disable fields when they should be read-only

### 4. State Management
- Use local state for complex interactions (calculations, UI updates)
- Sync local state with form values using hidden inputs
- Use `defaultValue` for pre-filling forms with existing data

### 5. Accessibility
- Always associate `Label` with inputs
- Use semantic HTML elements
- Provide clear error messages
- Ensure keyboard navigation works

## Common Issues and Solutions

### 1. Form Not Submitting
- Ensure `form.id` is set on the form element
- Check that `onSubmit={form.onSubmit}` is present
- Verify `noValidate` attribute is set

### 2. Validation Not Working
- Check that `onValidate` callback is properly configured
- Ensure schema is correctly imported and used
- Verify field names match schema keys

### 3. Errors Not Displaying
- Make sure to access `fields.fieldName.errors`
- Check that error styling classes are applied
- Verify error messages are returned from schema

### 4. Default Values Not Working
- Use `defaultValue` prop, not `value`
- For complex objects, access nested properties safely
- Ensure data is properly passed to component

## Component Reference

### Required Imports
```tsx
import { useActionState } from "react";
import { useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import { getInputProps } from "@conform-to/react";
```

### shadcn/ui Components Used
- `Card`, `CardContent`, `CardHeader`, `CardTitle`
- `Input`, `Textarea`, `Label`
- `Button`, `SubmitButton`
- `Select`, `SelectContent`, `SelectItem`, `SelectTrigger`, `SelectValue`
- `Popover`, `PopoverContent`, `PopoverTrigger`
- `Calendar`

This documentation should help you build consistent, accessible, and validated forms throughout the application.