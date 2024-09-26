import BaseModel from "./BaseModel";

export class WalletModel extends BaseModel {
  constructor() {
    super();
  }

  async creatWolooeWallet(data: any) {
    return await this._executeQuery("insert into woloo_wallets set ?", [data]);
  }

  async createWallet(data: any) {
    return await this._executeQuery("insert into wallets set ?", [data]);
  }
  async getWolooWallet(walletId: any, userId: number, type: string) {
    return await this._executeQuery(
      "select * from woloo_wallets where woloo_id = ? and user_id = ? and  type= ? order by created_at desc limit 1",
      [walletId, userId, type]
    );
  }

  async getWalletWhere(data: any) {
    return await this._executeQuery(
      "select * from woloo_wallets where woloo_id = ? and user_id = ? and type = ?",
      [data.woloo_id, data.user_id, data.type]
    );
  }

  async deleteWallet(userId: any, transactionId: number) {
    return await this._executeQuery(
      `DELETE FROM wallets
      WHERE id = ?
        AND type IN ('Ecom Points Debit', 'Ecom Gift Debit')
        AND user_id = ?
      `,
      [transactionId, userId]
    );
  }


  async getWalletById(userId: any, transactionId: number) {

    return await this._executeQuery(
      `SELECT *
        FROM wallets
        WHERE id = ?
        AND type IN ('Ecom Points Debit', 'Ecom Gift Debit')
         AND user_id = ?
        LIMIT 1;
        `,
      [transactionId, userId]
    );
  }

  // async getWalletById(userId: any, transactionId: number) {
  //   return await this._executeQuery(
  //     `SELECT *
  //       FROM wallets
  //       WHERE id = ?
  //         AND type IN ('Ecom Points Debit', 'Ecom Gift Debit')
  //         AND user_id = ?
  //       LIMIT 1;
  //       `,
  //     [transactionId, userId]
  //   );
  // }
  async getWalletwithRemark(wolooId: any, userId: number, type: string,remark:string) {
    console.log(wolooId, userId, type,remark)
    return await this._executeQuery(
      "select * from wallets where (woloo_id = ? and user_id = ? and  transaction_type= ? and  remarks= ? )order by created_at desc limit 1",
      [wolooId, userId, type,remark]
    );
  }
}

