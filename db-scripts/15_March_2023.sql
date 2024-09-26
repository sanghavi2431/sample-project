-- New Table for storing voucher uses
CREATE TABLE `voucher_links` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `mobile` varchar(45) DEFAULT NULL,
  `dynamic_link` text DEFAULT NULL,
  `voucher_id` int(11) DEFAULT NULL,
  `short_code` varchar(45) DEFAULT NULL,
  `user_id` int(11) DEFAULT 0,
  `status` tinyint(1) DEFAULT 0,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=latin1 ;

-- Dynamic links & PO Link added in VOucher codes
ALTER TABLE `voucher_codes` 
ADD  `utr` varchar(100) DEFAULT NULL,
ADD  `po_url` varchar(200) DEFAULT NULL,
ADD  `payment_mode` tinyint(1) DEFAULT NULL,
ADD  `is_email` tinyint(1) DEFAULT 0,
ADD  `downloadLink` varchar(255) DEFAULT NULL;

-- Insurance availability added in subscriptions
ALTER TABLE subscriptions
ADD `is_insurance_available` tinyint(1);

-- Aadhaar & pan link added
ALTER TABLE users
ADD `aadhar_url` varchar(255) DEFAULT NULL,
ADD `pan_url` varchar(255) DEFAULT NULL,
ADD `state` varchar(50) DEFAULT NULL;



