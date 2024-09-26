-- Subscription --

ALTER TABLE subscriptions
ADD insurance_desc LONGTEXT DEFAULT NULL,
ADD strike_out_price INT(11) DEFAULT NULL;

-- Voucher_Links --

ALTER TABLE voucher_links
DROP COLUMN mobile;

-- User Table --

ALTER TABLE users
ADD COLUMN `alternate_mob` VARCHAR(15) NULL DEFAULT NULL AFTER `state`;

