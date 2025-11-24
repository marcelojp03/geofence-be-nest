/*
  Warnings:

  - You are about to drop the column `device_id` on the `devices` table. All the data in the column will be lost.
  - You are about to drop the column `device_name` on the `devices` table. All the data in the column will be lost.
  - You are about to drop the column `code` on the `schools` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[device_uid]` on the table `devices` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `device_uid` to the `devices` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "sig"."idx_child_positions_geom";

-- DropIndex
DROP INDEX "sig"."devices_device_id_key";

-- DropIndex
DROP INDEX "sig"."idx_schools_geom";

-- DropIndex
DROP INDEX "sig"."schools_code_key";

-- AlterTable
ALTER TABLE "sig"."child_positions" ADD COLUMN     "battery_level" INTEGER;

-- AlterTable
ALTER TABLE "sig"."children" ADD COLUMN     "age" INTEGER;

-- AlterTable
ALTER TABLE "sig"."devices" DROP COLUMN "device_id",
DROP COLUMN "device_name",
ADD COLUMN     "device_uid" VARCHAR(255) NOT NULL,
ADD COLUMN     "last_battery" INTEGER,
ADD COLUMN     "manufacturer" VARCHAR(255),
ADD COLUMN     "model" VARCHAR(255),
ADD COLUMN     "name" VARCHAR(255),
ADD COLUMN     "os_version" VARCHAR(50);

-- AlterTable
ALTER TABLE "sig"."schools" DROP COLUMN "code";

-- CreateIndex
CREATE UNIQUE INDEX "devices_device_uid_key" ON "sig"."devices"("device_uid");
