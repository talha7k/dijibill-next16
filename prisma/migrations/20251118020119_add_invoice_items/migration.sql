-- CreateTable
CREATE TABLE "InvoiceItem" (
    "id" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "rate" INTEGER NOT NULL,
    "invoiceId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InvoiceItem_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "InvoiceItem" ADD CONSTRAINT "InvoiceItem_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Migrate existing invoice data to new structure
INSERT INTO "InvoiceItem" (id, description, quantity, rate, "invoiceId", "createdAt", "updatedAt")
SELECT 
    gen_random_uuid() as id,
    "invoiceItemDescription" as description,
    "invoiceItemQuantity" as quantity,
    "invoiceItemRate" as rate,
    id as "invoiceId",
    "createdAt" as "createdAt",
    "updatedAt" as "updatedAt"
FROM "Invoice"
WHERE "invoiceItemDescription" IS NOT NULL;

-- Note: The old columns will be removed in a subsequent migration after data migration is verified