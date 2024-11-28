-- CreateTable
CREATE TABLE `LeaveRequests` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `managerId` VARCHAR(191) NULL,
    `status` ENUM('draft', 'terkirim', 'ditolak', 'diterima') NOT NULL DEFAULT 'draft',
    `startDate` DATETIME(3) NOT NULL,
    `endDate` DATETIME(3) NOT NULL,
    `reason` TEXT NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `LeaveRequests` ADD CONSTRAINT `LeaveRequests_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `Users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LeaveRequests` ADD CONSTRAINT `LeaveRequests_managerId_fkey` FOREIGN KEY (`managerId`) REFERENCES `Users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
