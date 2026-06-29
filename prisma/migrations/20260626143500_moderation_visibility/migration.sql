ALTER TABLE `Topic`
  ADD COLUMN `hiddenReason` VARCHAR(191) NULL;

ALTER TABLE `Post`
  ADD COLUMN `hidden` BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN `hiddenReason` VARCHAR(191) NULL;

CREATE INDEX `Post_hidden_idx` ON `Post`(`hidden`);
