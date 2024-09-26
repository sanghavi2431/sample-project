import BaseModel from "./BaseModel";

export class HealthCheckModel extends BaseModel   {
    constructor() {
        super();
    }

    async heathCheck(){
        return await this._executeQuery("select now();", []);
    }
}