ALTER TABLE `roles` 
ADD COLUMN `permissions` VARCHAR(1000) NOT NULL AFTER `rolesAccess`;