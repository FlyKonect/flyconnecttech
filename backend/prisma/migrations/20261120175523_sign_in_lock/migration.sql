-- AlterTable
ALTER TABLE `users` ADD COLUMN `failedSignIns` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `failedSignInsSince` DATETIME(3) NULL,
    ADD COLUMN `lockedUntil` DATETIME(3) NULL;

-- CreateTable
CREATE TABLE `rate_limits` (
    `id` CHAR(36) NOT NULL,
    `key` VARCHAR(191) NOT NULL,
    `count` INTEGER NOT NULL,
    `lastRequest` BIGINT NOT NULL,

    UNIQUE INDEX `rate_limits_key_key`(`key`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
