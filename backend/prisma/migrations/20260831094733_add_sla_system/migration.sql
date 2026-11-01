-- AlterTable
ALTER TABLE `tickets` ADD COLUMN `firstResponseAt` DATETIME(3) NULL,
    ADD COLUMN `resolutionTime` INTEGER NULL,
    ADD COLUMN `slaBreached` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `slaDeadline` DATETIME(3) NULL;

-- CreateTable
CREATE TABLE `sla_configs` (
    `id` VARCHAR(191) NOT NULL,
    `priority` VARCHAR(191) NOT NULL,
    `responseTime` INTEGER NOT NULL,
    `resolveTime` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `sla_configs_priority_key`(`priority`),
    INDEX `sla_configs_priority_idx`(`priority`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `tickets_slaDeadline_idx` ON `tickets`(`slaDeadline`);

-- CreateIndex
CREATE INDEX `tickets_slaBreached_idx` ON `tickets`(`slaBreached`);
