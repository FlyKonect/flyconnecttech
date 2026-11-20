-- One email can now have a customer account and a team account, each with
-- its own password (docs/02). Every account gets its side (from its role)
-- and Better Auth's private sign-in key, made exactly as
-- src/accounts/login-key.ts makes it: "c." (customer) or "t." (team), the
-- SHA-256 of the lower-case email, then "@accounts.invalid".

-- AlterTable: the new columns, empty for now
ALTER TABLE `users` ADD COLUMN `loginEmail` VARCHAR(191) NULL,
    ADD COLUMN `side` ENUM('CUSTOMER', 'TEAM') NULL;

-- Fill them in for the accounts that already exist
UPDATE `users` SET `side` = IF(`role` = 'CUSTOMER', 'CUSTOMER', 'TEAM');
UPDATE `users` SET `loginEmail` = CONCAT(IF(`side` = 'CUSTOMER', 'c', 't'), '.', SHA2(LOWER(TRIM(`email`)), 256), '@accounts.invalid');

-- Now required
ALTER TABLE `users` MODIFY `loginEmail` VARCHAR(191) NOT NULL,
    MODIFY `side` ENUM('CUSTOMER', 'TEAM') NOT NULL;

-- DropIndex: the email is no longer unique on its own
DROP INDEX `users_email_key` ON `users`;

-- CreateIndex
CREATE UNIQUE INDEX `users_loginEmail_key` ON `users`(`loginEmail`);

-- CreateIndex: unique within a side
CREATE UNIQUE INDEX `users_email_side_key` ON `users`(`email`, `side`);
