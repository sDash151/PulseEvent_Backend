-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "collegeId" INTEGER;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "collegeDepartment" TEXT,
ADD COLUMN     "collegeDistrict" TEXT,
ADD COLUMN     "collegeName" TEXT,
ADD COLUMN     "collegeState" TEXT,
ADD COLUMN     "degreeName" TEXT,
ADD COLUMN     "specializationName" TEXT;

-- CreateTable
CREATE TABLE "College" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT,
    "city" TEXT,
    "district" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "College_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Degree" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Degree_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Specialization" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "degreeId" INTEGER NOT NULL,

    CONSTRAINT "Specialization_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "College_state_idx" ON "College"("state");

-- CreateIndex
CREATE INDEX "College_district_idx" ON "College"("district");

-- CreateIndex
CREATE INDEX "College_state_district_idx" ON "College"("state", "district");

-- CreateIndex
CREATE UNIQUE INDEX "Degree_name_key" ON "Degree"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Specialization_name_degreeId_key" ON "Specialization"("name", "degreeId");

-- CreateIndex
CREATE INDEX "Event_collegeId_idx" ON "Event"("collegeId");

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_collegeId_fkey" FOREIGN KEY ("collegeId") REFERENCES "College"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Specialization" ADD CONSTRAINT "Specialization_degreeId_fkey" FOREIGN KEY ("degreeId") REFERENCES "Degree"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
