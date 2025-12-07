-- CreateEnum
CREATE TYPE "sig"."DeviceOwnerType" AS ENUM ('CHILD', 'PARENT');

-- AlterTable
ALTER TABLE "sig"."devices" ADD COLUMN     "owner_type" "sig"."DeviceOwnerType" NOT NULL DEFAULT 'CHILD';
