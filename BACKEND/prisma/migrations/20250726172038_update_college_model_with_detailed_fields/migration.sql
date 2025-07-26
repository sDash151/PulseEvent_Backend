/*
  Warnings:

  - You are about to drop the column `address` on the `College` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "College" DROP COLUMN "address",
ADD COLUMN     "addressLine1" TEXT,
ADD COLUMN     "addressLine2" TEXT,
ADD COLUMN     "collegeId" INTEGER,
ADD COLUMN     "pincode" INTEGER;

-- CreateIndex
CREATE INDEX "College_collegeId_idx" ON "College"("collegeId");
