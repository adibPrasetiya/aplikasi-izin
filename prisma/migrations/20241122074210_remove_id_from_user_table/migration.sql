/*
  Warnings:

  - The primary key for the `users` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `users` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `leaverequests` DROP FOREIGN KEY `LeaveRequests_managerId_fkey`;

-- DropForeignKey
ALTER TABLE `leaverequests` DROP FOREIGN KEY `LeaveRequests_userId_fkey`;

-- AlterTable
ALTER TABLE `users` DROP PRIMARY KEY,
    DROP COLUMN `id`,
    ADD PRIMARY KEY (`username`);

-- AddForeignKey
ALTER TABLE `LeaveRequests` ADD CONSTRAINT `LeaveRequests_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `Users`(`username`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LeaveRequests` ADD CONSTRAINT `LeaveRequests_managerId_fkey` FOREIGN KEY (`managerId`) REFERENCES `Users`(`username`) ON DELETE SET NULL ON UPDATE CASCADE;
