import BaseModel from "./BaseModel";

export class SettingModel extends BaseModel {
  constructor() {
    super();
  }
  async getSetting() {
    return await this._executeQuery(
      `SELECT * from settings order by id desc`, []
    );
  }
  async addNew(data: any) {
    return await this._executeQuery(
      `INSERT INTO settings set ?`, [data]
    );
  }
  async updateSetting(data: any, id: number) {
    return await this._executeQuery(
      `UPDATE settings set value = ? where id = ?`, [data, id]
    );
  }
  async deleteSetting(id:number){
    return await this._executeQuery(
      `DELETE FROM settings where id=? `,[id]
    )
  }

  async referralPointsOnSubscription() {
    return await this._executeQuery(
      `SELECT value from settings s where s.key="site.referral_point_on_subscription_purchase"`,
      []
    );
  }


  async getRegistartionPoint() {
    return await this._executeQuery(
      `SELECT value from settings s where s.key="site.registration_point"`,
      []
    );
  }

}
