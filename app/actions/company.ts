"use server";

import { requireUser } from "../utils/hooks";
import { parseWithZod } from "@conform-to/zod";
import { companySchema } from "../utils/zodSchemas";
import prisma from "../utils/db";

export async function updateCompany(prevState: unknown, formData: FormData) {
  const session = await requireUser();

  const submission = parseWithZod(formData, {
    schema: companySchema,
  });

  if (submission.status !== "success") {
    return submission.reply();
  }

  const id = formData.get("id") as string;

  if (id) {
    // Update existing company
     await prisma.company.update({
       where: {
         id: id,
         userId: session.user?.id as string,
       },
      data: {
        name: submission.value.name,
        email: submission.value.email,
        address: submission.value.address || null,
        phone: submission.value.phone || null,
        website: submission.value.website || null,
        logo: submission.value.logo || null,
        taxId: submission.value.taxId || null,
      },
    });
  } else {
    // Create new company
    await prisma.company.create({
      data: {
        name: submission.value.name,
        email: submission.value.email,
        address: submission.value.address || null,
        phone: submission.value.phone || null,
        website: submission.value.website || null,
        logo: submission.value.logo || null,
        taxId: submission.value.taxId || null,
        userId: session.user?.id as string,
      },
    });
  }

  return submission.reply();
}