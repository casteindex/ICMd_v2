/*
  Warnings:

  - A unique constraint covering the columns `[classId,code]` on the table `Station` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[email]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Station_code_key";

-- CreateIndex
CREATE UNIQUE INDEX "Station_classId_code_key" ON "Station"("classId", "code");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
