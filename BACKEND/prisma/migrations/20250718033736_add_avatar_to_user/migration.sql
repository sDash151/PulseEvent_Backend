-- CreateEnum
CREATE TYPE "EventType" AS ENUM ('STANDALONE', 'MEGA', 'SUB');

-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "parentEventId" INTEGER,
ADD COLUMN     "paymentEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "type" "EventType" NOT NULL DEFAULT 'STANDALONE';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "avatar" TEXT;

-- CreateIndex
CREATE INDEX "Event_parentEventId_idx" ON "Event"("parentEventId");

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_parentEventId_fkey" FOREIGN KEY ("parentEventId") REFERENCES "Event"("id") ON DELETE SET NULL ON UPDATE CASCADE;
