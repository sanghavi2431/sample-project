import _, { cloneDeep } from "lodash";
import ts from "typescript";
import { SettingModel } from "../Models/Setting.model";
import formidable from "formidable";
import { uploadFile } from "../utilities/S3Bucket";
import moment from "moment";
import config from "../config";


const getSetting = async () => {
  try {
    let settings: any = await new SettingModel().getSetting();
    let groups: any = settings.reduce((acc: any, item: any) => {
      (!acc.includes(item.group)) ? acc.push(item.group) : acc;
      return acc
    }, [])
    let obj: any = {};
    let newobj: any = {};
    groups.map((group: any) => obj[group] = settings.filter((setting: any) => setting.group == group))
    for (let data in obj) {
      let base_url: any;
      newobj[data] = obj[data].map((d: any) => {
        if (d.type == "image" || d.type == "file") {
          return { ...d, base_url: (config.s3imagebaseurl) }
        }
        return d
      })
    }
    return newobj;
  } catch (error: any) {
    return error;
  }
}
const addNew = async (data: any) => {
  let settings: any = await new SettingModel().addNew(data);
  if (!settings) throw new Error("operation  failed");
  return { Response: "SETTING SUCCESSFULLY CREATED ! " };
}
const processWolooGuestForm = async (req: any) => {
  let s3Path: any = [];
  const form = new formidable.IncomingForm();
  return new Promise((resolve, reject) => {
    form.parse(req, async (err: any, fields: any, files: any) => {
      try {
        let fileType = ["xls", "xlsx", "pdf"]
        let imgType = ["png", "jpeg"]
        for (let file in files) {
          // if()

          const images: any = files[file];
          if (imgType.includes(images.originalFilename.split(".").pop())) {
            const imageName =
              moment().unix() + "." + images.originalFilename.split(".").pop();

            let name: string = "Images/" + "Setting" + "/" + imageName;

            const result = await uploadFile(images, name);

            if (result == 0 && result == undefined)
              throw new Error("file upload to s3 failed");
            let obj: any = {}
            obj[file] = result.key
            s3Path.push(obj);
          }
          else {
            const fileName =
              moment().unix() + "." + images.originalFilename.split(".").pop();

            let name: string = "Files/" + "Setting" + "/" + fileName;

            const result = await uploadFile(images, name);

            if (result == 0 && result == undefined)
              throw new Error("file upload to s3 failed");

            let obj: any = {}
            obj[file] = result.key
            s3Path.push(obj);
          }
        }
        resolve({ fields: fields, s3Path: s3Path });
      } catch (e) {
        throw e;
      }
    });
  });
};
const updateSetting = async (req: any) => {

  let s3Path, response: any, fields: any, files: any;
  // @ts-ignore

  response = await processWolooGuestForm(req);

  if (response instanceof Error) throw response;
  fields = response.fields;
  s3Path = response.s3Path;
  let Settings: any = {}
  for (let field in fields) {
    Settings[field] = fields[field]
  }
  for (let Path of s3Path) {
    for (let p in Path) {
      Settings[p] = Path[p]
    }
  }
  for (let setting in Settings) {
    await new SettingModel().updateSetting(Settings[setting], +setting)
  }
  return { Response: "SETTING SUCCESSFULLY UPDATED ! " };
}
const deleteSetting = async (id: any) => {
  let response = await new SettingModel().deleteSetting(id)
  if (response.affectedRows == 0) {
    return { Response: "USER ID NOT FOUND ! " };

  }
  else{
    return { Response: "SETTING SUCCESSFULLY DELETED ! " };

  }

}
export default {
  getSetting,
  addNew,
  updateSetting,
  deleteSetting
};
