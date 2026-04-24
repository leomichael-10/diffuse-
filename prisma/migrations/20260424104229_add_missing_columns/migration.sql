/*
  Warnings:

  - The values [seller] on the enum `Role` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `sellerId` on the `products` table. All the data in the column will be lost.
  - You are about to drop the `sellers` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `subscriptions` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "Role_new" AS ENUM ('buyer', 'admin');
ALTER TABLE "users" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "users" ALTER COLUMN "role" TYPE "Role_new" USING ("role"::text::"Role_new");
ALTER TYPE "Role" RENAME TO "Role_old";
ALTER TYPE "Role_new" RENAME TO "Role";
DROP TYPE "Role_old";
ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'buyer';
COMMIT;

-- DropForeignKey
ALTER TABLE "products" DROP CONSTRAINT "products_sellerId_fkey";

-- DropForeignKey
ALTER TABLE "sellers" DROP CONSTRAINT "sellers_userId_fkey";

-- DropForeignKey
ALTER TABLE "subscriptions" DROP CONSTRAINT "subscriptions_sellerId_fkey";

-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "paymentStatus" TEXT,
ADD COLUMN     "paymobOrderId" TEXT;

-- AlterTable
ALTER TABLE "products" DROP COLUMN "sellerId",
ADD COLUMN     "care" TEXT,
ADD COLUMN     "isFeatured" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "resetToken" TEXT,
ADD COLUMN     "resetTokenExpiry" TIMESTAMP(3);

-- DropTable
DROP TABLE "sellers";

-- DropTable
DROP TABLE "subscriptions";
