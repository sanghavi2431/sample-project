import LOGGER from "../config/LOGGER";
import BaseModel from "./BaseModel";

export class VoucherModel extends BaseModel {
  constructor() {
    super();
  }

  async fetchUserVoucherCode(voucherId: any, userId: any) {
    try {
      let result = await this._executeQuery(
        "select * from user_voucher_code where voucher_code_id=?  and user_id=?",
        [voucherId, userId]
      );
      return result[0];
    } catch (e) {
      throw "SQL error";
    }
  }

  async addVoucher(data: any) {
    return await this._executeQuery("insert into voucher_codes set ?", [data]);
  }

  async fetchVoucherUsers(
    id: any,
    pageSize: any,
    pageIndex: any,
    orderQuery: string,
    query: string
  ) {
    return await this._executeQuery(
      `SELECT  id, name, expiry_date, mobile FROM users where voucher_id = ?  ${orderQuery}
        LIMIT ? OFFSET ? `,
      [id, pageSize, pageIndex]
    );
  }

  async getAllVouchers(pageSize: any, pageIndex: any) {
    return await this._executeQuery(
      `select v.id ,v.code, v.corporate_id,v.expiry, v.value, 
      v.deleted_at, v.subscriptions_id,v.number_of_uses,v.already_use_count,v.type_of_organization,
      v.type_of_voucher,v.lifetime_free,v.days,v.discount_percentage,v.payment_link,v.plink,
      v.payment_details,v.utr,v.po_url,v.webhook_details,v.status,v.created_at,v.updated_at,
      v.payment_mode,v.is_email,v.downloadLink
       from voucher_codes v where status=1 LIMIT ? OFFSET ?`,
      [pageSize, pageIndex]
    );
  }

  async updateVoucher(data: any, id: number) {
    return await this._executeQuery("update voucher_codes set ? where id =?", [
      data,
      id,
    ]);
  }

  async updateNoOfUses(id: number, number_of_uses: any) {
    return await this._executeQuery(
      "update voucher_codes set number_of_uses= ? where id =?",
      [number_of_uses, id]
    );
  }

  async changeStatus(id: number) {
    return await this._executeQuery(
      "update voucher_codes set status=1 where id =?",
      [id]
    );
  }

  async bulkDeleteVoucher(id: any) {
    return await this._executeQuery(
      "UPDATE voucher_codes SET status = 0  WHERE  ID IN (?)",
      [id]
    );
  }

  async updateVoucherByPlink(data: any, plink: any) {
    return await this._executeQuery(
      "update voucher_codes set ? where plink =?",
      [data, plink]
    );
  }

  async fetchSubscriptionForVoucherDetails() {
    let result = await this._executeQuery(
      "select id, name from subscriptions order by id desc",
      []
    );
    return result;
  }

  async fetchCorporateForVoucherDetails(id: number) {
    return await this._executeQuery("select id, name from corporates order by id desc", []);
  }
  async fetchVoucher(plink: any) {
    return await this._executeQuery(
      "select id, code, corporate_id, expiry, value, deleted_at, subscriptions_id, number_of_uses, already_use_count, type_of_organization, type_of_voucher, lifetime_free, days, discount_percentage, payment_link, plink, payment_details, utr, po_url, webhook_details, status, payment_mode, is_email, downloadLink, status from voucher_codes where plink = ?",
      [plink]
    );
  }

  async createVoucherLinks(data: any) {
    return await this._executeQuery("insert into voucher_links set ?", [data]);
  }

  async fetchVoucherLink(short_code: any) {
    return await this._executeQuery(
      "select * from voucher_links where short_code = ?",
      [short_code]
    );
  }

  async fetchAllVoucher(
    pageSize: any,
    pageIndex: any,
    orderQuery: string,
    query: string,
    isPaginated: boolean
  ) {

    let append = isPaginated ? "LIMIT ? OFFSET ?" : "";
    let values = isPaginated ? [pageSize, pageIndex] : [];

    return await this._executeQuery(
      `select v.id ,v.code, v.corporate_id,v.expiry, v.value, 
      v.deleted_at, v.subscriptions_id,v.number_of_uses,v.already_use_count,v.type_of_organization,
      v.type_of_voucher,v.lifetime_free,v.days,v.discount_percentage,v.payment_link,v.plink,
      v.payment_details,v.utr,v.po_url,v.webhook_details,v.status,v.created_at,v.updated_at,
      v.payment_mode,v.is_email,v.downloadLink
       from voucher_codes v  ${query} ${orderQuery} ${append}
       `,
      values
    );
  }

  async fetchAllVoucherCount(query: string) {
    return await this._executeQuery(
      `SELECT  COUNT(id) as count FROM voucher_codes as v ${query} `,
      []
    );
  }

  async fetchVoucherUsersCount(id: number) {
    return await this._executeQuery(
      "SELECT COUNT(id) as count FROM users where voucher_id=? ",
      [id]
    );
  }

  async fetchCorporateName(id: number) {
    return await this._executeQuery(
      "SELECT name  FROM corporates where id=? ",
      [id]
    );
  }

  async fetchVoucherById(id: number) {
    return await this._executeQuery(
      "select id, code, corporate_id, expiry, value, deleted_at, subscriptions_id, number_of_uses, already_use_count, type_of_organization, type_of_voucher, lifetime_free, days, discount_percentage, payment_link, plink, payment_details, utr, po_url, webhook_details, status, payment_mode, is_email, downloadLink, status from voucher_codes  where id = ?",
      [id]
    );
  }

  async getPriceByID(id: number) {
    return await this._executeQuery(
      "select price ,discount from subscriptions  where id = ?",
      [id]
    );
  }

  async noOfUsesVoucher(id: number) {
    return await this._executeQuery(
      "select number_of_uses  from voucher_codes  where id = ?",
      [id]
    );
  }
  async deleteVoucher(id: any) {
    return await this._executeQuery(
      "update voucher_codes set status= 0 WHERE id = ?",
      [id]
    );
  }

  async deactivateVoucherUser(user_id: any, voucher_id: any) {
    let today = new Date();
    today.setDate(today.getDate() - 1);
    let yesterday = today.toISOString().split("T")[0];
    yesterday = "'" + yesterday + "'";

    return await this._executeQuery(
      `update users set expiry_date=${yesterday} WHERE id = ? and voucher_id=?`,
      [user_id, voucher_id]
    );
  }

  async deactivateVoucher(voucher_id: any) {
    return await this._executeQuery(
      "update voucher_codes set already_use_count= already_use_count-1 WHERE id = ?",
      [voucher_id]
    );
  }

  async getVoucherUser(id: number) {
    return await this._executeQuery(
      "select uvc.voucher_code_id,uvc.user_id, u.* FROM voucher_codes vc join user_voucher_code uvc on vc.id = uvc.voucher_code_id  join users u  on u.id = uvc.user_id where voucher_code_id = ?",
      [id]
    );
  }

  async insertUserVoucher(data: any) {
    return await this._executeQuery("insert into user_voucher_code set ?", [
      data,
    ]);
  }
  async updateVoucherLinkById(data: any, shortCode: any) {
    return await this._executeQuery(
      "update voucher_links set ? where short_code = ?",
      [data, shortCode]
    );
  }

  async PoUpload(paidVoucher: any, id: any) {
    return await this._executeQuery(
      "update  voucher_codes set ? where id = ?",
      [paidVoucher, id]
    );
  }

  async fetchUserSubscription(userid: number, status: any) {
    let result = await this._executeQuery(
      "select id,user_id,subscription_id,purchased_by,payment_id,status,is_expired,created_at,updated_at,deleted_at,cancel_reason,remark from user_subscriptions where user_id = ? and status = ?",
      [userid, status]
    );

    return result[0];
  }

  async UserGiftPopUp(giftId: number, userId: any) {
    return await this._executeQuery(
      "select value, status from wallets where id = ? and user_id = ?  and status = 1",
      [giftId, userId]
    );
  }

  async setStatus(giftId: number, userId: any) {
    return await this._executeQuery(
      "update wallets set status=0 where id = ? and user_id = ? ",
      [giftId, userId]
    );
  }

  async fetchByVoucherId(id: any) {
    try {
      let result = await this._executeQuery(
        `SELECT *    FROM voucher_codes where id = ${id}`,
        []
      );

      if (result.length == 0) return null;
      return result[0];
    } catch (e) {
      throw "SQL error";
    }
  }
}
