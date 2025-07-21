-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "whatsappGroupEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "whatsappGroupLink" TEXT;
