import BaseModel from "./BaseModel";

export class Transactions extends BaseModel {
  constructor() {
    super();
  }

  async userRazorpay(data: any) {
    return await this._executeQuery("insert into user_razopay set ?", [data]);
  }
  async fetchUserRazorpay(orderId: any) {
    return await this._executeQuery(
      "select  * from user_razopay where order_id = ?",
      [orderId]
    );
  }
  async fetchUserRazorpayWithoutSub(orderId: any) {
    return await this._executeQuery(
      "select  * from user_razopay where order_id = ? and coins IS NOT NULL",
      [orderId]
    );
  }
  async updateUserRazorpay(data: any, order_id: any) {
    return await this._executeQuery(
      "update user_razopay set ? where order_id = ? ",
      [data, order_id]
    );
  }

  async transactUserCoins(coins: any, userId: any, isGift: number) {
    return await this._executeQuery(
      `INSERT INTO wallets (user_id, transaction_type, value, is_gift) VALUES  (?,?,?,?)`,
      [userId, "CR", coins, isGift]
    );
  }
  async getTransactionDetails(
    pageSize: any,
    pageIndex: any,
    sortOrder: string,
    query: string
  ) {
    return await this._executeQuery(
      `SELECT tr.id,tr.transaction_id,tr.plan_id,tr.transaction_amount,tr.plan_type,tr.transaction_utc_datetime,us.name,us.mobile, 
      CASE
  WHEN  tr.charging_status ="2" and tr.wallet_txn_id IS NOT NULL  THEN 'Completed'
 
 ELSE "Pending"
END AS status
       FROM transaction_details AS tr LEFT JOIN users AS us ON tr.user_id=us.id ${query} ${sortOrder} LIMIT ? OFFSET ?`,
      [pageSize, pageIndex]
    );
  }

  async getAllTransactionDetailsCount(query: any) {
    return await this._executeQuery(
      `SELECT COUNT(tr.id) as count FROM transaction_details AS tr left join users us on tr.user_id=us.id ${query}`,
      []
    );
  }
  async getTransactionDetailsById(id: any) {
    return await this._executeQuery(
      `SELECT tr.id,tr.charging_status,tr.user_id,tr.client_ip,tr.platform,tr.country,tr.unit_type,tr.order_id,tr.wallet_txn_id,tr.purchase_token,tr.purchase_time,tr.purchase_state,tr.transaction_id,tr.plan_id,tr.transaction_amount,tr.plan_type,tr.channel_tag,tr.currency,tr.user_order_id,tr.channel_name,tr.transaction_utc_datetime,us.name as user_name,us.mobile FROM transaction_details as tr left join users as us on tr.user_id=us.id where tr.id = ?`,
      [id]
    );
  }
}
