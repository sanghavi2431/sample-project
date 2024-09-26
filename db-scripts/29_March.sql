-- User Status Default --
ALTER TABLE woloo_prod.users 
CHANGE COLUMN status status INT(11) NULL DEFAULT 1 ;

-- User Voucher Code UpdateAt default --
ALTER TABLE woloo_prod.user_voucher_code 
CHANGE COLUMN created_at created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ,
CHANGE COLUMN updated_at updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP ;
