import BaseModel from "./BaseModel";

export class OfferModel extends BaseModel {
  constructor() {
    super();
  }
  async createOffer(data: any) {
    return await this._executeQuery("insert into offers set ?", [data]);
  }
  async deleteOffer(id: number) {
    return await this._executeQuery("update offers set status= 0 WHERE id = ?", [
      id,
    ]);
  }
  async getOfferByID(id: number) {
    return await this._executeQuery("select * from offers WHERE id = ?", [
      id,
    ]);
  }
  async updateOffer(data: any, id: number) {
    return await this._executeQuery("update offers set ? where id = ? ", [
      data,
      id,
    ]);
  }

  async getAllOffer(
    pageSize: any,
    pageIndex: any,
    sortOrder: string,
    query: string
  ) {
    return await this._executeQuery(
      `SELECT * from offers 
       ${query}
      ${sortOrder}   LIMIT ? OFFSET ?`,
      [pageSize, pageIndex]
    );
  }

  async getAllOfferCount(query: any) {
    return await this._executeQuery(
      `SELECT COUNT(id) as count  FROM offers  ${query}`,
      []
    );
  }

}
