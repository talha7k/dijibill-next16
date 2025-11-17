"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SubmitButton } from "@/app/components/SubmitButtons";
import { useActionState } from "react";
import { useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import { companySchema } from "../utils/zodSchemas";
import { updateCompany } from "../actions";
import { getInputProps } from "@conform-to/react";
import { Company } from "@prisma/client";

export function CompanySettings({ data }: { data?: Company | null }) {
  const [lastResult, action] = useActionState(updateCompany, undefined);
  const [form, fields] = useForm({
    lastResult: lastResult && 'success' in lastResult ? undefined : lastResult,
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: companySchema });
    },
    shouldValidate: "onBlur",
    shouldRevalidate: "onInput",
  });

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Company Information</CardTitle>
        <CardDescription>
          Manage your company details that will appear on invoices and emails.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <form id={form.id} action={action} onSubmit={form.onSubmit} noValidate>
          <input type="hidden" name="id" value={data?.id || ""} />
          
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div>
              <Label>Company Name</Label>
              <Input
                {...getInputProps(fields.name, { type: 'text' })}
                defaultValue={data?.name || ""}
                placeholder="Your Company LLC"
              />
              <p className="text-red-500 text-sm">{fields.name.errors}</p>
            </div>

            <div>
              <Label>Company Email</Label>
              <Input
                {...getInputProps(fields.email, { type: 'email' })}
                defaultValue={data?.email || ""}
                placeholder="billing@yourcompany.com"
              />
              <p className="text-red-500 text-sm">{fields.email.errors}</p>
            </div>
          </div>

          <div className="mb-6">
            <Label>Address</Label>
            <Textarea
              {...getInputProps(fields.address, { type: 'text' })}
              defaultValue={data?.address || ""}
              placeholder="123 Business St, Suite 100&#10;City, State 12345&#10;Country"
              rows={3}
            />
            <p className="text-red-500 text-sm">{fields.address.errors}</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div>
              <Label>Phone Number</Label>
              <Input
                {...getInputProps(fields.phone, { type: 'tel' })}
                defaultValue={data?.phone || ""}
                placeholder="+1 (555) 123-4567"
              />
              <p className="text-red-500 text-sm">{fields.phone.errors}</p>
            </div>

            <div>
              <Label>Website</Label>
              <Input
                {...getInputProps(fields.website, { type: 'url' })}
                defaultValue={data?.website || ""}
                placeholder="https://yourcompany.com"
              />
              <p className="text-red-500 text-sm">{fields.website.errors}</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div>
              <Label>Tax ID / VAT Number</Label>
              <Input
                {...getInputProps(fields.taxId, { type: 'text' })}
                defaultValue={data?.taxId || ""}
                placeholder="US-123456789"
              />
              <p className="text-red-500 text-sm">{fields.taxId.errors}</p>
            </div>

            <div>
              <Label>Logo URL</Label>
              <Input
                {...getInputProps(fields.logo, { type: 'url' })}
                defaultValue={data?.logo || ""}
                placeholder="https://yourcompany.com/logo.png"
              />
              <p className="text-red-500 text-sm">{fields.logo.errors}</p>
              <p className="text-sm text-gray-500 mt-1">
                Enter a URL to your company logo. Recommended size: 200x60px
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end mt-6">
            <div>
              <SubmitButton text="Save Company Information" />
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}