-- CreateTable
CREATE TABLE `notifications` (
    `id` VARCHAR(191) NOT NULL,
    `type` ENUM('TICKET_CREATED', 'TICKET_UPDATED', 'TICKET_ASSIGNED', 'TICKET_RESOLVED', 'TICKET_CLOSED', 'SYSTEM_INFO', 'SYSTEM_WARNING', 'SLA_BREACH') NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `message` TEXT NOT NULL,
    `read` BOOLEAN NOT NULL DEFAULT false,
    `readAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `userId` VARCHAR(191) NOT NULL,
    `ticketId` VARCHAR(191) NULL,

    INDEX `notifications_userId_read_idx`(`userId`, `read`),
    INDEX `notifications_userId_createdAt_idx`(`userId`, `createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tickets` (
    `id` VARCHAR(191) NOT NULL,
    `ticketNumber` VARCHAR(191) NOT NULL,
    `subject` VARCHAR(500) NOT NULL,
    `description` TEXT NOT NULL,
    `category` VARCHAR(100) NOT NULL,
    `status` ENUM('OPEN', 'ASSIGNED', 'IN_PROGRESS', 'WAITING_FOR_USER', 'RESOLVED', 'CLOSED') NOT NULL DEFAULT 'OPEN',
    `priority` ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL') NOT NULL DEFAULT 'MEDIUM',
    `impact` ENUM('INDIVIDUAL', 'DEPARTMENT', 'MULTIPLE_DEPARTMENTS', 'ENTIRE_ORGANIZATION') NOT NULL DEFAULT 'INDIVIDUAL',
    `source` ENUM('WEB', 'WHATSAPP', 'EMAIL', 'PHONE') NOT NULL DEFAULT 'WEB',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `resolvedAt` DATETIME(3) NULL,
    `closedAt` DATETIME(3) NULL,
    `createdById` VARCHAR(191) NOT NULL,
    `assignedToId` VARCHAR(191) NULL,
    `organizationId` VARCHAR(191) NOT NULL,
    `contactId` VARCHAR(191) NULL,
    `assetId` VARCHAR(191) NULL,

    UNIQUE INDEX `tickets_ticketNumber_key`(`ticketNumber`),
    INDEX `tickets_createdById_idx`(`createdById`),
    INDEX `tickets_organizationId_idx`(`organizationId`),
    INDEX `tickets_status_idx`(`status`),
    INDEX `tickets_assetId_idx`(`assetId`),
    INDEX `tickets_contactId_idx`(`contactId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `organizations` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `slug` VARCHAR(100) NOT NULL,
    `domain` VARCHAR(255) NULL,
    `status` ENUM('ACTIVE', 'INACTIVE', 'SUSPENDED') NOT NULL DEFAULT 'ACTIVE',
    `logoUrl` VARCHAR(500) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `deletedAt` DATETIME(3) NULL,

    UNIQUE INDEX `organizations_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `users` (
    `id` VARCHAR(191) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `passwordHash` VARCHAR(255) NOT NULL,
    `firstName` VARCHAR(100) NOT NULL,
    `lastName` VARCHAR(100) NOT NULL,
    `role` ENUM('SUPER_ADMIN', 'ADMIN', 'MANAGER', 'DEPT_MANAGER', 'TECHNICIAN', 'USER') NOT NULL DEFAULT 'USER',
    `status` ENUM('ACTIVE', 'INACTIVE', 'SUSPENDED', 'PENDING') NOT NULL DEFAULT 'PENDING',
    `avatarUrl` VARCHAR(500) NULL,
    `phone` VARCHAR(20) NULL,
    `lastLoginAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `deletedAt` DATETIME(3) NULL,
    `organizationId` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `users_email_key`(`email`),
    INDEX `users_email_idx`(`email`),
    INDEX `users_organizationId_idx`(`organizationId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ticket_comments` (
    `id` VARCHAR(191) NOT NULL,
    `content` TEXT NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `authorId` VARCHAR(191) NOT NULL,
    `ticketId` VARCHAR(191) NOT NULL,

    INDEX `ticket_comments_ticketId_createdAt_idx`(`ticketId`, `createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ticket_ratings` (
    `id` VARCHAR(191) NOT NULL,
    `rating` INTEGER NOT NULL,
    `comment` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `ticketId` VARCHAR(191) NOT NULL,
    `createdById` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `ticket_ratings_ticketId_key`(`ticketId`),
    INDEX `ticket_ratings_ticketId_idx`(`ticketId`),
    INDEX `ticket_ratings_rating_idx`(`rating`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ticket_history` (
    `id` VARCHAR(191) NOT NULL,
    `action` VARCHAR(100) NOT NULL,
    `oldValue` VARCHAR(500) NULL,
    `newValue` VARCHAR(500) NULL,
    `comment` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `ticketId` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,

    INDEX `ticket_history_ticketId_createdAt_idx`(`ticketId`, `createdAt`),
    INDEX `ticket_history_userId_idx`(`userId`),
    INDEX `ticket_history_action_idx`(`action`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `attachments` (
    `id` VARCHAR(191) NOT NULL,
    `filename` VARCHAR(255) NOT NULL,
    `originalName` VARCHAR(255) NOT NULL,
    `mimeType` VARCHAR(100) NOT NULL,
    `size` INTEGER NOT NULL,
    `url` VARCHAR(500) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `ticketId` VARCHAR(191) NOT NULL,
    `uploadedById` VARCHAR(191) NOT NULL,

    INDEX `attachments_ticketId_idx`(`ticketId`),
    INDEX `attachments_uploadedById_idx`(`uploadedById`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `assets` (
    `id` VARCHAR(191) NOT NULL,
    `serialNumber` VARCHAR(100) NOT NULL,
    `type` ENUM('DESKTOP', 'LAPTOP', 'PRINTER', 'SERVER', 'ROUTER', 'SWITCH', 'MONITOR', 'PHONE', 'TABLET', 'OTHER') NOT NULL,
    `brand` VARCHAR(100) NOT NULL,
    `model` VARCHAR(255) NOT NULL,
    `status` ENUM('ACTIVE', 'AVAILABLE', 'MAINTENANCE', 'RETIRED', 'DAMAGED') NOT NULL DEFAULT 'AVAILABLE',
    `location` VARCHAR(255) NOT NULL,
    `purchaseDate` DATETIME(3) NOT NULL,
    `warrantyExpiry` DATETIME(3) NULL,
    `notes` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `assignedToId` VARCHAR(191) NULL,
    `organizationId` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `assets_serialNumber_key`(`serialNumber`),
    INDEX `assets_serialNumber_idx`(`serialNumber`),
    INDEX `assets_organizationId_idx`(`organizationId`),
    INDEX `assets_assignedToId_idx`(`assignedToId`),
    INDEX `assets_status_idx`(`status`),
    INDEX `assets_type_idx`(`type`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `asset_history` (
    `id` VARCHAR(191) NOT NULL,
    `action` VARCHAR(50) NOT NULL,
    `oldValue` VARCHAR(255) NULL,
    `newValue` VARCHAR(255) NULL,
    `notes` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `assetId` VARCHAR(191) NOT NULL,
    `performedById` VARCHAR(191) NOT NULL,

    INDEX `asset_history_assetId_createdAt_idx`(`assetId`, `createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `kb_categories` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `slug` VARCHAR(255) NOT NULL,
    `description` TEXT NULL,
    `icon` VARCHAR(50) NULL,
    `displayOrder` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `organizationId` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `kb_categories_slug_key`(`slug`),
    INDEX `kb_categories_organizationId_idx`(`organizationId`),
    INDEX `kb_categories_slug_idx`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `kb_articles` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(500) NOT NULL,
    `slug` VARCHAR(500) NOT NULL,
    `content` TEXT NOT NULL,
    `excerpt` TEXT NULL,
    `status` ENUM('DRAFT', 'PENDING_REVIEW', 'PUBLISHED', 'REJECTED', 'ARCHIVED') NOT NULL DEFAULT 'DRAFT',
    `views` INTEGER NOT NULL DEFAULT 0,
    `helpful` INTEGER NOT NULL DEFAULT 0,
    `notHelpful` INTEGER NOT NULL DEFAULT 0,
    `tags` VARCHAR(500) NULL,
    `publishedAt` DATETIME(3) NULL,
    `rejectedReason` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `authorId` VARCHAR(191) NOT NULL,
    `reviewedById` VARCHAR(191) NULL,
    `categoryId` VARCHAR(191) NOT NULL,
    `organizationId` VARCHAR(191) NOT NULL,

    INDEX `kb_articles_organizationId_idx`(`organizationId`),
    INDEX `kb_articles_categoryId_idx`(`categoryId`),
    INDEX `kb_articles_authorId_idx`(`authorId`),
    INDEX `kb_articles_status_idx`(`status`),
    INDEX `kb_articles_slug_idx`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `contacts` (
    `id` VARCHAR(191) NOT NULL,
    `phoneNumber` VARCHAR(20) NOT NULL,
    `name` VARCHAR(255) NULL,
    `email` VARCHAR(255) NULL,
    `lastMessageAt` DATETIME(3) NULL,
    `isBlocked` BOOLEAN NOT NULL DEFAULT false,
    `notes` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `organizationId` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `contacts_phoneNumber_key`(`phoneNumber`),
    INDEX `contacts_phoneNumber_idx`(`phoneNumber`),
    INDEX `contacts_organizationId_idx`(`organizationId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `notifications` ADD CONSTRAINT `notifications_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `notifications` ADD CONSTRAINT `notifications_ticketId_fkey` FOREIGN KEY (`ticketId`) REFERENCES `tickets`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tickets` ADD CONSTRAINT `tickets_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tickets` ADD CONSTRAINT `tickets_assignedToId_fkey` FOREIGN KEY (`assignedToId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tickets` ADD CONSTRAINT `tickets_organizationId_fkey` FOREIGN KEY (`organizationId`) REFERENCES `organizations`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tickets` ADD CONSTRAINT `tickets_contactId_fkey` FOREIGN KEY (`contactId`) REFERENCES `contacts`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tickets` ADD CONSTRAINT `tickets_assetId_fkey` FOREIGN KEY (`assetId`) REFERENCES `assets`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `users` ADD CONSTRAINT `users_organizationId_fkey` FOREIGN KEY (`organizationId`) REFERENCES `organizations`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ticket_comments` ADD CONSTRAINT `ticket_comments_authorId_fkey` FOREIGN KEY (`authorId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ticket_comments` ADD CONSTRAINT `ticket_comments_ticketId_fkey` FOREIGN KEY (`ticketId`) REFERENCES `tickets`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ticket_ratings` ADD CONSTRAINT `ticket_ratings_ticketId_fkey` FOREIGN KEY (`ticketId`) REFERENCES `tickets`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ticket_ratings` ADD CONSTRAINT `ticket_ratings_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ticket_history` ADD CONSTRAINT `ticket_history_ticketId_fkey` FOREIGN KEY (`ticketId`) REFERENCES `tickets`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ticket_history` ADD CONSTRAINT `ticket_history_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `attachments` ADD CONSTRAINT `attachments_ticketId_fkey` FOREIGN KEY (`ticketId`) REFERENCES `tickets`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `attachments` ADD CONSTRAINT `attachments_uploadedById_fkey` FOREIGN KEY (`uploadedById`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `assets` ADD CONSTRAINT `assets_assignedToId_fkey` FOREIGN KEY (`assignedToId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `assets` ADD CONSTRAINT `assets_organizationId_fkey` FOREIGN KEY (`organizationId`) REFERENCES `organizations`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `asset_history` ADD CONSTRAINT `asset_history_assetId_fkey` FOREIGN KEY (`assetId`) REFERENCES `assets`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `asset_history` ADD CONSTRAINT `asset_history_performedById_fkey` FOREIGN KEY (`performedById`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `kb_categories` ADD CONSTRAINT `kb_categories_organizationId_fkey` FOREIGN KEY (`organizationId`) REFERENCES `organizations`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `kb_articles` ADD CONSTRAINT `kb_articles_authorId_fkey` FOREIGN KEY (`authorId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `kb_articles` ADD CONSTRAINT `kb_articles_reviewedById_fkey` FOREIGN KEY (`reviewedById`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `kb_articles` ADD CONSTRAINT `kb_articles_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `kb_categories`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `kb_articles` ADD CONSTRAINT `kb_articles_organizationId_fkey` FOREIGN KEY (`organizationId`) REFERENCES `organizations`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `contacts` ADD CONSTRAINT `contacts_organizationId_fkey` FOREIGN KEY (`organizationId`) REFERENCES `organizations`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
