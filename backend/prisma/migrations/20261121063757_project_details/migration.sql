-- AlterTable
ALTER TABLE `notifications` MODIFY `kind` ENUM('reply', 'info', 'status', 'ok', 'closed', 'urgent', 'new', 'high', 'review', 'invite', 'lead', 'project') NOT NULL;

-- AlterTable
ALTER TABLE `projects` ADD COLUMN `builtWith` VARCHAR(300) NULL,
    ADD COLUMN `deletedAt` DATETIME(3) NULL,
    ADD COLUMN `deletedById` CHAR(36) NULL,
    ADD COLUMN `description` TEXT NULL,
    ADD COLUMN `leadId` CHAR(36) NULL,
    ADD COLUMN `liveDate` DATE NULL,
    ADD COLUMN `liveUrl` VARCHAR(500) NULL,
    ADD COLUMN `startDate` DATE NULL,
    ADD COLUMN `supportUntil` DATE NULL,
    ADD COLUMN `targetDate` DATE NULL,
    ADD COLUMN `teamNotes` TEXT NULL,
    ADD COLUMN `testUrl` VARCHAR(500) NULL,
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

-- CreateTable
CREATE TABLE `project_items` (
    `id` CHAR(36) NOT NULL,
    `projectId` CHAR(36) NOT NULL,
    `title` VARCHAR(160) NOT NULL,
    `detail` VARCHAR(500) NULL,
    `status` ENUM('TODO', 'IN_PROGRESS', 'DONE') NOT NULL DEFAULT 'TODO',
    `position` INTEGER NOT NULL,
    `doneAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `project_items_projectId_position_idx`(`projectId`, `position`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `project_updates` (
    `id` CHAR(36) NOT NULL,
    `projectId` CHAR(36) NOT NULL,
    `body` TEXT NOT NULL,
    `authorId` CHAR(36) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `editedAt` DATETIME(3) NULL,

    INDEX `project_updates_projectId_createdAt_idx`(`projectId`, `createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `project_files` (
    `id` CHAR(36) NOT NULL,
    `projectId` CHAR(36) NOT NULL,
    `updateId` CHAR(36) NOT NULL,
    `fileName` VARCHAR(255) NOT NULL,
    `contentType` VARCHAR(127) NOT NULL,
    `size` INTEGER NOT NULL,
    `storageKey` VARCHAR(255) NOT NULL,
    `uploadedById` CHAR(36) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `project_files_storageKey_key`(`storageKey`),
    INDEX `project_files_projectId_idx`(`projectId`),
    INDEX `project_files_updateId_idx`(`updateId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `projects_deletedAt_status_idx` ON `projects`(`deletedAt`, `status`);

-- AddForeignKey
ALTER TABLE `projects` ADD CONSTRAINT `projects_leadId_fkey` FOREIGN KEY (`leadId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `projects` ADD CONSTRAINT `projects_deletedById_fkey` FOREIGN KEY (`deletedById`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `project_items` ADD CONSTRAINT `project_items_projectId_fkey` FOREIGN KEY (`projectId`) REFERENCES `projects`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `project_updates` ADD CONSTRAINT `project_updates_projectId_fkey` FOREIGN KEY (`projectId`) REFERENCES `projects`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `project_updates` ADD CONSTRAINT `project_updates_authorId_fkey` FOREIGN KEY (`authorId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `project_files` ADD CONSTRAINT `project_files_projectId_fkey` FOREIGN KEY (`projectId`) REFERENCES `projects`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `project_files` ADD CONSTRAINT `project_files_updateId_fkey` FOREIGN KEY (`updateId`) REFERENCES `project_updates`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `project_files` ADD CONSTRAINT `project_files_uploadedById_fkey` FOREIGN KEY (`uploadedById`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
