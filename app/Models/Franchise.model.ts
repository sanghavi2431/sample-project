import BaseModel from "./BaseModel";

export class FranchiseModel extends BaseModel {
    constructor() {
        super()
    }
    async getAllFranchise(
        pageSize: any,
        pageIndex: any,
        sortOrder: string,
        query: string
    ) {
        return await this._executeQuery(
            `SELECT w.id,w.code,w.name,w.title,w.status,w.address,w.pincode FROM woloos as w  ${query}
            ${sortOrder}   LIMIT ? OFFSET ?`,
            [pageSize, pageIndex]
        )
    }
    async getAllFranchiseCOunt(
        query: string
    ){
        return await this._executeQuery(
            `SELECT COUNT(w.id) as count FROM woloos as w  ${query}`,[]
        )
    }
}