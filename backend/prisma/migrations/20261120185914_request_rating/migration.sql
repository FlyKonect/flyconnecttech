-- AlterTable
ALTER TABLE `support_requests` ADD COLUMN `ratedAt` DATETIME(3) NULL,
    ADD COLUMN `rating` INTEGER NULL,
    ADD COLUMN `ratingComment` VARCHAR(500) NULL;
