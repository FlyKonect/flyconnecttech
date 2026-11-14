-- CreateTable
CREATE TABLE `users` (
    `id` CHAR(36) NOT NULL,
    `name` VARCHAR(120) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `emailVerified` BOOLEAN NOT NULL DEFAULT false,
    `image` TEXT NULL,
    `twoFactorEnabled` BOOLEAN NOT NULL DEFAULT false,
    `role` ENUM('SUPER_ADMIN', 'ADMIN', 'MANAGER', 'DEVELOPER', 'CUSTOMER') NOT NULL,
    `status` ENUM('INVITED', 'ACTIVE', 'DISABLED') NOT NULL DEFAULT 'INVITED',
    `phone` VARCHAR(40) NULL,
    `jobTitle` VARCHAR(120) NULL,
    `country` VARCHAR(80) NULL,
    `timezone` VARCHAR(64) NOT NULL DEFAULT 'Europe/London',
    `customerId` CHAR(36) NULL,
    `emailPrefs` JSON NULL,
    `lastActiveAt` DATETIME(3) NULL,
    `invitedAt` DATETIME(3) NULL,
    `activatedAt` DATETIME(3) NULL,
    `createdById` CHAR(36) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `users_email_key`(`email`),
    UNIQUE INDEX `users_customerId_key`(`customerId`),
    INDEX `users_role_status_idx`(`role`, `status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sessions` (
    `id` CHAR(36) NOT NULL,
    `expiresAt` DATETIME(3) NOT NULL,
    `token` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `ipAddress` VARCHAR(64) NULL,
    `userAgent` TEXT NULL,
    `userId` CHAR(36) NOT NULL,

    UNIQUE INDEX `sessions_token_key`(`token`),
    INDEX `sessions_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `accounts` (
    `id` CHAR(36) NOT NULL,
    `accountId` TEXT NOT NULL,
    `providerId` VARCHAR(64) NOT NULL,
    `userId` CHAR(36) NOT NULL,
    `accessToken` TEXT NULL,
    `refreshToken` TEXT NULL,
    `idToken` TEXT NULL,
    `accessTokenExpiresAt` DATETIME(3) NULL,
    `refreshTokenExpiresAt` DATETIME(3) NULL,
    `scope` TEXT NULL,
    `password` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `accounts_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `verifications` (
    `id` CHAR(36) NOT NULL,
    `identifier` VARCHAR(191) NOT NULL,
    `value` TEXT NOT NULL,
    `expiresAt` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `verifications_identifier_idx`(`identifier`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `two_factors` (
    `id` CHAR(36) NOT NULL,
    `secret` VARCHAR(191) NOT NULL,
    `backupCodes` TEXT NOT NULL,
    `userId` CHAR(36) NOT NULL,
    `verified` BOOLEAN NULL DEFAULT true,
    `failedVerificationCount` INTEGER NULL DEFAULT 0,
    `lockedUntil` DATETIME(3) NULL,

    INDEX `two_factors_secret_idx`(`secret`),
    INDEX `two_factors_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `invitations` (
    `id` CHAR(36) NOT NULL,
    `userId` CHAR(36) NOT NULL,
    `tokenHash` CHAR(64) NOT NULL,
    `expiresAt` DATETIME(3) NOT NULL,
    `usedAt` DATETIME(3) NULL,
    `revokedAt` DATETIME(3) NULL,
    `sentById` CHAR(36) NULL,
    `sentAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `invitations_tokenHash_key`(`tokenHash`),
    INDEX `invitations_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `customers` (
    `id` CHAR(36) NOT NULL,
    `company` VARCHAR(160) NOT NULL,
    `country` VARCHAR(80) NULL,
    `createdById` CHAR(36) NULL,
    `sourceLeadType` ENUM('DEMO', 'QUOTE', 'MESSAGE') NULL,
    `sourceLeadId` CHAR(36) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `projects` (
    `id` CHAR(36) NOT NULL,
    `code` VARCHAR(16) NOT NULL,
    `name` VARCHAR(160) NOT NULL,
    `type` ENUM('WEBSITE', 'WEB_APPLICATION', 'TRAVEL_BOOKING_PLATFORM', 'AGENT_PORTAL', 'API_INTEGRATION', 'CUSTOM_SOFTWARE', 'UI_UX_DESIGN', 'MAINTENANCE_PLAN') NOT NULL,
    `status` ENUM('PLANNING', 'IN_DESIGN', 'IN_DEVELOPMENT', 'LIVE', 'COMPLETED') NOT NULL DEFAULT 'PLANNING',
    `customerId` CHAR(36) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `projects_code_key`(`code`),
    INDEX `projects_customerId_idx`(`customerId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `support_requests` (
    `id` CHAR(36) NOT NULL,
    `code` VARCHAR(20) NOT NULL,
    `title` VARCHAR(200) NOT NULL,
    `description` TEXT NOT NULL,
    `url` VARCHAR(500) NULL,
    `type` ENUM('TECHNICAL_ISSUE', 'BUG_REPORT', 'FEATURE_REQUEST', 'INTEGRATION_PROBLEM', 'DESIGN_MODIFICATION', 'GENERAL_INQUIRY', 'MAINTENANCE_REQUEST') NOT NULL,
    `priority` ENUM('LOW', 'MEDIUM', 'HIGH', 'URGENT') NOT NULL,
    `status` ENUM('SUBMITTED', 'UNDER_REVIEW', 'IN_PROGRESS', 'WAITING_FOR_CUSTOMER', 'RESOLVED', 'CLOSED') NOT NULL DEFAULT 'SUBMITTED',
    `projectId` CHAR(36) NOT NULL,
    `customerId` CHAR(36) NOT NULL,
    `assigneeId` CHAR(36) NULL,
    `dueAt` DATETIME(3) NULL,
    `slaPausedAt` DATETIME(3) NULL,
    `firstResponseAt` DATETIME(3) NULL,
    `resolvedAt` DATETIME(3) NULL,
    `closedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `support_requests_code_key`(`code`),
    INDEX `support_requests_status_idx`(`status`),
    INDEX `support_requests_assigneeId_idx`(`assigneeId`),
    INDEX `support_requests_customerId_idx`(`customerId`),
    INDEX `support_requests_projectId_idx`(`projectId`),
    INDEX `support_requests_priority_idx`(`priority`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `request_messages` (
    `id` CHAR(36) NOT NULL,
    `requestId` CHAR(36) NOT NULL,
    `authorId` CHAR(36) NULL,
    `kind` ENUM('CUSTOMER_REPLY', 'STAFF_REPLY', 'INTERNAL_NOTE', 'SYSTEM') NOT NULL,
    `body` TEXT NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `request_messages_requestId_createdAt_idx`(`requestId`, `createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `request_status_changes` (
    `id` CHAR(36) NOT NULL,
    `requestId` CHAR(36) NOT NULL,
    `from` ENUM('SUBMITTED', 'UNDER_REVIEW', 'IN_PROGRESS', 'WAITING_FOR_CUSTOMER', 'RESOLVED', 'CLOSED') NULL,
    `to` ENUM('SUBMITTED', 'UNDER_REVIEW', 'IN_PROGRESS', 'WAITING_FOR_CUSTOMER', 'RESOLVED', 'CLOSED') NOT NULL,
    `byId` CHAR(36) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `request_status_changes_requestId_createdAt_idx`(`requestId`, `createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `attachments` (
    `id` CHAR(36) NOT NULL,
    `requestId` CHAR(36) NOT NULL,
    `messageId` CHAR(36) NULL,
    `fileName` VARCHAR(255) NOT NULL,
    `contentType` VARCHAR(127) NOT NULL,
    `size` INTEGER NOT NULL,
    `storageKey` VARCHAR(255) NOT NULL,
    `uploadedById` CHAR(36) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `attachments_storageKey_key`(`storageKey`),
    INDEX `attachments_requestId_idx`(`requestId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `demo_requests` (
    `id` CHAR(36) NOT NULL,
    `code` VARCHAR(20) NOT NULL,
    `status` ENUM('NEW', 'SCHEDULED', 'COMPLETED', 'CANCELLED') NOT NULL DEFAULT 'NEW',
    `topic` ENUM('TRAVEL_BOOKING_PLATFORM', 'AGENT_ADMIN_DASHBOARDS', 'CUSTOM_SOFTWARE_WEBSITES', 'API_INTEGRATIONS') NOT NULL,
    `preferredStart` DATETIME(3) NOT NULL,
    `scheduledStart` DATETIME(3) NULL,
    `scheduledSlot` DATETIME(3) NULL,
    `hostId` CHAR(36) NULL,
    `videoLink` VARCHAR(500) NULL,
    `name` VARCHAR(120) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `company` VARCHAR(160) NOT NULL,
    `phone` VARCHAR(40) NULL,
    `notes` TEXT NULL,
    `sourcePage` VARCHAR(120) NOT NULL,
    `ownerId` CHAR(36) NULL,
    `cancelReason` TEXT NULL,
    `customerId` CHAR(36) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `demo_requests_code_key`(`code`),
    UNIQUE INDEX `demo_requests_scheduledSlot_key`(`scheduledSlot`),
    INDEX `demo_requests_status_createdAt_idx`(`status`, `createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `quote_requests` (
    `id` CHAR(36) NOT NULL,
    `code` VARCHAR(20) NOT NULL,
    `status` ENUM('NEW', 'REVIEWING', 'ESTIMATE_SENT', 'WON', 'LOST') NOT NULL DEFAULT 'NEW',
    `projectType` ENUM('TRAVEL_BOOKING_PLATFORM', 'AMADEUS_SABRE_INTEGRATION', 'NEW_WEBSITE', 'WEBSITE_REDESIGN', 'CUSTOM_SOFTWARE', 'UI_UX_DESIGN', 'API_INTEGRATION', 'OTHER') NOT NULL,
    `budget` ENUM('UNDER_5K', 'FROM_5K_TO_15K', 'FROM_15K_TO_50K', 'OVER_50K', 'NOT_SURE') NOT NULL,
    `timeline` ENUM('ASAP', 'WITHIN_1_3_MONTHS', 'WITHIN_3_6_MONTHS', 'NOT_SURE') NULL,
    `name` VARCHAR(120) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `company` VARCHAR(160) NULL,
    `phone` VARCHAR(40) NULL,
    `requirements` TEXT NOT NULL,
    `sourcePage` VARCHAR(120) NOT NULL,
    `ownerId` CHAR(36) NULL,
    `lostReason` TEXT NULL,
    `customerId` CHAR(36) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `quote_requests_code_key`(`code`),
    INDEX `quote_requests_status_createdAt_idx`(`status`, `createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `estimates` (
    `id` CHAR(36) NOT NULL,
    `quoteRequestId` CHAR(36) NOT NULL,
    `amountCents` INTEGER NOT NULL,
    `currency` CHAR(3) NOT NULL DEFAULT 'USD',
    `deliveryTime` VARCHAR(120) NOT NULL,
    `validUntil` DATE NOT NULL,
    `summary` TEXT NOT NULL,
    `sentById` CHAR(36) NOT NULL,
    `sentAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `estimates_quoteRequestId_sentAt_idx`(`quoteRequestId`, `sentAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `contact_messages` (
    `id` CHAR(36) NOT NULL,
    `code` VARCHAR(20) NOT NULL,
    `status` ENUM('NEW', 'REPLIED', 'CLOSED') NOT NULL DEFAULT 'NEW',
    `topic` ENUM('GENERAL_QUESTION', 'PARTNERSHIP', 'EXISTING_PROJECT', 'SOMETHING_ELSE') NOT NULL,
    `name` VARCHAR(120) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `message` TEXT NOT NULL,
    `sourcePage` VARCHAR(120) NOT NULL,
    `ownerId` CHAR(36) NULL,
    `customerId` CHAR(36) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `contact_messages_code_key`(`code`),
    INDEX `contact_messages_status_createdAt_idx`(`status`, `createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `lead_activities` (
    `id` CHAR(36) NOT NULL,
    `leadType` ENUM('DEMO', 'QUOTE', 'MESSAGE') NOT NULL,
    `leadId` CHAR(36) NOT NULL,
    `kind` ENUM('SYSTEM', 'EMAIL', 'NOTE') NOT NULL,
    `authorId` CHAR(36) NULL,
    `body` TEXT NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `lead_activities_leadType_leadId_createdAt_idx`(`leadType`, `leadId`, `createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `notifications` (
    `id` CHAR(36) NOT NULL,
    `userId` CHAR(36) NOT NULL,
    `kind` ENUM('reply', 'info', 'status', 'ok', 'closed', 'urgent', 'new', 'high', 'review', 'invite', 'lead') NOT NULL,
    `text` VARCHAR(500) NOT NULL,
    `href` VARCHAR(500) NOT NULL,
    `readAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `notifications_userId_readAt_idx`(`userId`, `readAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `settings` (
    `key` VARCHAR(64) NOT NULL,
    `value` JSON NOT NULL,
    `updatedById` CHAR(36) NULL,
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`key`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `audit_logs` (
    `id` CHAR(36) NOT NULL,
    `actorId` CHAR(36) NULL,
    `action` VARCHAR(64) NOT NULL,
    `entityType` VARCHAR(64) NOT NULL,
    `entityId` VARCHAR(64) NOT NULL,
    `data` JSON NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `audit_logs_entityType_entityId_idx`(`entityType`, `entityId`),
    INDEX `audit_logs_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `counters` (
    `name` VARCHAR(32) NOT NULL,
    `value` INTEGER NOT NULL,

    PRIMARY KEY (`name`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `users` ADD CONSTRAINT `users_customerId_fkey` FOREIGN KEY (`customerId`) REFERENCES `customers`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `users` ADD CONSTRAINT `users_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sessions` ADD CONSTRAINT `sessions_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `accounts` ADD CONSTRAINT `accounts_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `two_factors` ADD CONSTRAINT `two_factors_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `invitations` ADD CONSTRAINT `invitations_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `invitations` ADD CONSTRAINT `invitations_sentById_fkey` FOREIGN KEY (`sentById`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `customers` ADD CONSTRAINT `customers_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `projects` ADD CONSTRAINT `projects_customerId_fkey` FOREIGN KEY (`customerId`) REFERENCES `customers`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `support_requests` ADD CONSTRAINT `support_requests_projectId_fkey` FOREIGN KEY (`projectId`) REFERENCES `projects`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `support_requests` ADD CONSTRAINT `support_requests_customerId_fkey` FOREIGN KEY (`customerId`) REFERENCES `customers`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `support_requests` ADD CONSTRAINT `support_requests_assigneeId_fkey` FOREIGN KEY (`assigneeId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `request_messages` ADD CONSTRAINT `request_messages_requestId_fkey` FOREIGN KEY (`requestId`) REFERENCES `support_requests`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `request_messages` ADD CONSTRAINT `request_messages_authorId_fkey` FOREIGN KEY (`authorId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `request_status_changes` ADD CONSTRAINT `request_status_changes_requestId_fkey` FOREIGN KEY (`requestId`) REFERENCES `support_requests`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `request_status_changes` ADD CONSTRAINT `request_status_changes_byId_fkey` FOREIGN KEY (`byId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `attachments` ADD CONSTRAINT `attachments_requestId_fkey` FOREIGN KEY (`requestId`) REFERENCES `support_requests`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `attachments` ADD CONSTRAINT `attachments_messageId_fkey` FOREIGN KEY (`messageId`) REFERENCES `request_messages`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `attachments` ADD CONSTRAINT `attachments_uploadedById_fkey` FOREIGN KEY (`uploadedById`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `demo_requests` ADD CONSTRAINT `demo_requests_hostId_fkey` FOREIGN KEY (`hostId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `demo_requests` ADD CONSTRAINT `demo_requests_ownerId_fkey` FOREIGN KEY (`ownerId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `demo_requests` ADD CONSTRAINT `demo_requests_customerId_fkey` FOREIGN KEY (`customerId`) REFERENCES `customers`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `quote_requests` ADD CONSTRAINT `quote_requests_ownerId_fkey` FOREIGN KEY (`ownerId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `quote_requests` ADD CONSTRAINT `quote_requests_customerId_fkey` FOREIGN KEY (`customerId`) REFERENCES `customers`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `estimates` ADD CONSTRAINT `estimates_quoteRequestId_fkey` FOREIGN KEY (`quoteRequestId`) REFERENCES `quote_requests`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `estimates` ADD CONSTRAINT `estimates_sentById_fkey` FOREIGN KEY (`sentById`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `contact_messages` ADD CONSTRAINT `contact_messages_ownerId_fkey` FOREIGN KEY (`ownerId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `contact_messages` ADD CONSTRAINT `contact_messages_customerId_fkey` FOREIGN KEY (`customerId`) REFERENCES `customers`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `lead_activities` ADD CONSTRAINT `lead_activities_authorId_fkey` FOREIGN KEY (`authorId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `notifications` ADD CONSTRAINT `notifications_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `settings` ADD CONSTRAINT `settings_updatedById_fkey` FOREIGN KEY (`updatedById`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `audit_logs` ADD CONSTRAINT `audit_logs_actorId_fkey` FOREIGN KEY (`actorId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
