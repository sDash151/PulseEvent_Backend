-- CreateTable
CREATE TABLE "WhatsAppNotification" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "eventId" INTEGER NOT NULL,
    "eventTitle" TEXT NOT NULL,
    "whatsappGroupLink" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WhatsAppNotification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "WhatsAppNotification_userId_idx" ON "WhatsAppNotification"("userId");

-- CreateIndex
CREATE INDEX "WhatsAppNotification_eventId_idx" ON "WhatsAppNotification"("eventId");

-- CreateIndex
CREATE UNIQUE INDEX "WhatsAppNotification_userId_eventId_key" ON "WhatsAppNotification"("userId", "eventId");

-- AddForeignKey
ALTER TABLE "WhatsAppNotification" ADD CONSTRAINT "WhatsAppNotification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WhatsAppNotification" ADD CONSTRAINT "WhatsAppNotification_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
