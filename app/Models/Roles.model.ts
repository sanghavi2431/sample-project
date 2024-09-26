import BaseModel from "./BaseModel";

export class RoleModel extends BaseModel {
  constructor() {
    super();
  }

  async addRole(data: any) {
    return await this._executeQuery(`insert into roles set ? ;`, [data]);
  }

  async getAllRoles(
    pageSize: any,
    pageIndex: any,
    sortOrder: string,
    query: string
  ) {
    return await this._executeQuery(
      `SELECT * FROM roles ${query}
      ${sortOrder}   LIMIT ? OFFSET ?`,
      [pageSize, pageIndex]
    );
  }

  async deleteRoleById(id: any) {
    return await this._executeQuery(
      "delete from roles WHERE id = ?",
      [id]
    );
  }

  async getAllRolesCount(query: any) {
    return await this._executeQuery(
      `SELECT COUNT(id) as count  FROM roles  ${query}`,
      []
    );
  }

  async fetchRolesById(id: number) {
    return await this._executeQuery(
      `SELECT * from roles where id = ?`,
      [id]
    );
  }

  async updateRole(data: any, id: number) {
    return await this._executeQuery("update roles set ? where id = ? ", [
      data,
      id,
    ]);
  }
}
