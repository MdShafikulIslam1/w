/*
  Warnings:

  - Added the required column `name` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "users" ADD COLUMN     "about" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "profilePhoto" TEXT NOT NULL DEFAULT '';
