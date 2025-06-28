/*
  Warnings:

  - A unique constraint covering the columns `[credentialPrivateEmail]` on the table `UserProfile` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[publicEmail]` on the table `UserProfile` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "UserProfile_credentialPrivateEmail_key" ON "UserProfile"("credentialPrivateEmail");

-- CreateIndex
CREATE UNIQUE INDEX "UserProfile_publicEmail_key" ON "UserProfile"("publicEmail");
