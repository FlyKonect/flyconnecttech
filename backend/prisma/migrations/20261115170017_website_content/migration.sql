-- CreateTable
CREATE TABLE `testimonials` (
    `id` CHAR(36) NOT NULL,
    `quote` VARCHAR(500) NOT NULL,
    `name` VARCHAR(120) NOT NULL,
    `role` VARCHAR(120) NULL,
    `company` VARCHAR(160) NULL,
    `showOnHome` BOOLEAN NOT NULL DEFAULT true,
    `showOnCaseStudy` BOOLEAN NOT NULL DEFAULT false,
    `createdById` CHAR(36) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `testimonials_showOnHome_createdAt_idx`(`showOnHome`, `createdAt`),
    INDEX `testimonials_showOnCaseStudy_createdAt_idx`(`showOnCaseStudy`, `createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `testimonials` ADD CONSTRAINT `testimonials_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
