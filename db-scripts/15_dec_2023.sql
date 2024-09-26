ALTER TABLE `woloo_staging`.`woloos` 
ADD COLUMN `mobile` VARCHAR(45) NULL AFTER `rating`;

ALTER TABLE `woloo_staging`.`woloos` 
ADD COLUMN `email` VARCHAR(45) NULL AFTER `mobile`;