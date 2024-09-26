import BaseModel from "./BaseModel";

export class WolooOTP extends BaseModel {
  constructor() {
    super();
  }

  async createOTP(otpsData: any) {
    let registerOTP = await this._executeQuery("insert into otps set ?", [
      otpsData,
    ]);
    return registerOTP;
  }

  async updateTrials(req_id: any, trials: any) {
    return await this._executeQuery(
      "update otps set trials = ? where req_id = ?",
      [trials, req_id]
    );
  }

  async getOtp(data: any) {
    return await this._executeQuery("select * from otps where req_id = ?", [
      data.request_id,
    ]);
  }
}
