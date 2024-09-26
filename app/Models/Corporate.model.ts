import BaseModel from "./BaseModel";

export class CorporateModel extends BaseModel {
  constructor() {
    super();
  }

  async addCorporate(data: any) {
    return await this._executeQuery("insert into corporates set ?", [data]);
  }

  async getAllCorporate(
    pageSize: any,
    pageIndex: any,
    sortOrder: string,
    query: string
  ) {
    return await this._executeQuery(
      `SELECT c.id, c.name, c.contact_name,c.email,c.mobile,c.mobile2,c.address,c.city,c.type,c.status,c.created_at,
      c.updated_at,c.deleted_at FROM corporates as c  ${query}
      ${sortOrder}   LIMIT ? OFFSET ?`,
      [pageSize, pageIndex]
    );
  }

  async checkEmail(email: any) {
    return await this._executeQuery(
      "select c.email from corporates c where email =?",
      [email]
    );
  }


  async checkMobile(mobile: any) {
    return await this._executeQuery(
      "select c.mobile from corporates c where mobile =?",
      [mobile]
    );
  }

  async deleteCorporatesById(id: any) {
    return await this._executeQuery(
      "update corporates set status= 0 WHERE id = ?",
      [id]
    );
  }

  async getAllCorporateCount(query: any) {
    return await this._executeQuery(
      `SELECT COUNT(id) as count  FROM corporates  ${query}`,
      []
    );
  }

  async fetchCorporatesById(id: number) {
    return await this._executeQuery(
      `SELECT c.id, c.name, c.contact_name,c.email,c.mobile,c.mobile2,c.address,c.city,c.type,c.status,c.created_at,
    c.updated_at,c.deleted_at FROM corporates as c where id = ?`,
      [id]
    );
  }

  async deleteCorporatesByMultiId(id: any) {
    return await this._executeQuery(
      "UPDATE corporates SET status = 0  WHERE  ID IN (?)",
      [id]
    );
  }

  async fetchCorporatesDetails(id: number) {
    return await this._executeQuery("select id, name from corporates ", []);
  }

  async updateCorporate(data: any, id: number) {
    return await this._executeQuery("update corporates set ? where id = ? ", [
      data,
      id,
    ]);
  }

  async findByCorporateId(id: number) {
    try {
      let result = await this._executeQuery(
        "select * from corporates where id =?",
        [id]
      );

      return result[0];
    } catch (e: any) {
      throw "SQL error !";
    }
  }
}
