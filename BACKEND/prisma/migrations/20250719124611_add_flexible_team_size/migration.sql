-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "flexibleTeamSize" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "teamSizeMax" INTEGER,
ADD COLUMN     "teamSizeMin" INTEGER;
