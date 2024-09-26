import BaseModel from "./BaseModel";

export class UserLocLogs extends BaseModel {
  constructor() {
    super();
  }

  async createUserLocationLog(data: any) {
    return await this._executeQuery("insert into user_location_logs set ?", [data]);
  }
}
