-- CreateTable
CREATE TABLE `email_outbox` (
    `id` CHAR(36) NOT NULL,
    `to` VARCHAR(191) NOT NULL,
    `subject` VARCHAR(255) NOT NULL,
    `html` MEDIUMTEXT NOT NULL,
    `text` MEDIUMTEXT NOT NULL,
    `calendarMethod` VARCHAR(16) NULL,
    `calendarContent` TEXT NULL,
    `attempts` INTEGER NOT NULL DEFAULT 1,
    `lastError` VARCHAR(500) NOT NULL,
    `nextTryAt` DATETIME(3) NOT NULL,
    `sentAt` DATETIME(3) NULL,
    `gaveUpAt` DATETIME(3) NULL,
    `dismissedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `email_outbox_sentAt_gaveUpAt_nextTryAt_idx`(`sentAt`, `gaveUpAt`, `nextTryAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
