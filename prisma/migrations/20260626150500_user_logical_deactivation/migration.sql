ALTER TABLE `User`
  ADD COLUMN `active` BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN `deactivatedAt` DATETIME(3) NULL,
  ADD COLUMN `deactivationReason` VARCHAR(191) NULL;

CREATE INDEX `User_active_idx` ON `User`(`active`);
