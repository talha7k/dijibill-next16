"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { CalendarIcon } from "lucide-react";
import { SubmitButton } from "./SubmitButtons";
import { useActionState, useState } from "react";
import { useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import { invoiceSchema } from "../utils/zodSchemas";
import { editInvoice } from "../actions";
import { formatCurrency } from "../utils/formatCurrency";
import { getInputProps } from "@conform-to/react";
import { Prisma } from "@prisma/client";
import { Payment } from "../utils/payments";
import { PaymentRecorder } from "./PaymentRecorder";
import { ProductSelector } from "./ProductSelector";

interface iAppProps {
  data: Prisma.InvoiceGetPayload<{
    include: {
      invoiceItems: true;
    };
  }> & {
    payments?: Payment[];
    totalPaid?: number;
  };
}

interface InvoiceItem {
  id: string;
  productId: string | null;
  variationId: string | null;
  description: string;
  quantity: number;
  rate: number;
}

export function EditInvoice({ data }: iAppProps) {
  const [lastResult, action] = useActionState(editInvoice, undefined);
  const [form, fields] = useForm({
    lastResult,

    onValidate({ formData }) {
      return parseWithZod(formData, {
        schema: invoiceSchema,
      });
    },

    shouldValidate: "onBlur",
    shouldRevalidate: "onInput",
  });

  const [selectedDate, setSelectedDate] = useState(data.date);
  const [currency, setCurrency] = useState(data.currency);
  
  // Initialize items from existing invoice data or create default item for backward compatibility
  const [items, setItems] = useState<InvoiceItem[]>(() => {
    if (data.invoiceItems && data.invoiceItems.length > 0) {
      return data.invoiceItems.map((item: any) => ({
        id: item.id,
        productId: item.productId || null,
        variationId: item.variationId || null,
        description: item.description,
        quantity: item.quantity,
        rate: item.rate,
      }));
    } else {
      // Backward compatibility: create single item from old fields
      return [{
        id: 'temp-' + Date.now(),
        productId: null,
        variationId: null,
        description: (data as any).invoiceItemDescription || "",
        quantity: (data as any).invoiceItemQuantity || 1,
        rate: (data as any).invoiceItemRate || 0,
      }];
    }
  });

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + (item.quantity * item.rate), 0);
  };

  const total = calculateTotal();
  return (
    <div className="space-y-8">
      <Card className="w-full max-w-4xl mx-auto">
        <CardContent className="p-6">
          <form id={form.id} action={action} onSubmit={form.onSubmit} noValidate>
          <input
            type="hidden"
            name={fields.date.name}
            value={selectedDate.toISOString()}
          />
          <input type="hidden" name="id" value={data.id} />

          <input
            type="hidden"
            name={fields.total.name}
            value={total}
          />
          {/* Hidden field for invoice items */}
          <input
            type="hidden"
            name={fields.invoiceItems.name}
            value={JSON.stringify(items.map(item => ({
              description: item.description,
              quantity: item.quantity,
              rate: item.rate,
              productId: item.productId,
              variationId: item.variationId,
            })))}
          />

          <div className="flex flex-col gap-1 w-fit mb-6">
            <div className="flex items-center gap-4">
              <Badge variant="secondary">Draft</Badge>
              <Input
                {...getInputProps(fields.invoiceName, { type: 'text' })}
                defaultValue={data.invoiceName}
                placeholder="Test 123"
              />
            </div>
            <p className="text-sm text-red-500">{fields.invoiceName.errors}</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-6">
            <div>
              <Label>Invoice No.</Label>
              <div className="flex">
                <span className="px-3 border border-r-0 rounded-l-md bg-muted flex items-center">
                  #
                </span>
                <Input
                  {...getInputProps(fields.invoiceNumber, { type: 'number' })}
                  defaultValue={data.invoiceNumber}
                  className="rounded-l-none"
                  placeholder="5"
                />
              </div>
              <p className="text-red-500 text-sm">
                {fields.invoiceNumber.errors}
              </p>
            </div>

            <div>
              <Label>Currency</Label>
              <Select
                name={fields.currency.name}
                key={fields.currency.key}
                defaultValue={data.currency}
                onValueChange={(value) => setCurrency(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Currency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">
                    United States Dollar -- USD
                  </SelectItem>
                  <SelectItem value="EUR">Euro -- EUR</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-red-500 text-sm">{fields.currency.errors}</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div>
              <Label>From</Label>
              <div className="space-y-2">
                <Input
                  {...getInputProps(fields.fromName, { type: 'text' })}
                  placeholder="Your Name"
                  defaultValue={data.fromName}
                />
                <p className="text-red-500 text-sm">{fields.fromName.errors}</p>
                <Input
                  {...getInputProps(fields.fromEmail, { type: 'email' })}
                  placeholder="Your Email"
                  defaultValue={data.fromEmail}
                />
                <p className="text-red-500 text-sm">
                  {fields.fromEmail.errors}
                </p>
                <Input
                  {...getInputProps(fields.fromAddress, { type: 'text' })}
                  placeholder="Your Address"
                  defaultValue={data.fromAddress}
                />
                <p className="text-red-500 text-sm">
                  {fields.fromAddress.errors}
                </p>
              </div>
            </div>

            <div>
              <Label>To</Label>
              <div className="space-y-2">
                <Input
                  {...getInputProps(fields.clientName, { type: 'text' })}
                  defaultValue={data.clientName}
                  placeholder="Client Name"
                />
                <p className="text-red-500 text-sm">
                  {fields.clientName.errors}
                </p>
                <Input
                  {...getInputProps(fields.clientEmail, { type: 'email' })}
                  defaultValue={data.clientEmail}
                  placeholder="Client Email"
                />
                <p className="text-red-500 text-sm">
                  {fields.clientEmail.errors}
                </p>
                <Input
                  {...getInputProps(fields.clientAddress, { type: 'text' })}
                  defaultValue={data.clientAddress}
                  placeholder="Client Address"
                />
                <p className="text-red-500 text-sm">
                  {fields.clientAddress.errors}
                </p>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div>
              <div>
                <Label>Date</Label>
              </div>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-[280px] text-left justify-start"
                  >
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
              <p className="text-red-500 text-sm">{fields.date.errors}</p>
            </div>

            <div>
              <Label>Invoice Due</Label>
              <Select
                name={fields.dueDate.name}
                key={fields.dueDate.key}
                defaultValue={data.dueDate.toString()}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select due date" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Due on Reciept</SelectItem>
                  <SelectItem value="15">Net 15</SelectItem>
                  <SelectItem value="30">Net 30</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-red-500 text-sm">{fields.dueDate.errors}</p>
            </div>
          </div>

          {/* Product Selector */}
            <ProductSelector 
              items={items} 
              onItemsChange={setItems} 
              currency={currency} 
            />

          <div className="flex justify-end">
            <div className="w-1/3">
              <div className="flex justify-between py-2">
                <span>Subtotal</span>
                <span>
                  {formatCurrency({
                    amount: total,
                    currency: currency as "USD" | "EUR",
                  })}
                </span>
              </div>
              <div className="flex justify-between py-2 border-t">
                <span>Total ({currency})</span>
                <span className="font-medium underline underline-offset-2">
                  {formatCurrency({
                    amount: total,
                    currency: currency as "USD" | "EUR",
                  })}
                </span>
              </div>
            </div>
          </div>

          <div>
            <Label>Note</Label>
            <Textarea
              {...getInputProps(fields.note, { type: 'text' })}
              defaultValue={data.note ?? undefined}
              placeholder="Add your Note/s right here..."
            />
            <p className="text-red-500 text-sm">{fields.note.errors}</p>
          </div>

          <div className="flex items-center justify-end mt-6">
            <div>
              <SubmitButton text="Update Invoice" />
            </div>
          </div>
          </form>
        </CardContent>
      </Card>

      {/* Payment Section */}
      <PaymentRecorder
        invoiceId={data.id}
        total={data.total}
        totalPaid={data.totalPaid || 0}
        status={data.status}
        date={data.date}
        dueDate={data.dueDate}
        currency={data.currency}
        payments={data.payments || []}
      />
    </div>
  );
}
