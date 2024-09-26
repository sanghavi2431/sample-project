import _, { cloneDeep } from "lodash";
import { CorporateModel } from "../Models/Corporate.model";
import { WolooGuestModel } from "../Models/WolooGuest.model";

import { VoucherModel } from "../Models/Voucher.model";
import transporter from "../utilities/Email";
import Hashing from "../utilities/Hashing";
import Guest from "./CommonService/Guest";
import config from "../config";
import * as fs from 'fs';
import * as path from 'path';


const addCorporate = async (data: any) => {
  // let checkEmail = await new CorporateModel().checkEmail(data.email);
  // if (checkEmail.length != 0) return Error("Email already exist");


  // let checkMobile = await new CorporateModel().checkMobile(data.mobile);
  // if (checkMobile.length != 0) return Error("Mobile already exist");
  
  let checkEmail = await new WolooGuestModel().getUserByEmail(data.email);
  if (checkEmail.length != 0) return Error("User already exists with this Email.");

  let checkMobile = await new WolooGuestModel().getUserByMobile(data.mobile);
  if (checkMobile.length != 0) return Error("User already exists with this Mobile");

  data.status = 1;

  let corporates = await new CorporateModel().addCorporate(data);
  let password = new Hashing().generatePassword();

  if (corporates.affectedRows) {
    let userId = await Guest.createUser(data.email, data.mobile, data.contact_name, password, corporates.insertId, "")

    if (userId) {
      const __dirname = path.resolve();
      const filePath = path.join(__dirname, '/app/views/emailTemplate/index.html');
      fs.readFile(filePath, 'utf8', function (error: any, html: any) {
        if (error) {
          throw error;
        }
        html = html.replace("{{password}}", password);
        html = html.replace("{{email}}", data.email)
        const mailData = {
          from: config.email.email,
          to: data.email,
          subject: `Woloo Corporate Credentials`,
          text: ``,
          attachments: [],
          html: html
        };

        transporter.sendMail(mailData, function (err: any, info: any) {
          if (err)
            console.log({ message: "Failed to send Mail" })
          else
            console.log({ message: "Mail send ", message_id: info.messageId })
        })
      })
    }
  }

  if (!corporates) throw new Error("operation  failed");
  return { Response: "CORPORATE SUCCESSFULLY CREATED ! " };
};

const getAllCorporate = async (
  pageSize: any,
  pageIndex: any,
  sort: any,
  query: string
) => {
  try {
    let orderQuery: string;
    if (sort.key != "") {
      orderQuery = " ORDER BY " + sort.key + " " + sort.order + " ";
    } else {
      orderQuery = " ORDER BY id DESC";
    }

    let corporate = await new CorporateModel().getAllCorporate(
      pageSize,
      (pageIndex - 1) * pageSize,
      orderQuery,
      query
    );

    if (corporate.length < 1) return Error("details did not match");

    for (let obj of corporate) {
      obj.type =
        obj.type == "Public LTD"
          ? { label: "Public LTD", value: 1 }
          : { label: "Private LTD", value: -1 };

      (obj.mobile2 = obj.mobile2 ? obj.mobile2 : ""),
        (obj.status =
          obj.status == "1"
            ? { label: "ACTIVE", value: 1 }
            : { label: "INACTIVE", value: 0 });
    }

    return corporate;
  } catch (error: any) {
    return error;
  }
};

const deleteCorporatesById = async (id: any) => {
  let corporateStatus = await new CorporateModel()._executeQuery(
    "select id from corporates where id in (?) and status =1",
    [id]
  );
  if (corporateStatus.length < id.length)
    return new Error("Failed to delete, Corporate already inactive"
    );

  let voucher = await new VoucherModel()._executeQuery(
    "select id from voucher_codes where corporate_id = ?",
    [id]
  );

  if (voucher.length > 0)
    return new Error("Failed to delete corporate, Corporate active for voucher");

  let corporate = await new CorporateModel().deleteCorporatesById(id);
  if (!corporate) return Error("Record Not Found");
  return { Response: "CORPORATE DELETED SUCCESSFULLY" };
};

const getAllCorporateCount = async (query: any) => {
  let total = await new CorporateModel().getAllCorporateCount(query);

  return total[0].count;
};

const fetchCorporatesById = async (id: any) => {
  let corporate;

  corporate = await new CorporateModel().fetchCorporatesById(id);
  if (corporate.length < 1) return Error("Record Not Found  !");

  let {
    name,
    email,
    contact_name,
    mobile,
    mobile2,
    city,
    address,
    type,
    status,
  } = corporate[0];
  // @nullish

  return {
    name: name ?? null,
    email: email ?? null,
    contact_name: contact_name ?? null,

    mobile: mobile ?? null,
    mobile2: mobile2 ?? "",
    city: city ?? null,
    address: address ?? null,
    status:
      status == "1"
        ? { label: "ACTIVE", value: 1 }
        : { label: "INACTIVE", value: 0 },
    type:
      type == "Public LTD"
        ? { label: "Public LTD", value: 1 }
        : { label: "Private LTD", value: -1 },
  };
};

const deleteCorporatesByMultiId = async (id: any) => {
  let corporateStatus = await new CorporateModel()._executeQuery(
    "select id from corporates where id in (?) and status =1",
    [id]
  );
  if (corporateStatus.length < id.length)
    return Error("Failed to delete, Corporate already inactive");
  let voucher = await new VoucherModel()._executeQuery(
    "select id from voucher_codes where corporate_id in (?)",
    [id]
  );

  if (voucher.length > 0)
    return Error("Failed to delete corporate, Corporate active for voucher");
  let corporate = await new CorporateModel().deleteCorporatesByMultiId(id);

  if (!corporate) return Error("details did not match");
  return { Response: "CORPORATES DELETED SUCCESSFULLY" };
};

const updateCorporate = async (req: any) => {
  try {
    // @ts-ignore
    let checkEmail = await new CorporateModel().checkEmail(req.body.email);
    let corporateStatus = (await new CorporateModel().fetchCorporatesById(req.body.id))[0];
    // if (corporateStatus.status == 0)
    // throw new Error("Failed to delete, Corporate already inactive");
    let voucher = await new VoucherModel()._executeQuery(
      "select id from voucher_codes where corporate_id = ?",
      [req.body.id]
    );
    if (req.body.status == 0 && voucher.length > 0)
      throw new Error("Failed to delete corporate, Corporate active for voucher");
    let corporate = await new CorporateModel().updateCorporate(
      req.body,
      req.body.id
    );

    if (corporate.affectedRows == 0)
      return Error("Record Not Found for given ID !");

    return { Response: "CORPORATE SUCCESSFULLY UPDATED !" };
  } catch (e) {
    throw e;
  }
};

export default {
  addCorporate,
  getAllCorporate,
  deleteCorporatesById,
  getAllCorporateCount,
  fetchCorporatesById,
  deleteCorporatesByMultiId,
  updateCorporate,
};
