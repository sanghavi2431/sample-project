import BaseModel from "./BaseModel";

export class ClientAuth extends BaseModel {
  constructor() {
    super();
  }

  async getClient(client_id : any, client_secret: any) {
    const result = await this._executeQuery(`SELECT * from clients where client_id = ? and client_secret = ?`,[client_id,client_secret]);
    return result[0];
  }
}
