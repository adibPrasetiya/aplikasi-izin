-- CreateTable
CREATE TABLE `Users` (
    `id` VARCHAR(191) NOT NULL,
    `username` VARCHAR(100) NOT NULL,
    `email` VARCHAR(100) NOT NULL,
    `password` VARCHAR(100) NOT NULL,
    `passwordExpiredAt` DATETIME(3) NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `role` ENUM('staff', 'manajer', 'admin') NOT NULL DEFAULT 'staff',
    `flagActive` BOOLEAN NOT NULL DEFAULT false,
    `departementId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Users_username_key`(`username`),
    UNIQUE INDEX `Users_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Departements` (
    `departementId` VARCHAR(191) NOT NULL,
    `name` VARCHAR(150) NOT NULL,
    `email` VARCHAR(100) NOT NULL,

    UNIQUE INDEX `Departements_name_key`(`name`),
    UNIQUE INDEX `Departements_email_key`(`email`),
    PRIMARY KEY (`departementId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Users` ADD CONSTRAINT `Users_departementId_fkey` FOREIGN KEY (`departementId`) REFERENCES `Departements`(`departementId`) ON DELETE RESTRICT ON UPDATE CASCADE;
