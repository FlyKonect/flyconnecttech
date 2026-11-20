-- Deleting team users and customers (docs/01): the account's sign-in and
-- personal details are erased, its history stays under its name, and the
-- old email is kept so adding it again can offer to restore that history.

-- AlterTable
ALTER TABLE `customers` ADD COLUMN `deletedAt` DATETIME(3) NULL;
-- AlterTable
ALTER TABLE `users` ADD COLUMN `deletedAt` DATETIME(3) NULL,
    ADD COLUMN `deletedEmail` VARCHAR(191) NULL,
    MODIFY `status` ENUM('INVITED', 'ACTIVE', 'DISABLED', 'DELETED') NOT NULL DEFAULT 'INVITED';
-- CreateIndex
CREATE INDEX `users_deletedEmail_side_idx` ON `users`(`deletedEmail`, `side`);
