import BaseModel from "./BaseModel";

export class SubscriptionModel extends BaseModel {
  constructor() {
    super();
  }

  async fetchUserRazorpayDetails(senderId: any) {
    try {
      let result = await this._executeQuery(
        "SELECT * FROM user_razopay where sender_id=? ",
        [senderId]
      );

      return result[0];
    } catch (e) {
      throw "SQL error";
    }
  }




  async findSubscription(id: any) {
    try {
      let result = await this._executeQuery(
        "SELECT * FROM subscriptions where id=? ",
        [id]
      );

      if (result.length == 0) return null;
      return result;
    } catch (e) {
      throw "SQL error";
    }
  }

  async fetchTransactionDetails(id: any) {
    let result = await this._executeQuery(
      "SELECT * FROM transaction_details where id=? ",
      [id]
    );

    return result[0];
  }

  async fetchSubscriptionByGiftSubscriptionId(id: number) {
    try {
      let result = await this._executeQuery(
        "select * from subscriptions where  id=?  ",
        [id]
      );

      return result[0];
    } catch (e) {
      throw "SQL error";
    }
  }

  async fetchAllSubscription(
    pageSize: any,
    pageIndex: any,
    sortOrder: string,
    query: string
  ) {
    return await this._executeQuery(
      `SELECT s.id, s.name , s.description ,s.frequency, s.days, s.image,
      s.price, s.discount,s.is_expired, s.status, s.created_at,s.updated_at, s.deleted_at,
      s.plan_id,s.currency,s.is_voucher,s.backgroud_color,s.shield_color,s.is_recommended,
      s.before_discount_price,s.price_with_gst,s.apple_product_id, s.apple_product_price,s.is_insurance_available,
      s.insurance_desc, s.strike_out_price
       FROM subscriptions  s ${query}
    ${sortOrder}   LIMIT ? OFFSET ?`,
      [pageSize, pageIndex]
    );
  }

  async fetchAllSubscriptionCount(query: any) {
    return await this._executeQuery(
      `SELECT COUNT(id) as count  FROM subscriptions  ${query}`,
      []
    );
  }

  async fetchSubscriptionById(id: number) {
    return await this._executeQuery(`SELECT distinct s.*,td.user_id as purchasedBy from subscriptions s
    LEFT JOIN transaction_details td ON s.plan_id = td.plan_id
   where s.id = ?`,[id]);
  }

  async fetchSubscriptionByUserId(userId: number) {
    return await this._executeQuery(
      "SELECT id FROM user_subscriptions where user_id=?",
      [userId]
    );
  }

  async isInsurance(id: number) {
    return await this._executeQuery(
      "SELECT is_insurance_available FROM subscriptions  where id = ?",
      [id]
    );
  }
  async fetchSubscriptionPlan() {
    return await this._executeQuery(
      "SELECT * FROM subscriptions where is_voucher=0 && status=1 && is_expired=0 && plan_id IS NOT NULL",
      []
    );
  }
  async bulkDeleteSubscription(id: any) {
    return await this._executeQuery(
      "UPDATE subscriptions SET status = 0  WHERE  ID IN (?)",
      [id]
    );
  }

  async fetchSubscriptionDetailsById(id: number) {
    return await this._executeQuery(
      `SELECT s.id, s.name , s.description ,s.frequency, s.days, s.image,
      s.price, s.discount,s.is_expired, s.status, s.created_at,s.updated_at, s.deleted_at,
      s.plan_id,s.currency,s.is_voucher,s.backgroud_color,s.shield_color,s.is_recommended,
      s.before_discount_price,s.price_with_gst,s.apple_product_id, s.apple_product_price,s.is_insurance_available,
      s.insurance_desc, s.strike_out_price
       FROM subscriptions  s where id = ?`,
      [id]
    );
  }

  async createSubscription(data: any) {
    return await this._executeQuery("insert into subscriptions set ?", [data]);
  }

  async updateSubscription(data: any, id: number) {
    return await this._executeQuery(
      "update subscriptions set ? where id = ? ",
      [data, id]
    );
  }

  async updateUserDetails(
    userId: number,
    subscriptionId: number,
    subscription_expiry_date: any
  ) {
    return await this._executeQuery(
      "update users set  subscription_id=?, expiry_date=?,voucher_id=NULL  where id = ? ",
      [subscriptionId, subscription_expiry_date,  userId]
    );
  }

  async insertUserSubscription(data: any) {
    return await this._executeQuery(" insert into user_subscriptions set ? ", [
      data,
    ]);
  }
  async updateCancelledSubscription(
    status: any,
    cancelReason: any,
    remark: any,
    userId: number
  ) {
    return await this._executeQuery(
      `UPDATE  user_subscriptions SET  status=${status} , cancel_reason="${cancelReason}", remark="${remark}" where user_id = ${userId} `,
      [status, cancelReason, remark, userId]
    );
  }

  async deleteSubscription(id: any) {
    return await this._executeQuery(
      "update subscriptions set status= 0 WHERE id = ?",
      [id]
    );
  }

  async isFutureSubcriptionExist(id: any, status: any): Promise<boolean> {
    try {
      let result = await this._executeQuery(
        "SELECT * FROM user_subscriptions  WHERE user_id = ? and status= ?",
        [id, status]
      );
      if (result.length == 0) return false;
      return true;
    } catch (e) {
      throw "SQL error !";
    }
  }

  async saveTransactionDetails(data: any) {

    return await this._executeQuery("insert into transaction_details set ?", [
      data,
    ]);
  }

  async fetchPlanDetails(
    planRecordId: any,
    planId: any,
    status: any,
    is_expired: any
  ) {
    return await this._executeQuery(
      "SELECT * FROM subscriptions  WHERE id = ? and plan_id= ? and status= ? and is_expired= ? ",
      [planRecordId, planId, status, is_expired]
    );
  }

  async getPlanDetails(planId: any, status: any, is_expired: any) {
    return await this._executeQuery(
      "SELECT * FROM subscriptions  WHERE  plan_id= ? and status= ? and is_expired= ?",
      [planId, status, is_expired]
    );
  }
  //check
  async transactionExists(userId: any, userOrderId: any, walletTxnId: any) {
    return await this._executeQuery(
      "SELECT * FROM transaction_details  WHERE  user_id= ? and user_order_id= ? and wallet_txn_id= ? ",
      [userId, userOrderId, walletTxnId]
    );
  }

  async getpendingTransaction(userId: any, OrderId: any) {
    return await this._executeQuery(
      "SELECT * FROM transaction_details  WHERE  user_id= ? and order_id= ?   ",
      [userId, OrderId]
    );
  }

  async updatePendingTransaction(getpendingTransaction: any, id: number) {
    return await this._executeQuery(
      "update transaction_details set ?  WHERE id = ?  ",
      [getpendingTransaction, id]
    );
  }

  async createUserSubscription(data: any) {
    return await this._executeQuery("insert into user_subscriptions set ?", [
      data,
    ]);
  }

  async findTransactionDetail(id: any) {
    return await this._executeQuery(
      "SELECT * FROM transaction_details where id = ?  ",
      [id]
    );
  }

  async fetchSubscriptionDetails(subscriptionId: any) {
    try {
      let result = await this._executeQuery(
        "SELECT * FROM subscriptions  WHERE id = ?  ",
        [subscriptionId]
      );

      return result[0];
    } catch (e: any) {
      throw "SQL error !";
    }
  }

  async UserSubscription(userId: any) {
    return await this._executeQuery(
      "SELECT * FROM user_subscriptions  WHERE user_id = ? and is_expired = 0 order by id desc limit 1",
      [userId]
    );
  }

  async fetchTransactionDetail(paymentId: any) {
    try {
      let result = await this._executeQuery(
        "SELECT * FROM transaction_details  WHERE id = ?  ",
        [paymentId]
      );

      return result[0];
    } catch (e: any) {
      throw "SQL error !";
    }
  }

  async fetchSubscription(price: any, frequency: any, days: any) {
    try {
      let result = await this._executeQuery(
        "SELECT * FROM subscriptions  WHERE price = ? and  frequency=? and days=? ",
        [price, frequency, days]
      );

      return result[0];
    } catch (e: any) {
      throw "SQL error !";
    }
  }

  async getSubscription(id: number) {
    try {
      let result = await this._executeQuery(
        "SELECT * FROM subscriptions  WHERE id = ?  ",
        [id]
      );

      return result[0];
    } catch (e: any) {
      throw "SQL error !";
    }
  }
}
