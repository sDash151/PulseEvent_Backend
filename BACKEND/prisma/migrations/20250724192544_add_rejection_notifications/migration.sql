-- CreateTable
CREATE TABLE "RejectionNotification" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "eventId" INTEGER NOT NULL,
    "eventTitle" TEXT NOT NULL,
    "rejectionReason" TEXT,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RejectionNotification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RejectionNotification_userId_idx" ON "RejectionNotification"("userId");

-- CreateIndex
CREATE INDEX "RejectionNotification_eventId_idx" ON "RejectionNotification"("eventId");

-- CreateIndex
CREATE UNIQUE INDEX "RejectionNotification_userId_eventId_key" ON "RejectionNotification"("userId", "eventId");

-- AddForeignKey
ALTER TABLE "RejectionNotification" ADD CONSTRAINT "RejectionNotification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RejectionNotification" ADD CONSTRAINT "RejectionNotification_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
