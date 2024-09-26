import { Template } from "../Models/BulkUpload.model";
import * as xlsx from "xlsx";
import path = require("path");
import common from "../utilities/common";
import { WolooGuestModel } from "../Models/WolooGuest.model";
import { WolooHostModel } from "../Models/WolooHost.model";
import Hashing from "./Hashing";
import Guest from "../Services/CommonService/Guest";
import { SettingModel } from "../Models/Setting.model";
import { WalletModel } from "../Models/Wallet.model";
import config = require("../config");
import transporter from "./Email";
import SMS from "../utilities/SMS";
import DownloadIMG from "../utilities/DownloadImgandStoreLocally";
import moment = require("moment");
import { uploadFile, uploadLocalFile } from "./S3Bucket";

const fs = require("fs");
export default {
  listTemplate: async () => {
    try {
      const result = await new Template().getTemplate();
      if (result.length < 1) throw new Error("No templated found");
      return result;
    } catch (error) {
      return error;
    }
  },

  importTemplate: async (filePath: string, table: any) => {
    try {
      const file = xlsx.readFile(filePath);
      const sheetName = file.SheetNames[0];
      const sheet = file.Sheets[sheetName];
      let data = [];
      for (let r in sheet) {
        if (sheet[r].v) data.push(sheet[r].v);
      }
      await new Template().createTemplate("SomeFile", data.toString(), table);
      return "Template Created Successfully";
    } catch (error) {
      console.log("Error Import", error);
      return "Failed to import template";
    }
  },
  getTemplate: async (templateid: any) => {
    try {
      const result = await new Template().getSingleTemplate(templateid);
      if (result.length < 1) throw new Error("No template found");
      return result[0];
    } catch (error) {
      return error;
    }
  },

  getCols: async (templateid: any) => {
    try {
      const result = await new Template().getTemplateCols(templateid);
      const tableCols = await new Template().getTableCols(result[0].tableName);
      const tab = tableCols.map(
        (ele: { [x: string]: any }) => ele["COLUMN_NAME"]
      );
      const temp = result[0].template_cols.split(",");
      const colstemplated = common.mapKeys(temp);
      const colstable = common.mapKeys(tab);
      return { templateCols: colstemplated, tableCols: colstable };
    } catch (error) {
      return { error: "Failed to Get Cols" };
    }
  },

  mapTemplate: async (templateid: any, mappedCols: { [x: string]: any }) => {
    try {
      let template = await new Template().getTemplateCols(templateid);
      template = template[0].template_cols.split(",");
      const predefined: any = {};
      let finalCols = {};
      const rules: any = {};
      for (let i = 0; i < template.length; i++) {
        let templateKey = template[i];
        if (templateKey) {
          if (mappedCols[templateKey]) {
            const checkColumn =
              mappedCols[templateKey].hasOwnProperty("column");
            const checkDefault =
              mappedCols[templateKey].hasOwnProperty("default");
            const checkRequired =
              mappedCols[templateKey].hasOwnProperty("isRequired");

            if (checkRequired) {
              if (mappedCols[templateKey]["isRequired"] == false) {
                delete mappedCols[templateKey];
              }
            }
            if (checkColumn) {
              predefined[templateKey] = mappedCols[templateKey]["column"];
            }

            if (checkDefault) {
              rules[templateKey] = mappedCols[templateKey];
            }
          } else {
            predefined[templateKey] = templateKey;
          }
        }
      }
      finalCols = { ...predefined };
      const result = await new Template().mapTemplate(
        {
          mapped_cols: JSON.stringify(finalCols),
          rules: JSON.stringify(rules),
        },
        templateid
      );
      if (result.affectedRows == 1) {
        return "Rows Mapped Successfully";
      } else {
        throw new Error("Failed to Map Template");
      }
    } catch (error) {
      return error;
    }
  },

  bulkUpload: async (templateid: any, filePath: string) => {
    // try {

    const template = await new Template().getTemplateCols(templateid);

    const mapped_cols = template[0].mapped_cols
      ? JSON.parse(template[0].mapped_cols)
      : {};
    const tableName = template[0].tableName;

    const file = xlsx.readFile(filePath);

    const sheetName = file.SheetNames[0];
    const sheet = file.Sheets[sheetName];
    let sheetData: any = xlsx.utils.sheet_to_json(sheet, { defval: "" });
    let newsheetData = sheetData
      .filter((sheet: any) => sheet.is_new === 1)
      .map((sheet: any) => {
        delete sheet.id;
        return sheet;
      });
    let updatesheetData = sheetData.filter((sheet: any) => sheet.is_new === 0);
    // console.log("newsheetData: ", newsheetData);
    // console.log("updatesheetData: ", updatesheetData);

    if (sheetData?.length == 0)
      throw new Error("Sheet have 0 Entries. Please input data and try again");
    if (sheetData?.length > 100)
      throw new Error("Sheet should not have data more than 100 rows");

    function findEmptyKeys(arr: any) {
      const ignoreKeys = [
        "id",
        "email",
        "recommended_by",
        "recommended_mobile",
        "rating",
        "description",
        "opening_hours",
      ];

      const emptyKeys: any = [];

      arr.forEach((obj: any) => {
        Object.keys(obj).forEach((key) => {
          if (
            (obj[key] === null || obj[key] === undefined || obj[key] === "") &&
            !ignoreKeys.includes(key)
          ) {
            emptyKeys.push(key);
          }
        });
      });

      return emptyKeys;
    }
    let EmptyKeys = findEmptyKeys(newsheetData);
    if (EmptyKeys.length)
      throw new Error(`${[...EmptyKeys]} should not be empty`);

    function findDuplicatesByProperties(array: any, properties: any) {
      const seen: any = {};
      const duplicates: any = [];

      for (const obj of array) {
        for (const property of properties) {
          if (!seen[property]) {
            seen[property] = new Set();
          }
          const value = obj[property];
          if (seen[property].has(value)) {
            duplicates.push(obj);
            break; // Only add the object once if any property is duplicated
          } else {
            seen[property].add(value);
          }
        }
      }

      return duplicates;
    }

    function allObjectsHaveValidId(arr: any) {
      return arr.every(
        (obj: any) =>
          obj.hasOwnProperty("id") && obj.id !== null && obj.id !== undefined
      );
    }

    if (!allObjectsHaveValidId(updatesheetData))
      throw new Error(`Some update row have no Id`);

    let non_exist_id = [];
    for (let i = 0; i < updatesheetData.length; i++) {
      let is_exist = await new WolooGuestModel().isHostExist(
        updatesheetData[i]?.id
      );
      // console.log("updatesheetData[i]?.id", updatesheetData[i]?.id, is_exist);
      if (is_exist.length == 0) non_exist_id.push(updatesheetData[i]?.id);
    }
    // console.log("non_exist_id", non_exist_id);
    if (non_exist_id.length) {
      throw new Error(`${[...non_exist_id]} id are not present !`);
    }

    let duplicate_Array = findDuplicatesByProperties(sheetData, [
      "mobile",
      "email",
    ]);
    if (duplicate_Array.length) {
      throw new Error(`Files have duplicates !`);
    }
    // Email and mobile repeatation check
    let repeatedEmail = [];
    let repeatedMobile = [];
    for (let i = 0; i < newsheetData.length; i++) {
      // Check if email exists in user table for new sheet
      if (newsheetData[i]?.email) {
        let checkEmail = await new WolooGuestModel().getUserByEmail(
          newsheetData[i]?.email
        );
        if (checkEmail.length != 0)
          repeatedEmail.push({
            email: newsheetData[i]?.email,
            username: checkEmail[0]?.name,
          });
      }
      let checkMobile = await new WolooGuestModel().getUserByMobile(
        newsheetData[i]?.mobile
      );
      if (checkMobile.length != 0)
        repeatedMobile.push({
          mobile: newsheetData[i]?.mobile,
          username: checkMobile[0]?.name,
        });
    }

    for (let i = 0; i < updatesheetData.length; i++) {
      // Check if email exists in host or user table for update sheet
      const checkEmailForHost = await new WolooGuestModel().isHostEmailExist(
        updatesheetData[i]?.email,
        updatesheetData[i]?.id
      );
      if (checkEmailForHost.length !== 0)
        repeatedEmail.push({
          email: updatesheetData[i]?.email,
          wolooname: checkEmailForHost[0]?.name,
        });

      const checkEmailForHostUser =
        await new WolooGuestModel().isHostUserEmailExist(
          updatesheetData[i]?.email,
          updatesheetData[i]?.id
        );

      if (checkEmailForHostUser.length !== 0)
        repeatedEmail.push({
          email: updatesheetData[i]?.email,
          username: checkEmailForHostUser[0]?.name,
        });

      // Check if mobile exists in host or user table for update sheet
      const checkMobileForHost = await new WolooGuestModel().isHostMobileExist(
        updatesheetData[i]?.mobile,
        updatesheetData[i]?.id
      );
      if (checkMobileForHost.length !== 0)
        repeatedMobile.push({
          mobile: updatesheetData[i]?.mobile,
          wolooname: checkMobileForHost[0]?.name,
        });

      const checkMobileForHostUser =
        await new WolooGuestModel().isHostUserMobileExist(
          updatesheetData[i]?.mobile,
          updatesheetData[i]?.id
        );
      if (checkMobileForHostUser.length !== 0)
        repeatedMobile.push({
          mobile: updatesheetData[i]?.mobile,
          username: checkMobileForHostUser[0]?.name,
        });
    }

    if (repeatedMobile.length || repeatedEmail.length) {
      let errorMessage = "Duplicate entries detected:";

      if (repeatedEmail.length > 0) {
        errorMessage += " Emails -";
        repeatedEmail.forEach((item, index) => {
          errorMessage += ` ${item.email} (${
            item.username
              ? "User: " + item.username
              : "Woloo: " + item.wolooname
          }
          )${index < repeatedEmail.length - 1 ? "," : ""}`;
        });
      }

      if (repeatedMobile.length > 0) {
        errorMessage += `${repeatedEmail.length > 0 ? ";" : ""} Mobiles -`;
        repeatedMobile.forEach((item, index) => {
          errorMessage += ` ${item.mobile} (${
            item.username
              ? "User: " + item.username
              : "Woloo: " + item.wolooname
          }
          )${index < repeatedMobile.length - 1 ? "," : ""}`;
        });
      }

      throw new Error(errorMessage);
    }

    async function getS3Url(url: string) {
      await DownloadIMG.downloadAndStoreImage(url, "public/image/image.jpg");

      const imageName = moment().unix().toString(); // Convert Unix timestamp to a string

      const uploadPath: string = "Images/WolooHost/" + imageName + ".png"; // Concatenate imageName with uploadPath

      const uploadstatus = await uploadLocalFile(
        "public/image/image.jpg",
        uploadPath,
        "image/png"
      );
      return uploadstatus;
    }
    const newSheet___Data = [];
    for (const data of newsheetData) {
      const arrOfNewsheetImage: any = [];
      // console.log("sheetDatasheetData", data);
      if (data?.image) {
        let arrOfImg = data?.image?.split(",");
        for (const img of arrOfImg) {
          // console.log("img", img);
          const s3Imagelink = await getS3Url(img);
          // console.log("s3Imagelink", s3Imagelink);

          // Extracting the path from the URL
          const url = new URL(s3Imagelink);
          arrOfNewsheetImage.push(`${url.pathname}`);
        }
        // data.image = `['${url.pathname}']`;
        data.image = `['${arrOfNewsheetImage}']`;
      }
      newSheet___Data.push(data);
    }
    newsheetData = [...newSheet___Data];

    const updateSheet___Data = [];
    for (const data of updatesheetData) {
      const arrOfUpdatesheetImage: any = [];
      if (data?.image) {
        let arrOfImg = data?.image?.split(",");
        for (const img of arrOfImg) {
          const s3Imagelink = await getS3Url(img);
          // Extracting the path from the URL
          const url = new URL(s3Imagelink);
          arrOfUpdatesheetImage.push(`${url.pathname}`);
        }
        data.image = `['${arrOfUpdatesheetImage}']`;
      }
      updateSheet___Data.push(data);
    }
    updatesheetData = [...updateSheet___Data];

    //Bulk Image Upload

    // const imageName =
    // moment().unix() + "." + images.originalFilename.split(".").pop();

    // let name: string = "Images/" + "Setting" + "/" + imageName;

    // Woloo host code creation
    for (let data of newsheetData) {
      data.code =
        "WH" +
        data.city.toString().substr(0, 3).toUpperCase() +
        Math.floor(Math.random() * 90000);
      // data.status = 1
    }

    //opening hour calculation and error handling

    let time_Format = /(?:[01]\d|2[0-3]):(?:[0-5]\d):(?:[0-5]\d)/;

    // for new sheet data
    const mappedData: any = [];
    const rules = template[0].rules ? JSON.parse(template[0].rules) : {};
    // console.log("rules: ", rules);
    // let keys = newsheetData?.length && Object.keys(newsheetData[0]);

    // let update = Object.keys(mapped_cols).filter((k) => {
    //   if (!keys.includes(k)) return k;
    // });

    const openingHours = [];
    const codes = [];
    // console.log("newsheetData", newsheetData);
    if (newsheetData?.length) {
      for (let index in newsheetData) {
        let obj: any = newsheetData[index];
        let keys = Object.keys(obj);
        let temp: any = {};
        codes.push(obj["code"]);

        // console.log("----------- Opening Hours Bulk Upload Test -------------");
        // if (key.startsWith('opening_hours_') || key.startsWith('closing_hours_')) {
        if (obj["opening_hours_1"]) {
          if (!time_Format.test(obj["opening_hours_1"])) {
            throw new Error(
              "Invalid opening_hours_1 . The time format is HH:MM:SS "
            );
          }
          if (!obj["closing_hours_1"])
            throw new Error("closing_hours_1 required");
          if (!time_Format.test(obj["closing_hours_1"])) {
            throw new Error(
              "Invalid closing_hours_1 . The time format is HH:MM:SS "
            );
          }
          let temp = {
            woloo: obj["code"],
            open_time: obj["opening_hours_1"],
            close_time: obj["closing_hours_1"],
          };
          openingHours.push(temp);
        }
        if (obj["opening_hours_2"]) {
          if (!time_Format.test(obj["opening_hours_2"])) {
            throw new Error(
              "Invalid opening_hours_2 . The time format is HH:MM:SS "
            );
          }
          if (!obj["closing_hours_2"])
            throw new Error("closing_hours_2 required");
          if (!time_Format.test(obj["closing_hours_2"])) {
            throw new Error(
              "Invalid closing_hours_2 . The time format is HH:MM:SS "
            );
          }
          let temp = {
            woloo: obj["code"],
            open_time: obj["opening_hours_2"],
            close_time: obj["closing_hours_2"],
          };
          openingHours.push(temp);
        }
        if (obj["opening_hours_3"]) {
          if (!time_Format.test(obj["opening_hours_3"])) {
            throw new Error(
              "Invalid opening_hours_3 . The time format is HH:MM:SS "
            );
          }
          if (!obj["closing_hours_3"])
            throw new Error("closing_hours_3 required");
          if (!time_Format.test(obj["closing_hours_3"])) {
            throw new Error(
              "Invalid closing_hours_3 . The time format is HH:MM:SS "
            );
          }
          let temp = {
            woloo: obj["code"],
            open_time: obj["opening_hours_3"],
            close_time: obj["closing_hours_3"],
          };
          openingHours.push(temp);
        }
        // }
        // console.log("------------------------------------------");
        // imple opening hour function
        // console.log("keys", keys, mapped_cols);
        for (let k in keys) {
          let key = keys[k];

          if (mapped_cols[key]) {
            if (obj[key]) {
              temp[key] = obj[key];
            } else if (rules.hasOwnProperty(key)) {
              const checkDefault = rules[key].hasOwnProperty("default");
              if (checkDefault) {
                temp[key] = rules[key]["default"];
              }
            } else {
              temp[key] = "";
            }
          }
        }

        mappedData.push(temp);
      }
    }

    // for update sheet data
    const mappedUpdateData: any = [];

    // let updatekeys = updatesheetData?.length && Object.keys(updatesheetData?.[0]);

    const openingHours_update: any = [];
    const codes_update = [];

    if (updatesheetData?.length) {
      for (let index in updatesheetData) {
        let obj: any = updatesheetData[index];
        let keys = Object.keys(obj);
        let temp: any = {};
        codes_update.push(obj["code"]);

        // console.log("----------- Opening Hours Bulk Upload Test -------------");
        if (obj["opening_hours_1"]) {
          if (!time_Format.test(obj["opening_hours_1"])) {
            throw new Error(
              "Invalid opening_hours_1 . The time format is HH:MM:SS "
            );
          }
          if (!obj["closing_hours_1"])
            throw new Error("closing_hours_1 required");
          if (!time_Format.test(obj["closing_hours_1"])) {
            throw new Error(
              "Invalid closing_hours_1 . The time format is HH:MM:SS "
            );
          }
          let temp = {
            woloo: obj["id"],
            open_time: obj["opening_hours_1"],
            close_time: obj["closing_hours_1"],
          };
          openingHours_update.push(temp);
        }
        if (obj["opening_hours_2"]) {
          if (!time_Format.test(obj["opening_hours_2"])) {
            throw new Error(
              "Invalid opening_hours_2 . The time format is HH:MM:SS "
            );
          }
          if (!obj["closing_hours_2"])
            throw new Error("closing_hours_2 required");
          if (!time_Format.test(obj["closing_hours_2"])) {
            throw new Error(
              "Invalid closing_hours_2 . The time format is HH:MM:SS "
            );
          }
          let temp = {
            woloo: obj["id"],
            open_time: obj["opening_hours_2"],
            close_time: obj["closing_hours_2"],
          };
          openingHours_update.push(temp);
        }
        if (obj["opening_hours_3"]) {
          if (!time_Format.test(obj["opening_hours_3"])) {
            throw new Error(
              "Invalid opening_hours_3 . The time format is HH:MM:SS "
            );
          }
          if (!obj["closing_hours_3"])
            throw new Error("closing_hours_3 required");
          if (!time_Format.test(obj["closing_hours_3"])) {
            throw new Error(
              "Invalid closing_hours_3 . The time format is HH:MM:SS "
            );
          }
          let temp = {
            woloo: obj["id"],
            open_time: obj["opening_hours_3"],
            close_time: obj["closing_hours_3"],
          };
          openingHours_update.push(temp);
        }
        // console.log("------------------------------------------");
        // imple opening hour function
        // console.log("keys",keys,mapped_cols)
        for (let k in keys) {
          let key = keys[k];
          // console.log("mapped_cols[key]",mapped_cols[key])

          if (mapped_cols[key]) {
            // console.log("obj[key]",obj[key])
            if (obj[key]) {
              temp[key] = obj[key];
            }
            // } else if (rules.hasOwnProperty(key)) {
            //   const checkDefault = rules[key].hasOwnProperty("default");
            //   if (checkDefault) {
            //     temp[key] = rules[key]["default"];
            //   }
            // } else {
            //   temp[key] = "";
            // }
          }
        }
        mappedUpdateData.push(temp);
      }
    }

    //bulk Insert
    const data = mappedData.map((obj: any) => Object.values(obj));
    const dataLength = data.length;
    let finalarray = [];
    while (data.length) {
      finalarray.push(data.splice(0, 40));
    }
    const keysMap = mappedData?.length && Object.keys(mappedData[0]);
    let countRecord = 0;
    let InsertedwolooIds = [];
    for (let i = 0; i < finalarray.length; i++) {
      const result: any = await new Template().bulkInsert(
        tableName,
        finalarray[i],
        keysMap
      );
      InsertedwolooIds.push(result?.insertId);
      countRecord += result?.affectedRows;
    }

    //bulk Update
    const data_Update = mappedUpdateData.map((obj: any) => Object.values(obj));
    const data_Update_Length = data_Update.length;
    // console.log("MappedUpdateData: ", mappedUpdateData[0]);

    const keys_update_Map =
      mappedUpdateData?.length && Object.keys(mappedUpdateData[0]);
    let updatecountRecord = 0;
    let final_Update_array = [];
    let ids_: any = mappedUpdateData?.map((obj: any) => obj.id);

    while (data_Update.length) {
      final_Update_array.push(data_Update.splice(0, 40));
    }
    // console.log("final_Update_array: ", final_Update_array);
    // console.log("keys_update_Map: ", keys_update_Map);

    for (let i = 0; i < final_Update_array.length; i++) {
      const result: any = await new Template().bulkUpdate(
        tableName,
        final_Update_array[i],
        keys_update_Map,
        ids_
      );
      updatecountRecord = updatecountRecord + result;
      // console.log("result", result);
    }
    // }

    // Function to create new user for host
    async function createHostUser(data: any, wolooId: any) {
      let password = new Hashing().generatePassword();
      let userId = await Guest.createUser(
        data?.email,
        data?.mobile,
        data?.name,
        password,
        null,
        wolooId
      );

      if (userId) {
        const registrationPoint =
          await new SettingModel().getRegistartionPoint();
        const walletData = {
          user_id: userId,
          transaction_type: "CR",
          remarks: "Registration Point",
          value: registrationPoint[0]?.value,
          type: "Registration Point",
          is_gift: 0,
        };
        await new WalletModel().createWallet(walletData);
        let updateData = { user_id: userId };
        await new WolooHostModel().updateWolooHost(updateData, wolooId);
        sendWelcomeEmail(data.email, password); // Function to send a welcome email
        sendSMSNotification(data.mobile); // Function to send an SMS notification
      }
    }

    // Helper functions for sending email and SMS
    async function sendWelcomeEmail(email: string, password: string) {
      const __dirname = path.resolve();
      const filePath = path.join(
        __dirname,
        "/app/views/emailTemplate/index.html"
      );
      fs.readFile(filePath, "utf8", function (error: any, html: any) {
        if (error) throw error;
        html = html
          .replace("{{password}}", password)
          .replace("{{email}}", email);
        const mailData = {
          from: config.email.email,
          to: email,
          subject: "Woloo Host Credentials",
          text: "",
          attachments: [],
          html: html,
        };
        transporter.sendMail(
          mailData,
          function (err: any, info: { messageId: any }) {
            if (err) console.error("Failed to send Mail");
            else
              console.log({
                message: "Mail sent successfully",
                message_id: info.messageId,
              });
          }
        );
      });
    }

    async function sendSMSNotification(mobile: number) {
      let link = "http://bit.ly/487YPVM";
      let admin = "https://portal.woloo.in/sign-in";
      let message = `The Woloo host user has been created with the mobile number ${mobile},kindly download the App from ${link} and check if it is appearing in the map and also validate the other information.Also check your dashboard on Woloo Admin ${admin} -LOOM & WEAVER RETAIL PVT LTD`;
      let query = `where s.key ="site.host_creation_template_id"`;
      let tempId = await new WolooGuestModel().getSettingValue(query);
      const sendSms = await SMS.sendRaw(mobile, message, tempId[0].value);
      if (sendSms.smslist.sms.status === "success") {
        console.log("SMS sent successfully");
      } else {
        console.log("SMS failed");
      }
    }

    // Create new user for each host of the new sheet data
    for (let i = 0; i < mappedData.length; i++) {
      createHostUser(mappedData[i], InsertedwolooIds[i]);
    }

    // Create new user for each host of the update sheet data where user does not exist
    for (let i = 0; i < mappedUpdateData.length; i++) {
      const wolooId = mappedUpdateData[i]?.id;
      let isHostUserExist = await new WolooGuestModel().getHostUserByHostId(
        wolooId
      );
      if (isHostUserExist.length === 0) {
        createHostUser(mappedUpdateData[i], wolooId);
      }
    }

    //create user for each host
    // for (let i = 0; i < mappedData.length; i++) {
    // let password = new Hashing().generatePassword();

    // let userId = await Guest.createUser(
    //   mappedData?.[i]?.email,
    //   mappedData?.[i]?.mobile,
    //   mappedData?.[i]?.name,
    //   password,
    //   null,
    //   InsertedwolooIds[i]
    // );

    // if (userId) {
    //   var getRegistartionPoint =
    //     await new SettingModel().getRegistartionPoint();

    //   const walletdata = {
    //     user_id: userId,
    //     transaction_type: "CR",
    //     remarks: "Registration Point",
    //     value: getRegistartionPoint[0]?.value,
    //     type: "Registration Point",
    //     is_gift: 0,
    //   };
    //   await new WalletModel().createWallet(walletdata);

    //   let updateWolooData = {
    //     user_id: userId,
    //   };

    //   await new WolooHostModel().updateWolooHost(
    //     updateWolooData,
    //     InsertedwolooIds[i]
    //   );

    // const __dirname = path.resolve();
    // const filePath = path.join(
    //   __dirname,
    //   "/app/views/emailTemplate/index.html"
    // );
    // fs.readFile(filePath, "utf8", function (error: any, html: any) {
    //   if (error) {
    //     throw error;
    //   }

    //   html = html.replace("{{password}}", password);
    //   html = html.replace("{{email}}", mappedData?.[i]?.email);
    //   const mailData = {
    //     from: config.email.email,
    //     to: mappedData?.[i]?.email,
    //     subject: `Woloo Host Credentials`,
    //     text: ``,
    //     attachments: [],
    //     html: html,
    //   };

    //   transporter.sendMail(mailData, function (err: any, info: any) {
    //     if (err) console.log({ message: "Failed to send Mail" });
    //     else
    //       console.log({
    //         message: "Mail send ",
    //         message_id: info.messageId,
    //       });
    //   });
    // });
    // let link = "http://bit.ly/487YPVM";
    // let admin = "https://portal.woloo.in/sign-in";

    // let message = `The Woloo host user has been created with the mobile number ${mappedData?.[i]?.mobile},kindly download the App from ${link} and check if it is appearing in the map and also validate the other information.Also check your dashboard on Woloo Admin ${admin} -LOOM & WEAVER RETAIL PVT LTD`;

    // let query = `where s.key ="site.host_creation_template_id"`;
    // let tempId = await new WolooGuestModel().getSettingValue(query);
    // const sendSms = await SMS.sendRaw(
    //   mappedData?.[i]?.mobile,
    //   message,
    //   tempId[0].value
    // );
    // if (sendSms.smslist.sms.status == "success") {
    //   console.log("SMS sent successfully");
    // } else {
    //   console.log("SMS failed");
    // }
    // }
    // }

    // fs.unlinkSync(filePath);

    //Insert opening hour update
    // console.log("codes",codes,openingHours)
    const ids =
      codes?.length && (await new WolooHostModel().selectIdFromWoloos(codes));
    const openhourData = [];
    const openHoursKey = ["open_time", "close_time", "woloo_id"];
    if (ids?.length) {
      for (let i = 0; i < ids.length; i++) {
        const id = ids[i];
        const woloo = openingHours.filter((o: any) => {
          if (o.woloo == id.code) {
            o.id = id.id;
            return o;
          }
        });
        for (let p = 0; p < woloo.length; p++) {
          let values = Object.values(woloo[p]);
          values.shift();
          openhourData.push(values);
        }
      }
    }
    // console.log("openhourData", openhourData, openingHours);
    const result =
      openhourData?.length &&
      (await new Template().bulkInsert(
        "woloo_business_hours",
        openhourData,
        openHoursKey
      ));
    // console.log("openhourData",openhourData,openHoursKey)

    //opening hour update
    //  console.log("codes",codes,openingHours)
    let update_ids = [];
    if (ids_?.length) {
      // console.log("ids_",ids_)

      update_ids = await new WolooHostModel().selectIdandCodeFromId(ids_);
    }
    // console.log("update_ids", update_ids);
    const update_openhourData: any = [];
    const update_openHoursKey = ["open_time", "close_time", "woloo_id"];
    //  console.log("openingHours_update",openingHours_update,ids_)
    if (ids_?.length) {
      if (ids_?.length) {
        for (let i = 0; i < ids_.length; i++) {
          await new WolooHostModel().updateBusinessHour({ status: 0 }, ids_[i]);

          const woloo = openingHours_update.filter((o: any) => {
            if (o.woloo == ids_[i]) {
              o.id = ids_[i];
              return o;
            }
          });
          // console.log("woloo",woloo)
          for (let p = 0; p < woloo.length; p++) {
            let values = Object.values(woloo[p]);
            values.shift();
            update_openhourData.push(values);
          }
        }
      }
    }

    // console.log("update_openhourData", update_openhourData);
    const result2 =
      update_openhourData?.length &&
      (await new Template().bulkInsert(
        "woloo_business_hours",
        update_openhourData,
        update_openHoursKey
      ));

    //count
    const failedRecord = dataLength - countRecord;

    return {
      inserted: countRecord,
      failedRecord: failedRecord,
      updated: updatecountRecord,
    };
    // }
    // catch (error) {
    //   console.log("Error Bulk Upload: ", error);
    //   return { error: error };
    // }
  },
};
