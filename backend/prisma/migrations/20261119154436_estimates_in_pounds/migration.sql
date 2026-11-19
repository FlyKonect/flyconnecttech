-- AlterTable
ALTER TABLE `estimates` MODIFY `currency` CHAR(3) NOT NULL DEFAULT 'GBP';

-- Estimates are in pounds: those saved before this change were entered
-- under the old "USD" label.
UPDATE `estimates` SET `currency` = 'GBP' WHERE `currency` = 'USD';
