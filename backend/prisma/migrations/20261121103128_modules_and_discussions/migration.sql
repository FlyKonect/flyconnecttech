-- Modules (with their timeline), the project team and discussions.
-- Existing items move into one "General" module per project (below).

-- AlterTable
ALTER TABLE `notifications` MODIFY `kind` ENUM('reply', 'info', 'status', 'ok', 'closed', 'urgent', 'new', 'high', 'review', 'invite', 'lead', 'project', 'module', 'discussion') NOT NULL;

-- AlterTable: empty at first, filled once the modules exist.
ALTER TABLE `project_items` ADD COLUMN `moduleId` CHAR(36) NULL;

-- CreateTable
CREATE TABLE `project_modules` (
    `id` CHAR(36) NOT NULL,
    `projectId` CHAR(36) NOT NULL,
    `name` VARCHAR(160) NOT NULL,
    `description` VARCHAR(1000) NULL,
    `stage` ENUM('NOT_STARTED', 'DESIGN', 'DEVELOPMENT', 'TESTING', 'CLIENT_REVIEW', 'CHANGES_REQUESTED', 'RETEST', 'DONE') NOT NULL DEFAULT 'NOT_STARTED',
    `round` INTEGER NOT NULL DEFAULT 1,
    `position` INTEGER NOT NULL,
    `startDate` DATE NULL,
    `targetDate` DATE NULL,
    `doneAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `project_modules_projectId_position_idx`(`projectId`, `position`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `module_stage_changes` (
    `id` CHAR(36) NOT NULL,
    `moduleId` CHAR(36) NOT NULL,
    `from` ENUM('NOT_STARTED', 'DESIGN', 'DEVELOPMENT', 'TESTING', 'CLIENT_REVIEW', 'CHANGES_REQUESTED', 'RETEST', 'DONE') NULL,
    `to` ENUM('NOT_STARTED', 'DESIGN', 'DEVELOPMENT', 'TESTING', 'CLIENT_REVIEW', 'CHANGES_REQUESTED', 'RETEST', 'DONE') NOT NULL,
    `round` INTEGER NOT NULL,
    `note` VARCHAR(500) NULL,
    `byId` CHAR(36) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `module_stage_changes_moduleId_createdAt_idx`(`moduleId`, `createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `project_members` (
    `projectId` CHAR(36) NOT NULL,
    `userId` CHAR(36) NOT NULL,
    `addedById` CHAR(36) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `project_members_userId_idx`(`userId`),
    PRIMARY KEY (`projectId`, `userId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `project_topics` (
    `id` CHAR(36) NOT NULL,
    `projectId` CHAR(36) NOT NULL,
    `number` INTEGER NOT NULL,
    `kind` ENUM('CUSTOMER', 'INTERNAL') NOT NULL,
    `moduleId` CHAR(36) NULL,
    `title` VARCHAR(200) NOT NULL,
    `status` ENUM('OPEN', 'CLOSED') NOT NULL DEFAULT 'OPEN',
    `authorId` CHAR(36) NOT NULL,
    `answerPostId` CHAR(36) NULL,
    `closedAt` DATETIME(3) NULL,
    `closedById` CHAR(36) NULL,
    `closeNote` VARCHAR(500) NULL,
    `lastPostAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `project_topics_answerPostId_key`(`answerPostId`),
    INDEX `project_topics_projectId_kind_status_lastPostAt_idx`(`projectId`, `kind`, `status`, `lastPostAt`),
    UNIQUE INDEX `project_topics_projectId_number_key`(`projectId`, `number`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `topic_posts` (
    `id` CHAR(36) NOT NULL,
    `topicId` CHAR(36) NOT NULL,
    `authorId` CHAR(36) NULL,
    `kind` ENUM('MESSAGE', 'PROPOSAL', 'SYSTEM') NOT NULL DEFAULT 'MESSAGE',
    `body` TEXT NOT NULL,
    `proposalState` ENUM('PENDING', 'APPROVED', 'CHANGES_REQUESTED') NULL,
    `decidedById` CHAR(36) NULL,
    `decidedAt` DATETIME(3) NULL,
    `decisionNote` VARCHAR(500) NULL,
    `editedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `topic_posts_topicId_createdAt_idx`(`topicId`, `createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `topic_asks` (
    `topicId` CHAR(36) NOT NULL,
    `userId` CHAR(36) NOT NULL,
    `askedById` CHAR(36) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `answeredAt` DATETIME(3) NULL,

    INDEX `topic_asks_userId_answeredAt_idx`(`userId`, `answeredAt`),
    PRIMARY KEY (`topicId`, `userId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `topic_files` (
    `id` CHAR(36) NOT NULL,
    `topicId` CHAR(36) NOT NULL,
    `postId` CHAR(36) NOT NULL,
    `fileName` VARCHAR(255) NOT NULL,
    `contentType` VARCHAR(127) NOT NULL,
    `size` INTEGER NOT NULL,
    `storageKey` VARCHAR(255) NOT NULL,
    `uploadedById` CHAR(36) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `topic_files_storageKey_key`(`storageKey`),
    INDEX `topic_files_topicId_idx`(`topicId`),
    INDEX `topic_files_postId_idx`(`postId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Existing items go into one "General" module per project. Its stage:
-- Done when every item is done, Development when any has started,
-- otherwise Not started. Each gets a first line on its timeline.
INSERT INTO `project_modules` (`id`, `projectId`, `name`, `stage`, `round`, `position`, `doneAt`, `createdAt`, `updatedAt`)
SELECT UUID(), i.`projectId`, 'General',
  CASE
    WHEN SUM(i.`status` = 'DONE') = COUNT(*) THEN 'DONE'
    WHEN SUM(i.`status` <> 'TODO') > 0 THEN 'DEVELOPMENT'
    ELSE 'NOT_STARTED'
  END,
  1, 0,
  CASE WHEN SUM(i.`status` = 'DONE') = COUNT(*) THEN CURRENT_TIMESTAMP(3) ELSE NULL END,
  CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)
FROM `project_items` i
GROUP BY i.`projectId`;

UPDATE `project_items` i
JOIN `project_modules` m ON m.`projectId` = i.`projectId` AND m.`name` = 'General'
SET i.`moduleId` = m.`id`;

INSERT INTO `module_stage_changes` (`id`, `moduleId`, `from`, `to`, `round`, `createdAt`)
SELECT UUID(), m.`id`, NULL, m.`stage`, 1, CURRENT_TIMESTAMP(3)
FROM `project_modules` m;

-- Every item has its module now.
ALTER TABLE `project_items` MODIFY `moduleId` CHAR(36) NOT NULL;

-- CreateIndex
CREATE INDEX `project_items_moduleId_position_idx` ON `project_items`(`moduleId`, `position`);

-- AddForeignKey
ALTER TABLE `project_modules` ADD CONSTRAINT `project_modules_projectId_fkey` FOREIGN KEY (`projectId`) REFERENCES `projects`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `module_stage_changes` ADD CONSTRAINT `module_stage_changes_moduleId_fkey` FOREIGN KEY (`moduleId`) REFERENCES `project_modules`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `module_stage_changes` ADD CONSTRAINT `module_stage_changes_byId_fkey` FOREIGN KEY (`byId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `project_members` ADD CONSTRAINT `project_members_projectId_fkey` FOREIGN KEY (`projectId`) REFERENCES `projects`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `project_members` ADD CONSTRAINT `project_members_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `project_members` ADD CONSTRAINT `project_members_addedById_fkey` FOREIGN KEY (`addedById`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `project_topics` ADD CONSTRAINT `project_topics_projectId_fkey` FOREIGN KEY (`projectId`) REFERENCES `projects`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `project_topics` ADD CONSTRAINT `project_topics_moduleId_fkey` FOREIGN KEY (`moduleId`) REFERENCES `project_modules`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `project_topics` ADD CONSTRAINT `project_topics_authorId_fkey` FOREIGN KEY (`authorId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `project_topics` ADD CONSTRAINT `project_topics_answerPostId_fkey` FOREIGN KEY (`answerPostId`) REFERENCES `topic_posts`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `project_topics` ADD CONSTRAINT `project_topics_closedById_fkey` FOREIGN KEY (`closedById`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `topic_posts` ADD CONSTRAINT `topic_posts_topicId_fkey` FOREIGN KEY (`topicId`) REFERENCES `project_topics`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `topic_posts` ADD CONSTRAINT `topic_posts_authorId_fkey` FOREIGN KEY (`authorId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `topic_posts` ADD CONSTRAINT `topic_posts_decidedById_fkey` FOREIGN KEY (`decidedById`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `topic_asks` ADD CONSTRAINT `topic_asks_topicId_fkey` FOREIGN KEY (`topicId`) REFERENCES `project_topics`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `topic_asks` ADD CONSTRAINT `topic_asks_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `topic_asks` ADD CONSTRAINT `topic_asks_askedById_fkey` FOREIGN KEY (`askedById`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `topic_files` ADD CONSTRAINT `topic_files_topicId_fkey` FOREIGN KEY (`topicId`) REFERENCES `project_topics`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `topic_files` ADD CONSTRAINT `topic_files_postId_fkey` FOREIGN KEY (`postId`) REFERENCES `topic_posts`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `topic_files` ADD CONSTRAINT `topic_files_uploadedById_fkey` FOREIGN KEY (`uploadedById`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `project_items` ADD CONSTRAINT `project_items_moduleId_fkey` FOREIGN KEY (`moduleId`) REFERENCES `project_modules`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
