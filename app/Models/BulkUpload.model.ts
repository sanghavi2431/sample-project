import BaseModel from "./BaseModel";

export class Template extends BaseModel {
    constructor() {
        super();
    }

    async getTemplate() {
        return await this._executeQuery("select * from templates", [])
    }

    async createTemplate(fileName: any,template_cols: any,tableName: any) {
        return await this._executeQuery(`INSERT INTO templates (file_name, template_cols, tableName) VALUES  (?,?,?)`,[fileName,template_cols,tableName])
    }
    async getSingleTemplate(templateid: any) {
        return await this._executeQuery("select * from templates where id = ?", [templateid]);
    }

    async mapTemplate(mapped_cols: any, templateid: any) {
        return await this._executeQuery("update templates set  ? where  id = ?", [mapped_cols, templateid]);
    }

    async getTemplateCols(templateid: any) {
        return await this._executeQuery("select template_cols, tableName, mapped_cols, rules from templates where id = ?", [templateid]);
    }

    async getTableCols(tabelName: any) {
        return await this._executeQuery(`SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS  WHERE TABLE_NAME = N'${tabelName}' and DATA_TYPE != 'timestamp'`, [tabelName]);
    }

    async bulkInsert(tabelName: any, data: any, keys: { toString: () => any; }) {
        return await this._executeQuery(`insert into ${tabelName} (${keys.toString()}) values ?`, [data]);
    }
    async  bulkUpdate(tableName: any, data: any, keys: any,ids:any) {
        console.log("tableName: any, data: any, keys: any,ids:any",tableName, data, keys,ids)
        const updateQuery = `UPDATE ${tableName} SET ${keys.map((key:any, index:any) => `${key} = ?`).join(', ')} WHERE id = ?`;
        console.log("updateQuery",updateQuery)
        let changeCount=0
    // Execute the update query for each row of data
    for (let i = 0; i < data.length; i++) {
        const rowData = data[i];
        const id = ids[i];
        let res= await this._executeQuery(updateQuery, [...rowData, id]);
        console.log("res",res)
        changeCount=changeCount+res.affectedRows
    }
    return changeCount;
    }
    

    async createTemplateTable(){
        return await this._executeQuery(`
        CREATE TABLE if not exists templates (
            id int(11) NOT NULL AUTO_INCREMENT,
            file_name varchar(45) DEFAULT NULL,
            template_cols LONGTEXT DEFAULT NULL,
            mapped_cols text,
            tableName varchar(45) DEFAULT NULL,
            PRIMARY KEY (id)
          ) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8;
          `,[]);
    }
}

