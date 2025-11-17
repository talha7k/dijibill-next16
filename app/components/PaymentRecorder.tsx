"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { SubmitButton } from "./SubmitButtons";
import { useActionState } from "react";
import { useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import { paymentSchema } from "../utils/zodSchemas";
import { recordPayment } from "../actions";
import { formatCurrency } from "../utils/formatCurrency";
import { getPaymentProgress, type Payment } from "../utils/payments";
import { CalendarDays, DollarSign, TrendingUp } from "lucide-react";
import { getInputProps } from "@conform-to/react";

interface iAppProps {
  invoiceId: string;
  total: number;
  totalPaid: number;
  status: string;
  date: Date;
  dueDate: number;
  currency: string;
  payments: Payment[];
}

export function PaymentRecorder({ 
  invoiceId, 
  total, 
  totalPaid, 
  status, 
  date, 
  dueDate, 
  currency,
  payments 
}: iAppProps) {
  const [lastResult, action] = useActionState(recordPayment, undefined);
  const [form, fields] = useForm({
    lastResult,
    onValidate({ formData }) {
      return parseWithZod(formData, {
        schema: paymentSchema,
      });
    },
    shouldValidate: "onBlur",
    shouldRevalidate: "onInput",
  });

  const progressPercentage = getPaymentProgress(total, totalPaid);
  const remainingAmount = total - totalPaid;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PAID":
        return "bg-green-500";
      case "PARTIALLY_PAID":
        return "bg-yellow-500";
      case "OVERDUE":
        return "bg-red-500";
      case "EMAILED":
        return "bg-blue-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "PAID":
        return "Paid";
      case "PARTIALLY_PAID":
        return "Partially Paid";
      case "OVERDUE":
        return "Overdue";
      case "EMAILED":
        return "Emailed";
      default:
        return "Pending";
    }
  };

  return (
    <div className="space-y-6">
      {/* Payment Status Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Payment Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Current Status</span>
              <Badge className={getStatusColor(status)}>
                {getStatusText(status)}
              </Badge>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress</span>
                <span>{progressPercentage.toFixed(1)}%</span>
              </div>
              <Progress value={progressPercentage} className="h-2" />
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Total Amount:</span>
                <p className="font-medium">
                  {formatCurrency({ amount: total, currency: currency as "USD" | "EUR" })}
                </p>
              </div>
              <div>
                <span className="text-muted-foreground">Paid Amount:</span>
                <p className="font-medium text-green-600">
                  {formatCurrency({ amount: totalPaid, currency: currency as "USD" | "EUR" })}
                </p>
              </div>
              <div>
                <span className="text-muted-foreground">Remaining:</span>
                <p className="font-medium text-orange-600">
                  {formatCurrency({ amount: remainingAmount, currency: currency as "USD" | "EUR" })}
                </p>
              </div>
              <div>
                <span className="text-muted-foreground">Due Date:</span>
                <p className="font-medium">
                  {new Date(date.getTime() + dueDate * 24 * 60 * 60 * 1000).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Record New Payment */}
      {status !== "PAID" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Record New Payment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form id={form.id} action={action} onSubmit={form.onSubmit} noValidate>
              <input type="hidden" name="invoiceId" value={invoiceId} />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor={fields.amount.id}>Payment Amount *</Label>
                  <Input
                    {...getInputProps(fields.amount, { type: 'number' })}
                    placeholder="0.00"
                    min="0.01"
                    max={remainingAmount}
                    step="0.01"
                  />
                  {fields.amount.errors && (
                    <p className="text-sm text-red-500">{fields.amount.errors}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor={fields.method.id}>Payment Method</Label>
                  <Select name={fields.method.name} defaultValue="">
                    <SelectTrigger>
                      <SelectValue placeholder="Select method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                      <SelectItem value="credit_card">Credit Card</SelectItem>
                      <SelectItem value="debit_card">Debit Card</SelectItem>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="check">Check</SelectItem>
                      <SelectItem value="paypal">PayPal</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  {fields.method.errors && (
                    <p className="text-sm text-red-500">{fields.method.errors}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2 mt-4">
                <Label htmlFor={fields.notes.id}>Notes (Optional)</Label>
                <Textarea
                  {...getInputProps(fields.notes, { type: 'text' })}
                  placeholder="Add any notes about this payment..."
                  rows={3}
                />
                {fields.notes.errors && (
                  <p className="text-sm text-red-500">{fields.notes.errors}</p>
                )}
              </div>

              <div className="flex justify-end mt-6">
                <SubmitButton text="Record Payment" />
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Payment History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5" />
            Payment History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {payments.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              No payments recorded yet
            </p>
          ) : (
            <div className="space-y-3">
              {payments.map((payment) => (
                <div
                  key={payment.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        {formatCurrency({ 
                          amount: payment.amount, 
                          currency: currency as "USD" | "EUR" 
                        })}
                      </span>
                      {payment.method && (
                        <Badge variant="outline" className="text-xs">
                          {payment.method.replace("_", " ").toUpperCase()}
                        </Badge>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(payment.paymentDate).toLocaleDateString()}
                      {payment.notes && (
                        <span className="block mt-1">{payment.notes}</span>
                      )}
                    </div>
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