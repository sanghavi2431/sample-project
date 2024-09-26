import moment from "moment";
import { WolooGuestModel } from "./../Models/WolooGuest.model";
import { SubscriptionModel } from "../Models/Subscription.model";
import parsePhoneNumber from "libphonenumber-js";

const { v4: uuidv4 } = require("uuid");
import { WolooOTP } from "../Models/WolooOTP.model";
import LOGGER from "../config/LOGGER";
import Encryption from "../utilities/Encryption";
import SMS from "../utilities/SMS";
import formidable from "formidable";
import { uploadFile } from "../utilities/S3Bucket";
import envconfig from "../Constants/application";
import Hashing from "../utilities/Hashing";
import config from "../config";
import nodemailer from "nodemailer";
import common from "../utilities/common";
import { cloneDeep, constant, isDate } from "lodash";
import { WolooHostModel } from "../Models/WolooHost.model";
import { WalletModel } from "../Models/Wallet.model";
import { isEmpty } from "lodash";
import Guest from "./CommonService/Guest";
import dayjs from "dayjs";
import _constant from "../Constants/common";
import Constants from "../Constants/common";
import axios from "axios";
const ejs = require("ejs");
import transporter from "../utilities/Email";
import { emailTemplate } from "../email-template";
import { RedisClient } from "../utilities/redisClient";
const redisClient = require("../utilities/redisClient");

const createGuestOTP = async (
  mobile: number,
  referral_code: any,
  woloo_id: any
) => {
  try {
    const otp = Math.floor(1000 + Math.random() * 9000);
    console.log("OTP: ", otp);
    let user = await new WolooGuestModel().getWolooGuestByMobile(mobile);
    if (user.length === 0) {
      user.id = await Guest.createGuest(mobile, 0, null, null);
      console.log("User Id Create OTP ", user.id);
    } else {
      user = user[0];
      if (!user.is_first_session || user.is_first_session == 1) {
        await new WolooGuestModel().updateWolooGuest(
          { is_first_session: 0 },
          user.id
        );
      }
    }
    if (referral_code) {
      let query = `where ref_code='${referral_code}'`;
      let referred_by = await new WolooGuestModel().findUser(query);
      let key = "site.referral_point";
      let referral_point = await new WolooGuestModel().getSettings(key);
      // console.log("Referred Data", referred_by)
      if (referred_by.length) {
        await new WolooGuestModel().updateWolooGuest(
          { sponsor_id: referred_by[0].id },
          user.id
        );
        let data: any = {};
        data.transaction_type = "CR";
        data.value = referral_point[0].value;
        data.type = "Referral Point";
        data.remarks = `Referred by ${referred_by[0].name}`;
        data.user_id = referred_by[0].id;
        await new WalletModel().createWallet(data);
      }
    }
    if (woloo_id) {
      let query = `where woloo_id=${woloo_id}`;
      let referred_by = await new WolooGuestModel().findUser(query);
      let key = "site.referral_point";
      let referral_point = await new WolooGuestModel().getSettings(key);
      // console.log("Referred Data", referred_by)
      if (referred_by.length) {
        await new WolooGuestModel().updateWolooGuest(
          { sponsor_id: referred_by[0].id },
          user.id
        );
        let data: any = {};
        data.transaction_type = "CR";
        data.value = referral_point[0].value;
        data.type = "Referral Point";
        data.remarks = `Referred by ${referred_by[0].name}`;
        data.user_id = referred_by[0].id;
        await new WalletModel().createWallet(data);
      }
    }
    let data: any = {
      otp: mobile == 9657922345 ? 3257 : otp,
      user_id: user.id,
      req_id: uuidv4(),
      expire_time: moment().add(1440, "minutes").format("YYYY-MM-DD HH:mm:ss"),
      trials: 3,
    };
    LOGGER.info("Data before create otp", data);
    const otp_details = await new WolooOTP().createOTP(data);
    //Send SMS
    // const message =
    //   "Dear User, Your One Time Password for login is " +
    //   data.otp +
    //   ". Put this OTP and press submit. Please do not share the OTP with anyone. In case you have not initiated this request please contact our helpdesk athelpdesk@woloo.in Best Regards, WolooTeam XXXX";

    // const message =  "Dear User, Your OTP for login is " +data.otp +
    // ". Enter this OTP and press submit. Please do not share the OTP with anyone. For any issue contact our helpdesk info@woloo.in.";

    const message = `Dear User,
    Your OTP for login is ${data.otp}. Please do not share the OTP with anyone. For any issue contact our helpdesk at info@woloo.in
    www.woloo.in`;
    const sendSms = await SMS.send(mobile, data.otp, message, data.req_id);
    console.log("SMS REPORT ", sendSms);
    //LOGGER.info("SMS OTP STATUS:",sendSms);
    LOGGER.info("create Otp result", otp_details);
    return { request_id: data.req_id };
  } catch (e) {
    console.log("Error SendOTP", e);
    return e;
  }
};

const createOTPForHost = async (mobile: number) => {
  // try {
  //   // Fetch user details by mobile number
  //   const user = await new WolooGuestModel().getWolooGuestByMobile(mobile);

  //   // Check if user exists
  //   if (!user.length) throw new Error("Mobile number is not registered with any user");
  //   if (user[0]?.role_id != 9) throw new Error("Only host user can accecss this api");

  //   // Generate OTP
  //   const otp = Math.floor(1000 + Math.random() * 9000);

  //   // Prepare data for OTP and Redis storage
  //   const data = {
  //     otp: otp,
  //     user_id: user[0].id,
  //     req_id: uuidv4(),
  //     expire_time: moment().add(15, "minutes").format("YYYY-MM-DD HH:mm:ss"),
  //     trials: 3,
  //   };

  //   // Store data in Redis
  //   await RedisClient.getInstance().setEx(`${mobile}`, 900, JSON.stringify(data));

  //   // Log data before creating OTP
  //   LOGGER.info("Data before creating OTP", data);

  //   // Compose SMS message
  //   const message = `Dear User,
  //   Your OTP for login is ${data.otp}. Please do not share the OTP with anyone. For any issues, contact our helpdesk at info@woloo.in
  //   www.woloo.in`;

  //   // Send SMS with OTP
  //   const sendSms = await SMS.send(mobile, data.otp, message, data.req_id);
  //   console.log("SMS REPORT ", sendSms);

  //   // Return request ID associated with OTP
  //   return { request_id: data.req_id, expiry_time: "15 Min" };
  // } catch (error: any) {
  //   console.error("Error in sending OTP:", error);
  //   return { error: error.message };
  // }

  try {
    let user = await new WolooGuestModel().getWolooGuestByMobile(mobile);

    // Check if user exists
    if (!user.length)
      throw new Error("Mobile number is not registered with any user");
    if (user[0]?.role_id != 9)
      throw new Error("Only host user can accecss this api");

    const otp = Math.floor(1000 + Math.random() * 9000);
    // console.log(otp, " :OTP for host");

    let getOtpExpiry = await new WolooGuestModel().getOtpExpiryFromSettings();
    let data: any = {
      otp: otp,
      user_id: user.id,
      req_id: uuidv4(),
      expire_time: moment()
        .add(getOtpExpiry[0].value, "minutes")
        .format("YYYY-MM-DD HH:mm:ss"),
      trials: 3,
    };
    LOGGER.info("Data before create otp", data);
    const otp_details = await new WolooOTP().createOTP(data);

    const message = `Dear User,
    Your OTP for login is ${data.otp}. Please do not share the OTP with anyone. For any issue contact our helpdesk at info@woloo.in
    www.woloo.in`;

    const sendSms = await SMS.send(mobile, data.otp, message, data.req_id);
    console.log("SMS REPORT ", sendSms);
    //LOGGER.info("SMS OTP STATUS:",sendSms);
    LOGGER.info("create Otp result", otp_details);

    const otp_expiry_in_minutes = await new WolooGuestModel().getSettings(
      "site.otp_expiry_in_minutes"
    );
    console.log(
      "otp_expiry_in_minutes*60",
      +otp_expiry_in_minutes?.[0]?.value * 60
    );

    return {
      request_id: data.req_id,
      expiry_time: +otp_expiry_in_minutes?.[0]?.value
        ? +otp_expiry_in_minutes?.[0]?.value * 60
        : 60,
    };
  } catch (e) {
    console.log("Error SendOTP", e);
    return e;
  }
};

const verifyHostOTP = async (data: any) => {
  // Fetch OTP details from Redis
  // try {
  //   const otpDetailsString: string | null | Buffer = await RedisClient.getInstance().getEx(`${data.mobileNumber}`, 900);
  //   console.log("otpDetailsString", otpDetailsString)
  //   if (!otpDetailsString) throw new Error("OTP details not found or expired");

  //   let otpDetails: {
  //     otp: number;
  //     req_id: string;
  //     expire_time: string;
  //     trials: number;
  //   };

  //   if (typeof otpDetailsString === 'string') {
  //     otpDetails = JSON.parse(otpDetailsString);
  //   } else {
  //     otpDetails = JSON.parse(otpDetailsString.toString('utf-8'));
  //   }

  //   if (otpDetails.otp != data.otp) throw new Error("Incorrect OTP");

  //   let now = moment().format("YYYY-MM-DD HH:mm:ss");
  //   let expire_time = moment(otpDetails.expire_time).format("YYYY-MM-DD HH:mm:ss")
  //     .toString();

  //   console.log("..........now.", now,)
  //   console.log("..........expire_time.", expire_time)

  //   if ((expire_time <= now)) throw new Error("OTP expired");

  //   //Check if there are no more trials left
  //   if (otpDetails.trials <= 0) throw new Error("No more trials left");

  //   let user = await new WolooGuestModel().getUserByMobileNumber(data);
  //   if (!user.length) throw new Error("User does not exist");

  //   let token = await Encryption.generateJwtToken({
  //     id: user[0].id
  //   });
  //   LOGGER.info("LOGIN SUCCESSFULL");
  //   user[0].token = token

  //   return user
  // } catch (error) {
  //   return error;
  // }

  try {
    let otp_details = await new WolooOTP().getOtp(data);
    if (otp_details.length === 0) throw new Error("Error in login");
    if (otp_details[0].trials <= 0) throw new Error("No more trials");
    //console.log("ISO Check otp - >>>", parseInt(data.otp), otp_details[0].otp, parseInt(data.otp) !== otp_details[0].otp)
    if (parseInt(data.otp) != otp_details[0].otp) {
      otp_details[0].trials = otp_details[0].trials - 1;
      await new WolooOTP().updateTrials(
        otp_details[0].req_id,
        otp_details[0].trials
      );
      throw new Error("Incorrect OTP ");
    }
    let now = moment().format("YYYY-MM-DD HH:mm:ss");

    let expire_time = moment(otp_details[0].expire_time)
      .format("YYYY-MM-DD HH:mm:ss")
      .toString();
    if (!(expire_time >= now)) throw new Error("OTP expired");

    let user = await new WolooGuestModel().getUserByMobileNumber(data);
    if (!user.length) throw new Error("User does not exist");

    let token = await Encryption.generateJwtToken({
      id: user[0].id,
      role_id: user[0].role_id,
    });
    const CoinsData = await new WolooGuestModel().CoinsData(user[0].id);
    const totalCoins = CoinsData[0].Credit - CoinsData[0].Debit;
    user[0].token = token;
    user[0].totalCoins = totalCoins;

    LOGGER.info("LOGIN SUCCESSFULL");
    return user;
  } catch (error) {
    return error;
  }
};

const verifyGuestOTP = async (data: any) => {
  try {
    let otp_details = await new WolooOTP().getOtp(data);
    if (otp_details.length === 0) throw new Error("Error in login");
    if (otp_details[0].trials <= 0) throw new Error("No more trials");
    //console.log("ISO Check otp - >>>", parseInt(data.otp), otp_details[0].otp, parseInt(data.otp) !== otp_details[0].otp)
    if (parseInt(data.otp) != otp_details[0].otp) {
      otp_details[0].trials = otp_details[0].trials - 1;
      await new WolooOTP().updateTrials(
        otp_details[0].req_id,
        otp_details[0].trials
      );
      throw new Error("Incorrect OTP ");
    }
    let now = moment().format("YYYY-MM-DD HH:mm:ss");
    let expire_time = moment(otp_details[0].expire_time)
      .utc()
      .format("YYYY-MM-DD HH:mm:ss")
      .toString();
    if (!(expire_time >= now)) throw new Error("OTP expired");
    const user = await new WolooGuestModel().getWolooGuestById(
      otp_details[0].user_id
    );
    console.log("OTP Verify Details ", otp_details[0]);
    otp_details[0].token = await Encryption.generateJwtToken({
      id: otp_details[0].user_id,
    });
    LOGGER.info("LOGIN SUCCESSFULL");
    for (let u in user[0]) {
      if (
        u == "subscription_id" ||
        u == "fb_id" ||
        u == "gp_id" ||
        u === "sponsor_id" ||
        u == "woloo_id" ||
        u == "gift_subscription_id" ||
        u == "status" ||
        u == "settings" ||
        u == "thirst_reminder_hours" ||
        u == "voucher_id" ||
        u == "IsVtionUser"
      ) {
        let value = user[0][u];
        if (value || value == 0) {
          user[0][u] = value.toString();
        }
      }
    }
    user[0]["role_id"] = null;
    if (
      !user[0]["voucher_id"] &&
      Date.parse(user[0].expiry_date) > Date.now()
    ) {
      user[0].isFreeTrial = 1;
    } else {
      user[0].isFreeTrial = 0;
    }

    return {
      user: user[0],
      token: otp_details[0].token,
      user_id: otp_details[0].user_id,
    };
  } catch (error) {
    return error;
  }
};

const fetchAllWolooGuest = async (
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

    let user = await new WolooGuestModel().getWolooGuest(
      pageSize,
      (pageIndex - 1) * pageSize,
      orderQuery,
      query
    );

    if (user.length < 1) return Error("details did not match");

    for (let obj of user) {
      obj.role_id = obj.role_id ? obj.role_id : "";
      (obj.base_url = config.s3imagebaseurl),
        (obj.name = obj.name ? obj.name : null);
      obj.email = obj.email ? obj.email : null;
      delete obj["password"];

      obj.remember_token = obj.remember_token ? obj.remember_token : null;
      obj.mobile = obj.mobile ? Number(obj.mobile) : null;
      obj.city = obj.city ? obj.city : null;
      obj.pincode = obj.pincode ? Number(obj.pincode) : null;
      obj.address = obj.address ? obj.address : null;
      obj.avatar = obj.avatar ? obj.avatar : null;
      obj.fb_id = obj.fb_id ? obj.fb_id : null;
      obj.gp_id = obj.gp_id ? obj.gp_id : null;
      obj.ref_code = obj.ref_code ? obj.ref_code : null;
      obj.sponsor_id = obj.sponsor_id ? obj.sponsor_id : null;
      obj.woloo_id = obj.woloo_id ? obj.woloo_id : null;
      obj.subscription_id = obj.subscription_id ? obj.subscription_id : null;
      obj.expiry_date = obj.expiry_date
        ? moment(obj.expiry_date).utc().format("YYYY-MM-DD")
        : "";

      obj.voucher_id = obj.voucher_id ? obj.voucher_id : null;
      obj.gift_subscription_id = obj.gift_subscription_id
        ? obj.gift_subscription_id
        : null;

      obj.lat = obj.lat ? Number(obj.lat) : null;

      obj.lng = obj.lng ? Number(obj.lng) : null;

      obj.otp = obj.otp ? obj.otp : null;
      obj.status = obj.status
        ? { label: "ACTIVE", value: 1 }
        : { label: "INACTIVE", value: 0 };
      obj.settings = obj.settings ? obj.settings : null;

      obj.created_at = obj.created_at
        ? moment(obj.created_at).utc().format("YYYY-MM-DD")
        : moment(Date.now()).utc().format("YYYY-MM-DD");

      obj.updated_at = obj.updated_at
        ? moment(obj.updated_at).utc().format("YYYY-MM-DD")
        : moment(Date.now()).utc().format("YYYY-MM-DD");
      obj.deleted_at = obj.deleted_at
        ? moment(obj.deleted_at).utc().format("YYYY-MM-DD")
        : null;

      (obj.gender =
        obj.gender == "Male"
          ? { label: "Male", value: 1 }
          : obj.gender == "Female"
          ? { label: "Female", value: -1 }
          : { label: "Other", value: 0 }),
        (obj.is_first_session = obj.is_first_session
          ? obj.is_first_session
          : 1);

      obj.dob = obj.dob ? obj.dob : null;
      obj.is_thirst_reminder = obj.is_thirst_reminder
        ? obj.is_thirst_reminder
        : 0;
      obj.thirst_reminder_hours = obj.thirst_reminder_hours
        ? obj.thirst_reminder_hours
        : null;
      obj.is_blog_content_notification = obj.is_blog_content_notification
        ? obj.is_blog_content_notification
        : 0;
    }

    return user;
  } catch (error: any) {
    return error;
  }
};

const fetchWolooGuestCount = async (query: any) => {
  let total = await new WolooGuestModel().getWolooGuestCount(query);

  return total[0].count;
};

const fetchWolooGuestById = async (id: any) => {
  let user = await new WolooGuestModel().getWolooGuestById(id);
  let roles = await new WolooGuestModel().getRoles();

  if (user.length < 1) return Error("Invalid User Id  !");
  let {
    role_id,
    name,
    email,
    remember_token,
    mobile,
    city,
    pincode,
    address,
    avatar,
    fb_id,
    gp_id,
    ref_code,
    sponsor_id,
    woloo_id,
    subscription_id,
    expiry_date,
    voucher_id,
    gift_subscription_id,
    lat,
    lng,
    otp,
    status,
    settings,
    created_at,
    updated_at,
    deleted_at,
    gender,
    is_first_session,
    dob,
    is_thirst_reminder,
    thirst_reminder_hours,
    is_blog_content_notification,
  } = user[0];

  const selectedRole = roles.filter((r: any) => {
    return r.id == role_id;
  });
  let roleObj: any = { label: "", value: "" };
  role_id
    ? ((roleObj["label"] = selectedRole[0].display_name),
      (roleObj["value"] = role_id))
    : "";

  return {
    id,
    role: roleObj,
    base_url: config.s3imagebaseurl,
    name: name ?? null,
    email: email ?? null,

    remember_token: remember_token ?? null,
    mobile: Number(mobile) ?? null,
    city: city ?? null,
    pincode: Number(pincode) ?? null,
    address: address ?? null,
    avatar: avatar ?? null,
    fb_id: fb_id ?? null,
    gp_id: gp_id ?? null,
    ref_code: ref_code ?? null,
    sponsor_id: sponsor_id ?? null,
    woloo_id: woloo_id ?? null,
    subscription_id: subscription_id ?? null,
    expiry_date: expiry_date ?? null,
    voucher_id: voucher_id ?? null,
    gift_subscription_id: gift_subscription_id ?? null,
    lat: Number(lat) ?? null,
    lng: Number(lng) ?? null,
    otp: otp ?? null,
    status: status
      ? { label: "ACTIVE", value: 1 }
      : { label: "INACTIVE", value: 0 },
    settings: settings ?? null,

    created_at:
      created_at == null && isDate(created_at)
        ? created_at
        : moment(Date.now()).utc().format("YYYY-MM-DD"),
    updated_at:
      updated_at == null && isDate(updated_at)
        ? updated_at
        : moment(Date.now()).utc().format("YYYY-MM-DD"),
    deleted_at: deleted_at == null && isDate(deleted_at) ? deleted_at : 0,

    gender:
      gender == "Male"
        ? { label: "Male", value: 1 }
        : gender == "Female"
        ? { label: "Female", value: -1 }
        : { label: "Other", value: 0 },

    is_first_session: is_first_session ?? 1,
    dob: dob ?? null,

    is_thirst_reminder: is_thirst_reminder ?? 0,
    thirst_reminder_hours: thirst_reminder_hours ?? null,
    is_blog_content_notification: is_blog_content_notification ?? 0,
  };
};

const deleteWolooGuestById = async (id: any) => {
  let user = await new WolooGuestModel().deleteWolooGuestById(id);

  if (user.affectedRows == 0) return Error("User Not Found  !");
  return { Response: "USER DELETED SUCCESSFULLY" };
};
const updateDeviceToken = async (req: any) => {
  const deviceSerial: number = req.body.deviceSerial;
  const deviceToken = req.body.deviceToken;
  const userId = req.session.id;
  let isDeviceExists = await new WolooGuestModel().isDeviceExists(deviceSerial);
  if (!isDeviceExists.length) {
    let data = {
      device_serial: deviceSerial,
      device_id: deviceToken,
      user_id: userId,
    };
    let insertDeviceDetails = await new WolooGuestModel().insertDeviceDetails(
      data
    );
    if (insertDeviceDetails.affectedRows == 0)
      return Error("Error occured while updating token");
    return {
      message: "Device token updated successfully !",
    };
  } else {
    isDeviceExists = isDeviceExists[0];
    let id = isDeviceExists.id;
    isDeviceExists.device_id = deviceToken;
    let updateDeviceDetails = await new WolooGuestModel().updateDeviceDetails(
      isDeviceExists,
      id
    );
    if (updateDeviceDetails.affectedRows == 0)
      return Error("Error occured while updating token");
    return {
      message: "Device token updated successfully !",
    };
  }
};

const deleteWolooGuestByMultiId = async (id: any) => {
  let user = await new WolooGuestModel().deleteWolooGuestByMultiId(id);

  if (!user) throw new Error("details did not match");
  return { Response: "USER DELETED SUCCESSFULLY" };
};

const createWolooGuest = async (req: any) => {
  try {
    let wolooUserData, s3Path, response: any, fields: any, files: any;
    // @ts-ignore
    response = await processWolooGuestForm(req);
    if (response instanceof Error) throw response;
    fields = response.fields;
    s3Path = response.s3Path;
    let checkEmail = await new WolooGuestModel().checkEmail(fields.email);

    let WolooUser: any = {};
    if (checkEmail.length != 0) throw new Error("Email Already Exist !");

    let checkMobile = await new WolooGuestModel().getUserByMobile(
      fields.mobile
    );
    if (checkMobile.length != 0) throw new Error("Mobile Already Exist !");

    WolooUser.role_id = fields.role_id;

    if (!fields.name) throw new Error("Please enter your name");
    WolooUser.name = fields.name;

    if (!fields.email) throw new Error("Please enter your email");
    WolooUser.email = fields.email;

    // let password = "password";
    let hash = await new Hashing().generateHash(fields.password, 12);

    WolooUser.password = hash;

    if (!fields.mobile) throw new Error("Please enter your mobile");
    WolooUser.mobile = fields.mobile;

    if (!fields.city) throw new Error("Please enter your city");
    WolooUser.city = fields.city;

    if (!fields.pincode) throw new Error("Please enter your pincode");

    WolooUser.pincode = fields.pincode;

    if (!fields.dob) throw new Error("Please enter your DOB");

    WolooUser.dob = fields.dob;

    if (!fields.gender) throw new Error("gender field required");
    if (fields.gender == "Male") {
      WolooUser.gender = "Male";
    }
    if (fields.gender == "Female") {
      WolooUser.gender = "Female";
    }
    if (fields.gender == "Other") {
      WolooUser.gender = "Other";
    }

    if (fields.address) WolooUser.address = fields.address;

    if (fields.fb_id) WolooUser.fb_id = fields.fb_id;
    if (fields.gp_id) WolooUser.gp_id = fields.gp_id;
    if (fields.ref_code) WolooUser.ref_code = fields.ref_code;
    if (fields.sponsor_id) WolooUser.sponsor_id = fields.sponsor_id;
    if (fields.woloo_id) WolooUser.woloo_id = fields.woloo_id;
    if (fields.subscription_id)
      WolooUser.subscription_id = fields.subscription_id;
    if (fields.expiry_date) WolooUser.expiry_date = fields.expiry_date;
    if (fields.voucher_id) WolooUser.voucher_id = fields.voucher_id;
    if (fields.gift_subscription_id)
      WolooUser.gift_subscription_id = fields.gift_subscription_id;
    if (fields.lat) WolooUser.lat = fields.lat;
    if (fields.lng) WolooUser.lng = fields.lng;
    if (fields.otp) WolooUser.otp = fields.otp;
    WolooUser.status = 1;
    if (fields.settings) WolooUser.settings = fields.settings;
    if (fields.deleted_at) WolooUser.deleted_at = fields.deleted_at;

    if (fields.is_first_session)
      WolooUser.is_first_session = fields.is_first_session;

    if (fields.is_thirst_reminder)
      WolooUser.is_thirst_reminder = fields.is_thirst_reminder;

    if (fields.thirst_reminder_hours)
      WolooUser.thirst_reminder_hours = fields.thirst_reminder_hours;

    if (s3Path[0]) WolooUser.avatar = s3Path;

    if (fields.is_blog_content_notification)
      WolooUser.is_blog_content_notification =
        fields.is_blog_content_notification;

    wolooUserData = await new WolooGuestModel().createWolooGuest(WolooUser);
    if (!wolooUserData) throw new Error("Registration  failed");

    return { Response: "USER CREATED SUCCESSFULLY" };
  } catch (e) {
    throw e;
  }
};

const processWolooGuestForm = async (req: any) => {
  let s3Path: any = [];

  const form = new formidable.IncomingForm();
  return new Promise((resolve, reject) => {
    form.parse(req, async (err: any, fields: any, files: any) => {
      try {
        const images: any = files.avatar;
        if (images) {
          const imageName =
            moment().unix() + "." + images.originalFilename.split(".").pop();

          let name: string = "Images/" + "WolooGuest" + "/" + imageName;

          const result = await uploadFile(images, name);

          if (result == 0 && result == undefined)
            throw new Error("file upload to s3 failed");

          s3Path.push(result.key);
        }

        resolve({ fields: fields, s3Path: s3Path });
      } catch (e) {
        throw e;
      }
    });
  });
};

const updateWolooGuest = async (req: any) => {
  try {
    let wolooUserData,
      aadharUrlPath,
      panUrlPath,
      s3Path,
      response: any,
      fields: any,
      files: any;
    // @ts-ignore

    response = await updateWolooGuestForm(req);
    if (response instanceof Error) throw response;

    fields = response.fields;
    s3Path = response.s3Path;

    aadharUrlPath = response.aadharUrlPath;
    panUrlPath = response.panUrlPath;
    let WolooUser: any = {};
    let id = fields.id;
    let getUserByID = await new WolooGuestModel().getUserByID(id);
    if (!getUserByID) return Error("User Not Found!");
    let isEmailExist = await new WolooGuestModel().isEmailExist(
      fields.email,
      id
    );

    if (isEmailExist.length)
      return Error("Email id is already associated with another user!");

    if (fields.name) WolooUser.name = fields.name;
    if (fields.email) WolooUser.email = fields.email;
    if (fields.mobile) WolooUser.mobile = fields.mobile;
    if (fields.status) WolooUser.status = fields.status;
    if (fields.role_id) WolooUser.role_id = fields.role_id;
    if (fields.city) WolooUser.city = fields.city;
    if (fields.address) WolooUser.address = fields.address;
    if (fields.pincode) WolooUser.pincode = fields.pincode;
    if (fields.lat) WolooUser.lat = fields.lat;
    if (fields.state) WolooUser.state = fields.state;
    if (fields.lng) WolooUser.lng = fields.lng;
    if (fields.gender) WolooUser.gender = fields.gender;
    if (fields.dob) WolooUser.dob = fields.dob;
    if (fields.IsVtionUser === "1") {
      WolooUser.IsVtionUser = fields.IsVtionUser;
      const setting = await new WolooGuestModel().getSettings(
        "site.free_trial_period_days_for_vtion_users"
      );
      const exp_date = new Date(Date.now());
      exp_date.setDate(exp_date.getDate() + Number(setting[0].value));
      WolooUser.expiry_date = new Date(exp_date).toISOString().split("T")[0];
    }
    if (s3Path[0]) {
      WolooUser.avatar = s3Path;
    }
    if (aadharUrlPath[0]) {
      WolooUser.aadhar_url = aadharUrlPath;
    }
    if (panUrlPath[0]) {
      WolooUser.pan_url = panUrlPath;
    }
    wolooUserData = await new WolooGuestModel().updateWolooGuest(WolooUser, id);
    if (wolooUserData.affectedRows == 0) return Error("User Not Found!");
    getUserByID = await new WolooGuestModel().getUserByID(id);
    getUserByID.base_url = config.s3imagebaseurl;
    delete getUserByID.password;
    return {
      message: " Sucessfully Updated !",
      userData: getUserByID,
    };
  } catch (e) {
    throw e;
  }
};

const updateWolooGuestForm = async (req: any) => {
  let s3Path: any = [];
  let aadharUrlPath: any = [];
  let panUrlPath: any = [];

  const form = new formidable.IncomingForm();
  return new Promise((resolve, reject) => {
    form.parse(req, async (err: any, fields: any, files: any) => {
      try {
        if (files && files.avatar) {
          let images: any = files.avatar;

          const uploadImage = async (image: any) => {
            const imageName =
              moment().unix() + "." + image.originalFilename.split(".").pop();
            let name: string = "Images/" + "avatar" + "/" + imageName;

            const result = await uploadFile(image, name);
            if (result == 0 && result == undefined)
              throw new Error("file upload to s3 failed");

            s3Path.push(result.key);
          };
          if (images.length == undefined) {
            await uploadImage(images);
          } else {
            for (let i = 0; i < images.length; i++) {
              await uploadImage(images[i]);
            }
          }
        }

        if (files && files.aadhar_url) {
          let aadharUrl: any = files.aadhar_url;

          const uploadAadhar = async (image: any) => {
            const imageName =
              moment().unix() + "." + image.originalFilename.split(".").pop();
            let name: string = "Images/" + "aadhar_url" + "/" + imageName;
            console.log("images", imageName);
            const result = await uploadFile(image, name);

            if (result == 0 && result == undefined)
              throw new Error("file upload to s3 failed");

            aadharUrlPath.push(result.key);
          };
          if (aadharUrl.length == undefined) {
            await uploadAadhar(aadharUrl);
          } else {
            for (let i = 0; i < aadharUrl.length; i++) {
              await uploadAadhar(aadharUrl[i]);
            }
          }
        }

        if (files && files.pan_url) {
          let panUrl: any = files.pan_url;

          const uploadPan = async (image: any) => {
            const imageName =
              moment().unix() + "." + image.originalFilename.split(".").pop();
            let name: string = "Images/" + "pan_url" + "/" + imageName;

            const result = await uploadFile(image, name);

            if (result == 0 && result == undefined)
              throw new Error("file upload to s3 failed");

            panUrlPath.push(result.key);
          };
          if (panUrl.length == undefined) {
            await uploadPan(panUrl);
          } else {
            for (let i = 0; i < panUrl.length; i++) {
              await uploadPan(panUrl[i]);
            }
          }
        }

        resolve({
          fields: fields,
          s3Path: s3Path,
          aadharUrlPath: aadharUrlPath,
          panUrlPath: panUrlPath,
        });
      } catch (e) {
        throw e;
      }
    });
  });
};

async function login(data: any) {
  try {
    let user = await new WolooGuestModel().getUser(data);
    if (user.length == 0) throw new Error("Invalid credentials");
    // if (user[0].role_id != 1) throw new Error("Only admin can login here");
    //password bcrypt

    const match = await new Hashing().verifypassword(
      data.password,
      user[0].password
    );

    if (!match) throw new Error("Invalid password");

    const token = await Encryption.generateJwtToken({
      id: user[0].id,
      role_id: user[0].role_id,
    });
    user[0].token = token;
    delete user[0].password;
    // delete user[0].role_id;
    // delete user[0].email;
    // delete user[0].id;

    return user;
  } catch (e) {
    return e;
  }
}
const appConfigGet = async (packageName: string, platform: string) => {
  if (
    packageName == envconfig.env.APP_PACKAGE_NAME ||
    packageName == envconfig.env.APP_PACKAGE_NAME_IOS
  ) {
    const getAppConfig = await new WolooGuestModel();
    let result;
    if (platform === "ios" || platform === "android") {
      result = await getAppConfig.getConfiguration(packageName);
      const finalResponse = common.mapConfigData(result);
      let free_trial_period_days = await getAppConfig.getSettings(
        "site.free_trial_period_days"
      );
      let near_by_all_radius = await getAppConfig.getSettings(
        "site.near_by_all_radius"
      );
      finalResponse.free_trial_period_days = free_trial_period_days[0].value;
      finalResponse.free_trial_text = "FREE TRIAL";
      finalResponse.near_by_all_radius = near_by_all_radius[0].value;
      if (finalResponse.CUSTOM_MESSAGE.inviteFriendText)
        finalResponse.CUSTOM_MESSAGE.inviteFriendText =
          finalResponse.CUSTOM_MESSAGE.inviteFriendText.replace(/&/g, "and");
      return finalResponse;
    }
    throw new Error("Invalid Platform");
  }
  throw new Error("Invalid Package Name");
};

const fetchSubscriptionDetails: any = async (subscription_id: any) => {
  let planData: any =
    await new SubscriptionModel().fetchSubscriptionDetailsById(subscription_id);

  if (planData.length == 0) {
    return {
      is_expired: 0,
      is_voucher: 0,
      price_with_gst: null,
      status: 0,
      apple_product_id: null,
      strike_out_price: null,
      start_at: null,
      image: null,
      days: "0",
      updated_at: null,
      is_recommended: null,
      currency: null,
      backgroud_color: null,
      discount: "0",
      end_at: null,
      is_cancel: null,
      name: null,
      shield_color: null,
      plan_id: null,
      apple_product_price: null,
      id: null,
      deleted_at: null,
      insurance_desc: null,
      created_at: null,
      frequency: "0",
      price: "0",
      is_insurance_available: null,
      before_discount_price: null,
      description: null,
    };
  } else {
    let {
      id,
      description,
      frequency,
      days,
      image,
      price,
      discount,
      is_expired,
      status,
      currency,
      is_voucher,
      backgroud_color,
      shield_color,
      is_recommended,
      before_discount_price,
      price_with_gst,
      apple_product_id,
      apple_product_price,
      insurance_desc,
      strike_out_price,
      created_at,
      name,
      updated_at,
      deleted_at,
      plan_id,
    } = planData[0];

    const endAt: Date = new Date(
      new Date(created_at).getTime() +
        (isNumeric(days)
          ? Number(days) * 24 * 60 * 60 * 1000 // Convert days to milliseconds
          : days)
    );
    return {
      is_expired: is_expired,
      is_voucher: is_voucher,
      price_with_gst: price_with_gst,
      status: status,
      apple_product_id: apple_product_id,
      strike_out_price: strike_out_price,
      start_at: created_at ? moment(created_at).utc().format("DD/MM/YYYY") : "",
      image: image,
      days: days,
      updated_at: updated_at
        ? moment(updated_at).utc().format("YYYY-MM-DD")
        : "",
      is_recommended: is_recommended,
      currency: currency,
      backgroud_color: backgroud_color,
      discount: discount,
      end_at: `${endAt.getDate()}/${
        endAt.getMonth() + 1
      }/${endAt.getFullYear()}`,
      is_cancel: is_expired
        ? is_expired === 2 || is_expired === 1
          ? true
          : false
        : false,
      name: name,
      shield_color: shield_color,
      plan_id: plan_id,
      apple_product_price: apple_product_price,
      id: id,
      deleted_at: deleted_at
        ? moment(planData.deleted_at).utc().format("YYYY-MM-DD")
        : null,
      insurance_desc: insurance_desc,
      created_at: created_at
        ? moment(created_at).utc().format("YYYY-MM-DD HH:mm:ss")
        : null,
      frequency: frequency,
      price: price,

      before_discount_price: before_discount_price,
      description: description,
    };
  }
};

function isNumeric(value: any): boolean {
  return typeof value === "number" && !isNaN(value);
}

const fetchWolooGuestProfile = async (id: any) => {
  let profile = await new WolooGuestModel().fetchWolooGuestProfile(id);
  if (profile.length < 1) return Error("User Not Found!");
  let {
    role_id,
    name,
    email,
    password,
    remember_token,
    pan_url,
    aadhar_url,
    state,
    mobile,
    city,
    pincode,
    address,
    avatar,
    fb_id,
    gp_id,
    ref_code,
    sponsor_id,
    alternate_mob,
    woloo_id,
    subscription_id,
    expiry_date,
    voucher_id,
    gift_subscription_id,
    lat,
    lng,
    otp,
    status,
    settings,
    created_at,
    updated_at,
    deleted_at,
    gender,
    is_first_session,
    dob,
    is_thirst_reminder,
    thirst_reminder_hours,
    is_blog_content_notification,
    IsVtionUser,
  } = profile[0];

  if (!subscription_id && voucher_id) {
    let sub_id = await new WolooGuestModel().fetchSubscriptionIdByVoucherId(
      voucher_id
    );
    subscription_id = sub_id[0].subscriptions_id;
  }
  // Future expiry date calculation
  let futureUserSubscription =
    await new WolooGuestModel().fetchUserSubscription(id, 2);
  let latestExpiryDate = moment(expiry_date, "DD-MM-YYYY");
  if (futureUserSubscription && futureUserSubscription.length > 0) {
    for (const userSubscription of futureUserSubscription) {
      if (userSubscription.subscription_id) {
        const futureSubscription =
          await new SubscriptionModel().findSubscription(
            userSubscription.subscription_id
          );
        if (futureSubscription && futureSubscription.length > 0) {
          const subscriptionDetails = futureSubscription[0];
          let subscription_time = common.convertToDaysAndMonths(
            subscriptionDetails.days
          );
          const endDate = latestExpiryDate
            .clone()
            .add(1, "days")
            .add(subscription_time.days, "days")
            .format("DD-MM-YYYY");
          latestExpiryDate = moment(endDate, "DD-MM-YYYY");
        }
      }
    }
  }
  const currDate = new Date(Date.now()).toISOString();
  if (Date.parse(latestExpiryDate.toISOString()) < Date.parse(currDate)) {
    subscription_id = null;
  }
  let planData = await fetchSubscriptionDetails(subscription_id);
  let purchasedBy = await new WolooGuestModel().purchasedBy(
    id,
    subscription_id
  );
  let offers = await new WolooGuestModel().fetchOfferDetails(id);

  let CoinsData = await new WolooGuestModel().CoinsData(id);
  let totalCoins = CoinsData[0].Credit - CoinsData[0].Debit;

  let giftCoinsData = await new WolooGuestModel().giftCoinsData(id);

  let totalGiftCoins = giftCoinsData[0].Credit - giftCoinsData[0].Debit;

  planData.end_at = moment(expiry_date).format("DD/MM/YYYY");

  let isFutureSubcriptionExist = false;
  const currentDate = new Date();
  let createdAt = new Date(`${planData.created_at}`);

  if (planData.created_at && currentDate < createdAt) {
    isFutureSubcriptionExist = true;
  }
  let isLifeTimeFree = await new WolooGuestModel().checkIsLifeTimeFree(
    voucher_id
  );

  let lifetime_free = null;
  if (isLifeTimeFree.length > 0) {
    lifetime_free = isLifeTimeFree[0].lifetime_free;
  }
  let isPurchaseBy;
  if (purchasedBy.length != 0) {
    isPurchaseBy = purchasedBy[0].purchased_by;
  }
  return {
    isFutureSubcriptionExist: isFutureSubcriptionExist,
    planData: planData,
    futureSubcription: isFutureSubcriptionExist ? planData : null,
    lifetime_free: lifetime_free ?? null,
    purchase_by: isPurchaseBy ?? null,
    profile: {
      created_at: created_at
        ? moment(created_at).utc().format("YYYY-MM-DD HH:mm:ss")
        : null,
      id: id ?? null,
      pincode: pincode ?? null,
      pan_url: pan_url ?? null,
      state: state ?? null,
      address: address ?? null,
      woloo_id: woloo_id ?? null,
      deleted_at: deleted_at
        ? moment(deleted_at).utc().format("YYYY-MM-DD HH:mm:ss")
        : null,
      is_thirst_reminder: is_thirst_reminder ?? 0,
      lifetime_free: 0,
      isFutureSubcriptionExist: isFutureSubcriptionExist,
      subscription_id: subscription_id ?? null,
      dob: dob ?? null,
      gp_id: gp_id ?? null,
      expiry_date: latestExpiryDate ?? null,
      thirst_reminder_hours: thirst_reminder_hours ?? null,
      is_blog_content_notification: is_blog_content_notification ?? 0,
      is_first_session: is_first_session ?? 0,
      aadhar_url: aadhar_url ?? null,
      email: email ?? null,
      otp: otp ?? null,
      name: name ?? null,
      city: city ?? null,
      avatar: avatar ?? null,
      base_url: config.s3imagebaseurl,
      lng: Number(lng) ?? null,
      status: status ?? null,
      mobile: Number(mobile) ?? null,
      fb_id: fb_id ?? null,
      settings: settings ?? null,
      sponsor_id: sponsor_id ?? null,
      alternate_mob: Number(alternate_mob) ?? null,
      lat: Number(lat) ?? null,
      gift_subscription_id: gift_subscription_id ?? null,
      updated_at: updated_at
        ? moment(updated_at).utc().format("YYYY-MM-DD HH:mm:ss")
        : null,
      gender: gender ?? null,
      voucher_id: voucher_id ?? null,
      ref_code: ref_code ?? null,
      role_id: role_id ?? null,
      IsVtionUser: IsVtionUser ?? null,
    },
    offerList: offers ?? [],
    totalCoins: {
      total_coins: totalCoins ?? 0,
      gift_coins: totalGiftCoins ? totalGiftCoins : 0,
    },
  };
};

const navigationRewardService = async (wolooId: any, userId: number) => {
  //check if Woloo Exists
  const woloo = await new WolooHostModel().getWolooHostById(wolooId);
  if (!woloo.length) return Error("Woloo id does not exist.");

  const user = await new WolooGuestModel().getUserByID(userId);
  if (!user) return Error("Invalid user Details");

  //get Amount from settings
  const wolooAmount = await new WolooGuestModel().getSettings(
    "site.woloo_amount"
  );

  const userAmount = await new WolooGuestModel().getSettings(
    "site.user_amount"
  );

  const lastReward = await new WalletModel().getWalletwithRemark(
    wolooId,
    userId,
    "CR",
    "Woloo Navigation credits"
  );

  if (lastReward.length) {
    let diffInMinutes = await new WolooGuestModel().getSettings(
      "site.woloo_reward_diff_in_hours"
    );

    const currMomentString = moment().format("MM/DD/YYYY, h:mm:ss A");
    const lastRewardCreatedAtString = moment(lastReward[0].created_at).format(
      "MM/DD/YYYY, h:mm:ss A"
    );

    const currMoment = moment(currMomentString, "MM/DD/YYYY, h:mm:ss A");
    const lastRewardCreatedAt = moment(
      lastRewardCreatedAtString,
      "MM/DD/YYYY, h:mm:ss A"
    );

    const timeDifferenceMinutes = currMoment.diff(
      lastRewardCreatedAt,
      "minutes"
    );
    // const timeDifferenceMinutes = lastRewardCreatedAt.diff(currMoment, 'minutes');
    if (timeDifferenceMinutes < diffInMinutes[0].value) {
      return Error("Reward already claimed");
    }
  }

  //  create entry to calculate time intervel of 30 min
  const creditWolooData = {
    user_id: userId,
    woloo_id: wolooId,
    type: "CR",
    amount: userAmount[0].value,
    is_review_pending: 1,
  };
  const wolooCredit = await new WalletModel().creatWolooeWallet(
    creditWolooData
  );

  // create entry in wallet table to credit user points
  const createUserData = {
    user_id: userId,
    woloo_id: wolooId,
    transaction_type: "CR",
    remarks: "Woloo Navigation credits",
    value: userAmount[0].value,
    type: "Woloo Navigation Reward credits",
    is_gift: 0,
  };
  const userCredit = await new WalletModel().createWallet(createUserData);

  // create entry in wallet table to credit woloo host points
  let hostUserId = woloo[0]?.user_id;
  let wolooHostCredit;
  if (hostUserId) {
    const creditHostWallet = {
      user_id: hostUserId,
      woloo_id: wolooId,
      transaction_type: "CR",
      remarks: "Woloo Navigation credits",
      value: wolooAmount[0].value,
      type: "Woloo Navigation Reward credits",
      is_gift: 0,
    };
    wolooHostCredit = await new WalletModel().createWallet(creditHostWallet);
  }

  if (
    wolooCredit.affectedRows == 1 &&
    userCredit.affectedRows == 1 &&
    wolooHostCredit.affectedRows == 1
  ) {
    //send sms to woloo
    const hospitality_host_template_id =
      await new WolooGuestModel().getSettings(
        "site.hospitality_host_template_id"
      );
    let hospitality_host_message = await new WolooGuestModel().getSettings(
      "site.hospitality_host_message"
    );

    let new_message = hospitality_host_message[0].value.replace(
      "[Host's Name]",
      woloo?.[0]?.name
    );

    const mobileNumber = woloo[0]?.mobile;
    console.log(mobileNumber, " :mobileNumber");

    const sendSms = await SMS.sendRaw(
      mobileNumber,
      new_message,
      hospitality_host_template_id?.[0]?.value
    );

    if (sendSms.smslist.sms.status == "success") {
      console.log("SMS sent successfully");
    } else {
      console.log("SMS failed");
    }

    return "Woloo navigation reward credited";
  }
  return "Error occured while crediting reward";
};

const profileStatusService = async (userId: number) => {
  let profileStatus = await new WolooGuestModel().currenltyLinkVoucher(userId);
  if (!profileStatus.length) return { isShowProfileForm: false };
  profileStatus = profileStatus[0];
  if (
    profileStatus.is_insurance_available &&
    (isEmpty(profileStatus.aadhaar_url) || isEmpty(profileStatus.pan_url))
  ) {
    return { isShowProfileForm: true };
  }
  return { isShowProfileForm: false };
};

const coinHistory = async (userId: number, pageSize: any, pageIndex: any) => {
  try {
    let getHistory = await new WolooGuestModel().getHistory(
      userId,
      pageSize,
      (pageIndex - 1) * pageSize
    );

    if (getHistory?.length < 1) return Error("details did not match");
    getHistory = getHistory.map((value: any) => {
      value.created_at = moment(value.created_at).format("YYYY-MM-DD HH:mm:ss");
      value.updated_at = moment(value.updated_at).format("YYYY-MM-DD HH:mm:ss");
      value.sender_receiver_id = tryParseInt(value.sender_receiver_id);
      value.transaction_type = value.transaction_type?.toString() ?? null;
      value.message = value.message?.toString() ?? null;
      value.type = value.type?.toString() ?? null;
      value.is_expired = tryParseInt(value.is_expired);
      value.is_gift = tryParseInt(value.is_gift);
      value.updated_at = value.updated_at?.toString() ?? null;
      value.user_id = tryParseInt(value.user_id);
      value.id = tryParseInt(value.id);
      value.woloo_id = tryParseInt(value.woloo_id);
      value.value = value.value?.toString() ?? null;
      value.remarks = value.remarks?.toString() ?? null;
      value.status = tryParseInt(value.status);
      value.expired_on = value.expired_on?.toString() ?? null;

      if (value.woloo_details) {
        try {
          let parsedWolooDetails = JSON.parse(value.woloo_details);
          let image = "";
          if (value.woloo_details.image && value.woloo_details.image.length)
            image = value.woloo_details.image[0];
          console.log(parsedWolooDetails);
          value.woloo_details = {
            image: image,
            code: parsedWolooDetails?.code?.toString() ?? null,
            city: parsedWolooDetails?.city?.toString() ?? null,
            description: parsedWolooDetails?.description?.toString() ?? null,
            created_at: parsedWolooDetails?.created_at?.toString() ?? null,
            title: parsedWolooDetails?.title?.toString() ?? null,
            is_safe_space: tryParseInt(parsedWolooDetails?.is_safe_space),
            updated_at: parsedWolooDetails?.updated_at?.toString() ?? null,
            is_feeding_room: tryParseInt(parsedWolooDetails?.is_feeding_room),
            recommended_by: tryParseInt(parsedWolooDetails?.recommended_by),
            id: tryParseInt(parsedWolooDetails?.id),
            is_sanitizer_available: tryParseInt(
              parsedWolooDetails?.is_sanitizer_available
            ),
            lat: parsedWolooDetails?.lat?.toString() ?? null,
            user_rating: parsedWolooDetails?.user_rating?.toString() ?? null,
            pincode: tryParseInt(parsedWolooDetails?.pincode),
            address: parsedWolooDetails?.address?.toString() ?? null,
            user_review_count: tryParseInt(
              parsedWolooDetails?.user_review_count
            ),
            lng: parsedWolooDetails?.lng?.toString() ?? null,
            is_makeup_room_available: tryParseInt(
              parsedWolooDetails?.is_makeup_room_available
            ),
            restaurant: parsedWolooDetails?.restaurant?.toString() ?? null,
            is_clean_and_hygiene: tryParseInt(
              parsedWolooDetails?.is_clean_and_hygiene
            ),
            is_washroom: tryParseInt(parsedWolooDetails?.is_washroom),
            deleted_at: parsedWolooDetails?.deleted_at?.toString() ?? null,
            is_coffee_available: tryParseInt(
              parsedWolooDetails?.is_coffee_available
            ),
            is_wheelchair_accessible: tryParseInt(
              parsedWolooDetails?.is_wheelchair_accessible
            ),
            is_sanitary_pads_available: tryParseInt(
              parsedWolooDetails?.is_sanitary_pads_available
            ),
            is_franchise: tryParseInt(parsedWolooDetails?.is_franchise),
            is_premium: tryParseInt(parsedWolooDetails?.is_premium),
            user_id: tryParseInt(parsedWolooDetails?.user_id),
            name: parsedWolooDetails?.name?.toString() ?? null,
            opening_hours:
              parsedWolooDetails?.opening_hours?.toString() ?? null,
            recommended_mobile:
              parsedWolooDetails?.recommended_mobile?.toString() ?? null,
            segregated: parsedWolooDetails?.segregated?.toString() ?? null,
            status: tryParseInt(parsedWolooDetails?.status),
            is_covid_free: tryParseInt(parsedWolooDetails?.is_covid_free),
          };
        } catch (e) {
          console.log(e);
          value.woloo_details = null;
        }
      }
      if (value.sender) {
        let sender = value.sender;
        try {
          let parsedSender = JSON.parse(sender);
          value.sender = {
            gender: parsedSender?.gender?.toString() ?? null,
            city: parsedSender?.city?.toString() ?? null,
            created_at: parsedSender?.created_at?.toString() ?? null,
            is_first_session: tryParseInt(parsedSender?.is_first_session),
            ref_code: parsedSender?.ref_code?.toString() ?? null,
            subscription_id: parsedSender?.subscription_id?.toString() ?? null,
            updated_at: parsedSender?.updated_at?.toString() ?? null,
            role_id: parsedSender?.role_id?.toString() ?? null,
            id: tryParseInt(parsedSender?.id),
            woloo_id: parsedSender?.woloo_id?.toString() ?? null,
            email: parsedSender?.email?.toString() ?? null,
            pincode: parsedSender?.pincode?.toString() ?? null,
            address: parsedSender?.address?.toString() ?? null,
            expiry_date: parsedSender?.expiry_date?.toString() ?? null,
            mobile: parsedSender?.mobile?.toString() ?? null,
            otp: tryParseInt(parsedSender?.otp),
            avatar: parsedSender?.avatar?.toString() ?? null,
            sponsor_id: parsedSender?.sponsor_id?.toString() ?? null,
            deleted_at: parsedSender?.deleted_at?.toString() ?? null,
            gp_id: parsedSender?.gp_id?.toString() ?? null,
            fb_id: parsedSender?.fb_id?.toString() ?? null,
            dob: parsedSender?.dob?.toString() ?? null,
            name: parsedSender?.name?.toString() ?? null,
            voucher_id: parsedSender?.voucher_id?.toString() ?? null,
            status: parsedSender?.status?.toString() ?? null,
          };
        } catch (e) {
          value.sender = null;
        }
      }
      return value;
    });

    let historyCount = await new WolooGuestModel().getCoinHistoryCount(userId);
    historyCount = historyCount[0].count;
    return { getHistory, historyCount };
  } catch (error: any) {
    console.log(error);
    return error;
  }
};

function tryParseInt(value: any): number | null {
  const parsedValue = parseInt(value?.toString() ?? "", 10);

  if (isNaN(parsedValue)) {
    return null;
  }

  return parsedValue;
}

const fetchAllUserWolooRating = async (
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
    let rating = await new WolooGuestModel().getUsersWolooRating(
      pageSize,
      (pageIndex - 1) * pageSize,
      orderQuery,
      query
    );

    return rating;
  } catch (error: any) {
    return error;
  }
};
const thirstReminder = async (
  Id: number,
  is_thirst_reminder: number,
  thirst_reminder_hours: number
) => {
  try {
    let response = await new WolooGuestModel().thirstReminder(
      Id,
      is_thirst_reminder,
      thirst_reminder_hours
    );
    let userData = await new WolooGuestModel().getThirstReminderById(Id);
    if (response.affectedRows == 0) {
      return {};
    } else {
      return userData[0];
    }
  } catch (error: any) {
    return error;
  }
};
const fetchAllUserWolooRatingCount = async (query: any) => {
  let total = await new WolooGuestModel().getUsersWolooRatingCount(query);

  return total[0].count;
};
const periodtracker = async (req: any, userId: number) => {
  try {
    let data: any = req.body;
    data.luteal_length = data.luteal_length ? data.luteal_length : null;
    data.cycle_lenght = data.cycle_length ? data.cycle_length : null;
    delete data.cycle_length;
    data.log = data.log ? JSON.stringify(data.log) : null;
    data.user_id = userId;
    data.period_date = data.period_date;
    let userData = await new WolooGuestModel().getPeriodTrackerById(userId);
    let response;
    if (userData[0]) {
      if (
        new Date(userData[0].created_at).getUTCMonth() + 1 ==
        new Date().getMonth() + 1
      ) {
        data.updated_at = new Date();
        response = await new WolooGuestModel().updatePeriod(data, userId);
      } else {
        data.created_at = new Date();
        response = await new WolooGuestModel().createNewPeriod(data);
      }
    } else {
      data.created_at = new Date();
      response = await new WolooGuestModel().createNewPeriod(data);
    }
    userData = await new WolooGuestModel().getPeriodTrackerById(userId);
    // userData[0]["cycle_length"] = userData[0]["cycle_lenght"];
    // delete userData[0]["cycle_lenght"];
    // const formatedDate = new Date(userData[0].period_date);
    // const dateString = formatedDate.toISOString().split("T")[0];
    // userData[0].period_date = dateString;
    if (userData[0]) {
      if (userData[0].log == "" || userData[0].log == null) {
        userData[0].period_date = moment(userData[0].period_date)
          .add(0, "days")
          .format("YYYY-MM-DD");
        userData[0].log = [];
      }
    }
    if (response.affectedRows == 0) {
      return {};
    } else {
      userData[0].log = JSON.parse(userData[0].log);
      userData[0].period_date = moment(userData[0].period_date)
        .add(0, "days")
        .format("YYYY-MM-DD");
      return userData[0];
    }
  } catch (error: any) {
    return error;
  }
};

const PeriodTrackerByID = async (userId: number) => {
  try {
    let periodtrackerprofile = await new WolooGuestModel().getPeriodTrackerById(
      userId
    );

    if (periodtrackerprofile.length > 0) {
      if (periodtrackerprofile[0].log) {
        periodtrackerprofile[0].log = JSON.parse(periodtrackerprofile[0].log);

        if (Object.keys(periodtrackerprofile[0].log).length === 0) {
          periodtrackerprofile[0].log = {};
        }
      }
      periodtrackerprofile[0]["cycle_length"] =
        periodtrackerprofile[0]["cycle_lenght"];
      delete periodtrackerprofile[0]["cycle_lenght"];
      let response = periodtrackerprofile[0];
      response.period_date = moment(response.period_date)
      .add(0, "days")
      .format("YYYY-MM-DD");

      return response;
    } else {
      return {};
    }
  } catch (error: any) {
    return error;
  }
};

const getUsersReport = async (
  pageSize: any,
  pageIndex: any,
  sort: any,
  query: string,
  isPaginated: boolean
) => {
  try {
    let orderQuery: string;
    if (sort.key != "") {
      orderQuery = " ORDER BY " + sort.key + " " + sort.order + " ";
    } else {
      orderQuery = "ORDER BY u.id DESC";
    }

    let transaction = await new WolooGuestModel().getUsersReport(
      pageSize,
      (pageIndex - 1) * pageSize,
      orderQuery,
      query,
      isPaginated
    );

    // if (transaction.length < 1) return Error("details did not match");
    return transaction;
  } catch (error: any) {
    return error;
  }
};

const giftVoucher = async (
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
      orderQuery = "ORDER BY created_at DESC";
    }

    let transaction = await new WolooGuestModel().giftVoucher(
      pageSize,
      (pageIndex - 1) * pageSize,
      orderQuery,
      query
    );

    if (transaction.length < 1) return Error("details did not match");
    return transaction;
  } catch (error: any) {
    return error;
  }
};

const userReportVoucher = async (
  pageSize: any,
  pageIndex: any,
  sort: any,
  query: string,
  isPaginated: boolean
) => {
  try {
    let orderQuery: string;
    if (sort.key != "") {
      orderQuery = " ORDER BY " + sort.key + " " + sort.order + " ";
    } else {
      orderQuery = "ORDER BY u.id DESC";
    }

    let transaction = await new WolooGuestModel().userReportVoucher(
      pageSize,
      (pageIndex - 1) * pageSize,
      orderQuery,
      query,
      isPaginated
    );

    if (transaction.length < 1) return Error("details did not match");
    return transaction;
  } catch (error: any) {
    return error;
  }
};

const userReportSubscription = async (
  pageSize: any,
  pageIndex: any,
  sort: any,
  query: string,
  isPaginated: boolean
) => {
  try {
    let orderQuery: string;
    if (sort.key != "") {
      orderQuery = " ORDER BY " + sort.key + " " + sort.order + " ";
    } else {
      orderQuery = "ORDER BY us.id DESC";
    }

    let transaction = await new WolooGuestModel().userReportSubscription(
      pageSize,
      (pageIndex - 1) * pageSize,
      orderQuery,
      query,
      isPaginated
    );

    if (transaction.length < 1) return Error("details did not match");
    return transaction;
  } catch (error: any) {
    return error;
  }
};

const ownerWiseHistory = async (
  pageSize: any,
  pageIndex: any,
  sort: any,
  isPaginated: boolean,
  query: any
) => {
  try {
    let orderQuery: string;
    if (sort.key != "") {
      orderQuery = " ORDER BY " + sort.key + " " + sort.order + " ";
    } else {
      orderQuery = "ORDER BY u.id DESC";
    }

    let transaction = await new WolooGuestModel().ownerWiseHistory(
      pageSize,
      (pageIndex - 1) * pageSize,
      orderQuery,
      isPaginated,
      query
    );
    if (transaction.length < 1) return Error("details did not match");
    return transaction;
  } catch (error: any) {
    return error;
  }
};
const customerHistory = async (
  pageSize: any,
  pageIndex: any,
  sort: any,
  query: string,
  all_users: number,
  isPaginated: boolean,
  role_id: string | number
) => {
  try {
    let orderQuery: string;
    let customerList: any = [];
    if (sort.key != "") {
      orderQuery = " ORDER BY " + sort.key + " " + sort.order + " ";
    } else {
      orderQuery = "ORDER BY w.created_at DESC";
    }
    // let initialCount: any = 0;
    if (all_users) {
      // console.log("calling customerbyId-----");
      
      customerList = await new WolooGuestModel().customerHistorybyId(
        pageSize,
        (pageIndex - 1) * pageSize,
        orderQuery,
        query,
        role_id
      );
    } else {
      // console.log("calling customerHistory-----");
      
      customerList = await new WolooGuestModel().customerHistory(
        pageSize,
        (pageIndex - 1) * pageSize,
        orderQuery,
        query,
        isPaginated,
        role_id
      );

      // console.log(customerList, " :customerList");
    }
    // console.log(customerList, " :customerList");

    // --- below code was used ---
    // let newArray = [];
    // if (!all_users) {
    //   initialCount = await new WolooGuestModel().getInitialCount(
    //     (pageIndex - 1) * pageSize,
    //     isPaginated
    //   );
    //   // console.log(initialCount, " :initialCount");
    //   let count = initialCount[0].count;

    //   if (initialCount[0].count) {
    //     newArray = customerList.map((a: any) => {
    //       if (a.cr_sum) {
    //         count = count + a.cr_sum;
    //       }
    //       if (a.dr_sum) {
    //         count = count - a.dr_sum;
    //       }
    //       return { ...a, cum_count: count };
    //     });
    //   } else {
    //     count = 0;
    //     newArray = customerList.map((a: any) => {
    //       if (a.cr_sum) {
    //         count = count + a.cr_sum;
    //       }
    //       if (a.dr_sum) {
    //         count = count - a.dr_sum;
    //       }
    //       return { ...a, cum_count: count };
    //     });
    //   }
    // } else {
    //   let test = await new WolooGuestModel().getInitialCountbyUser(
    //     (pageIndex - 1) * pageSize,
    //     orderQuery,
    //     query,
    //     isPaginated
    //   );
    //   let count = test[0].sumdata;
    //   if (test[0].sumdata) {
    //     newArray = customerList.map((a: any) => {
    //       if (a.cr_sum) {
    //         count = count + Number(a.cr_sum);
    //       }
    //       if (a.dr_sum) {
    //         count = count - Number(a.dr_sum);
    //       }
    //       return { ...a, cum_count: count };
    //     });
    //   } else {
    //     count = 0;
    //     newArray = customerList.map((a: any) => {
    //       if (a.cr_sum) {
    //         count = count + Number(a.cr_sum);
    //       }
    //       if (a.dr_sum) {
    //         count = count - Number(a.dr_sum);
    //       }
    //       return { ...a, cum_count: count };
    //     });
    //   }
    // }
    // --- above code was used ---

    // if (customerList.length < 1) return Error("details did not match");
    // console.log(newArray, " :newArray");

    let newArray: any = [];

    if (customerList && customerList.length > 0) {
      for (const customer of customerList) {
        const totalPoints = await new WolooGuestModel().getTotalCoinsForUser(
          customer.user_id,
          customer.created_at
        );
        newArray.push({
          ...customer,
          cum_count: totalPoints[0].total_coins || 0,
        });
      }
    }

    return newArray;
  } catch (error: any) {
    console.error(error);
    return error;
  }
};

const customerHistoryCount = async (query: any) => {
  let total = await new WolooGuestModel().customerHistoryCount(query);

  return total[0].count;
};
const getPointsSource = async (query: any) => {
  let newquery = `where is_gift= ${query} `;
  let PointsSourceList = await new WolooGuestModel().getPointsSource(newquery);
  let newPointsSourceList = [];
  for (let i = 0; i < PointsSourceList.length; i++) {
    newPointsSourceList.push({ label: PointsSourceList[i].type, value: i });
  }
  return newPointsSourceList;
};
const getUsers = async () => {
  let UsersList = await new WolooGuestModel().getUsers();
  let newUsersList = [];
  for (let i = 0; i < UsersList.length; i++) {
    newUsersList.push({
      label: UsersList[i].users_name,
      value: UsersList[i].user_id,
    });
  }
  return newUsersList;
};
const getCorporate = async () => {
  let CorporateList = await new WolooGuestModel().getCorporate();
  let newCorporateList = [];
  for (let i = 0; i < CorporateList.length; i++) {
    newCorporateList.push({
      label: CorporateList[i].corporate_name,
      value: CorporateList[i].id,
    });
  }
  return newCorporateList;
};

const myOffers = async (userId: any) => {
  try {
    let offers = await new WolooGuestModel().myOffers(userId);
    for (let offer of offers) {
      const rating = await new WolooGuestModel().UserWolooRating(
        offer.woloo_id
      );
      // offer.created_at = moment(offer.created_at).format('YYYY-MM-DD HH:mm:ss'),
      //   offer.updated_at = moment(offer.updated_at).format('YYYY-MM-DD HH:mm:ss'),
      //   offer.deleted_at = moment(offer.deleted_at).format('YYYY-MM-DD HH:mm:ss'),
      offer.base_url = config.s3imagebaseurl;
      offer.pincode = 444444;
      offer.recommended_by = 333333;
      (offer.recommended_mobile = "1111111111"),
        (offer.engagement_type = "like"),
        (offer.user_review_count = 55),
        (offer.distance = "0.01 KM"),
        (offer.distance_mtr = 6),
        (offer.duration_sec = 2),
        (offer.duration = "0.2 Min"),
        (offer.is_liked = 0);
      (offer.cibil_score = "750-850"),
        (offer.cibil_score_image =
          "https://woloo-dev-bucket.s3.ap-south-1.amazonaws.com/Cibil+Images/Excellent.png"),
        (offer.cibil_score_colour = "#00863F");

      if (offer.image) {
        offer.image = [offer.image];
        // offer.base_url = config.wolooimagebaseurl;
        offer.base_url = config.s3imagebaseurl;
      } else {
        offer.image = [];
        // offer.base_url = config.wolooimagebaseurl;
        offer.base_url = config.s3imagebaseurl;
      }
      if (rating.length)
        offer.user_rating = rating[0].average_rating
          ? parseFloat(rating[0].average_rating).toFixed(2)
          : 0;

      if (offer.rating < 3) {
        offer.rating = 3;
      }
      if (offer.user_rating < 3) {
        offer.user_rating = 3;
      }
    }
    if (offers.length > 0) {
      return offers;
    } else {
      return [];
    }
  } catch (e) {
    throw new Error("Something went wrong");
  }
};
const redeemOffer = async (userId: number, offerId: number) => {
  try {
    let isOfferExist = await new WolooGuestModel().isOfferExist(offerId);
    if (!isOfferExist.length) return new Error("offer id does not exist.");
    let redeemOffer = await new WolooGuestModel().redeemOffer(userId, offerId);
    if (redeemOffer.affectedRows) {
      return "Your offer has been successfully redeemed. Enjoy the benefits!";
    } else {
      return new Error("Error occure while redeem offer.");
    }
  } catch (e) {
    return e;
  }
};

const getGiftPlan = async (userId: number, offerId: number) => {
  try {
    let getGiftSubscriptionId =
      await new WolooGuestModel().getGiftSubscriptionId();

    let getGiftPlan = await new WolooGuestModel().getGiftPlan(
      getGiftSubscriptionId[0].id
    );

    for (let i = 0; i < getGiftPlan.length; i++) {
      getGiftPlan[i].days = parseInt(
        getGiftPlan[i].days ? getGiftPlan[i].days : 0
      );
      getGiftPlan[i].start_at = moment().format("DD/MM/YYYY");
      getGiftPlan[i].end_at = moment()
        .add(getGiftPlan[i].days, "days")
        .format("DD/MM/YYYY");
    }

    if (getGiftPlan.length > 0) {
      return getGiftPlan;
    } else {
      return "No data found!";
    }
  } catch (e) {
    throw new Error("Something went wrong !");
  }
};

const fetchWolooGuestByMobileNo = async (mobile: any) => {
  var user = await new WolooGuestModel().getUserByMobile(mobile);
  return user[0];
};

const createUser = async (data: any) => {
  var user = await new WolooGuestModel().createUser(data);
  return user;
};

const findSubscriptionBySubId = async (id: any) => {
  var sub = await new WolooGuestModel().findSubscriptionBySubId(id);
  return sub[0];
};

const getFreeTrialPeriodDays = async () => {
  var trial = await new WolooGuestModel().getFreeTrialPeriodDays();
  return trial[0];
};

const getGiftSubscriptionId = async () => {
  var result = await new WolooGuestModel().getGiftSubscriptionId();
  return result[0].value;
};

const createWallet = async (data: any) => {
  var wallet = await new WolooGuestModel().createWallet(data);
  return wallet;
};

const createRZP = async (data: any) => {
  var rzp = await new WolooGuestModel().createRZP(data);
  return rzp;
};

const userReportSubscriptionCount = async (query: any) => {
  let total = await new WolooGuestModel().userReportSubscriptionCount(query);

  return total.length;
};

const userReportVoucherCount = async (query: any) => {
  let total = await new WolooGuestModel().userReportVoucherCount(query);

  return total.length;
};

const ownerHistoryCount = async (query: any) => {
  let total = await new WolooGuestModel().ownerWiseHistoryCount(query);
  return total[0].count;
};

const ownerWiseHistoryCount = async (query: any) => {
  let total = await new WolooGuestModel().ownerWiseHistoryCount(query);

  return total.length;
};

const getUsersReportCount = async (query: any) => {
  let total = await new WolooGuestModel().getUsersReportCount(query);
  return total[0].count;
};

const giftVoucherCount = async (query: any) => {
  let total = await new WolooGuestModel().getUsersReportCount(query);
  return total[0].count;
};

const exportXl = async () => {
  let total = await new WolooGuestModel().exportXl();
  return total[0].count;
};
const getUserVoucherUsage = async (
  pageSize: any,
  pageIndex: any,
  sort: any,
  query: string,
  isPaginated: boolean
) => {
  try {
    let orderQuery: string;
    if (sort.key != "") {
      orderQuery = " ORDER BY " + sort.key + " " + sort.order + " ";
    } else {
      orderQuery = "ORDER BY redemption_date desc";
    }

    let UserVoucher = await new WolooGuestModel().getUserVoucherUsage(
      pageSize,
      (pageIndex - 1) * pageSize,
      orderQuery,
      query,
      isPaginated
    );

    if (UserVoucher.length < 1) return Error("details did not match");
    return UserVoucher;
  } catch (error: any) {
    return error;
  }
};
const getUserVoucherUsageTotal = async (query: any) => {
  let total = await new WolooGuestModel().getUserVoucherUsageTotal(query);

  return total.length;
};
const getReviewOptions = async () => {
  try {
    let reviewOptions = await new WolooGuestModel().getReviewOptions();
    if (reviewOptions.length < 1) return Error("details did not match");
    let newObject: any = {};
    for (let option of reviewOptions) {
      if (newObject.hasOwnProperty(option.key)) {
        newObject[option.key].push(option);
      } else {
        newObject[option.key] = [option];
      }
    }
    return newObject;
  } catch (error: any) {
    return error;
  }
};
const getReviewList = async (
  pageSize: any,
  pageIndex: any,
  woloo_id: number
) => {
  let reviewList = await new WolooGuestModel().getReviewList(
    pageSize,
    (pageIndex - 1) * pageSize,
    woloo_id
  );
  return reviewList;
};

const getReviewListCount = async (woloo_id: number) => {
  let total = await new WolooGuestModel().getReviewListCount(woloo_id);
  return total[0].count;
};
const getPendingReviewStatus = async (user_id: number) => {
  try {
    let reviewList = await new WolooGuestModel().getPendingReviewStatus(
      user_id
    );
    if (reviewList.length < 1) return Error("No data found");

    return reviewList;
  } catch (error: any) {
    return error;
  }
};
const wahcertificate = async (woloo_id: number, userId: number) => {
  try {
    let woloo = await new WolooGuestModel().wahcertificate(woloo_id);
    if (woloo.length < 1) return Error("No woloo found");
    woloo = woloo[0];
    woloo.base_url = config.s3imagebaseurl;
    if (woloo.image) {
      const imagesArray = woloo.image.split(",");
      imagesArray.splice(0, 2);
      imagesArray.splice(-2);
      woloo.image;
      woloo.image = imagesArray;
    } else {
      woloo.image = [];
    }
    (woloo.created_at = moment(woloo.created_at).format("YYYY-MM-DD HH:mm:ss")),
      (woloo.updated_at = moment(woloo.updated_at).format(
        "YYYY-MM-DD HH:mm:ss"
      )),
      (woloo.deleted_at = moment(woloo.deleted_at).format(
        "YYYY-MM-DD HH:mm:ss"
      ));

    const lastReward = await new WalletModel().getWalletwithRemark(
      woloo_id,
      userId,
      "CR",
      "WAH Certificate Point"
    );
    // const lastReward = await new WalletModel().getWolooWallet(woloo_id, userId, "CR");
    if (lastReward.length) {
      let diffInMinutes = await new WolooGuestModel().getSettings(
        "site.wah_certificate_reward_diff_in_min"
      );
      const currMomentString = moment().format("MM/DD/YYYY, h:mm:ss A");
      const lastRewardCreatedAtString = moment(lastReward[0].created_at).format(
        "MM/DD/YYYY, h:mm:ss A"
      );

      const currMoment = moment(currMomentString, "MM/DD/YYYY, h:mm:ss A");
      const lastRewardCreatedAt = moment(
        lastRewardCreatedAtString,
        "MM/DD/YYYY, h:mm:ss A"
      );

      const timeDifferenceMinutes = currMoment.diff(
        lastRewardCreatedAt,
        "minutes"
      );
      // const timeDifferenceMinutes = lastRewardCreatedAt.diff(currMoment, 'minutes')
      if (timeDifferenceMinutes > diffInMinutes?.[0]?.value) {
        return Error("Reward already claimed");
      } else {
        const wah_cerificate_scan_user_point =
          await new WolooGuestModel().getSettings(
            "site.wah_cerificate_scan_user_point"
          );
        const wah_cerificate_scan_woloohost_point =
          await new WolooGuestModel().getSettings(
            "site.wah_cerificate_scan_woloohost_point"
          );

        // user point entry in wallet

        let user_d = {
          user_id: userId,
          woloo_id: woloo_id,
          transaction_type: "CR",
          value: wah_cerificate_scan_user_point?.[0]?.value
            ? wah_cerificate_scan_user_point?.[0]?.value
            : 0,
          type: "WAH Certificate Point",
          remarks: "WAH Certificate Point",
        };

        await new WolooGuestModel().createWallet(user_d);

        // woloo user point entry in wallet
        let users = await new WolooHostModel().getUserIdbyWolooId(woloo_id);

        let user_data = {
          user_id: users[0]?.user_id,
          woloo_id: woloo_id,
          transaction_type: "CR",
          value: wah_cerificate_scan_woloohost_point?.[0]?.value
            ? wah_cerificate_scan_woloohost_point?.[0]?.value
            : 0,
          sender_receiver_id: userId,
          type: "WAH Certificate Point",
          remarks: "WAH Certificate Point",
        };

        await new WolooGuestModel().createWallet(user_data);

        // woloo user point entry in woloo wallet
        let woloo_user_data = {
          user_id: userId,
          woloo_id: woloo_id,
          type: "CR",
          amount: wah_cerificate_scan_woloohost_point?.[0]?.value
            ? wah_cerificate_scan_woloohost_point?.[0]?.value
            : 0,
          is_review_pending: 0,
        };
        await new WalletModel().creatWolooeWallet(woloo_user_data);
      }
    } else {
      const wah_cerificate_scan_user_point =
        await new WolooGuestModel().getSettings(
          "site.wah_cerificate_scan_user_point"
        );

      const wah_cerificate_scan_woloohost_point =
        await new WolooGuestModel().getSettings(
          "site.wah_cerificate_scan_woloohost_point"
        );

      // user point entry in wallet

      let user_d = {
        user_id: userId,
        woloo_id: woloo_id,
        transaction_type: "CR",
        value: wah_cerificate_scan_user_point?.[0]?.value
          ? wah_cerificate_scan_user_point?.[0]?.value
          : 0,
        type: "WAH Certificate Point",
        remarks: "WAH Certificate Point",
      };

      await new WolooGuestModel().createWallet(user_d);

      // woloo user point entry in wallet
      let users = await new WolooHostModel().getUserIdbyWolooId(woloo_id);

      let user_data = {
        user_id: users?.[0]?.user_id,
        woloo_id: woloo_id,
        transaction_type: "CR",
        value: wah_cerificate_scan_woloohost_point?.[0]?.value
          ? wah_cerificate_scan_woloohost_point?.[0]?.value
          : 0,
        sender_receiver_id: userId,
        type: "WAH Certificate Point",
        remarks: "WAH Certificate Point",
      };

      await new WolooGuestModel().createWallet(user_data);

      // woloo user point entry in woloo wallet
      let woloo_user_data = {
        user_id: userId,
        woloo_id: woloo_id,
        type: "CR",
        amount: wah_cerificate_scan_woloohost_point?.[0]?.value
          ? wah_cerificate_scan_woloohost_point?.[0]?.value
          : 0,
        is_review_pending: 0,
      };
      await new WalletModel().creatWolooeWallet(woloo_user_data);
    }

    //send sms to woloo host
    let users = await new WolooHostModel().getUserIdbyWolooId(woloo_id);
    const hospitality_host_template_id =
      await new WolooGuestModel().getSettings(
        "site.hospitality_host_template_id"
      );
    let hospitality_host_message = await new WolooGuestModel().getSettings(
      "site.hospitality_host_message"
    );
    let new_message = hospitality_host_message[0].value.replace(
      "[Host's Name]",
      woloo?.name
    );

    console.log(woloo, " :woloo");

    const mobileNumber = woloo.mobile;
    // console.log(mobileNumber, " :mobileNumber");

    const sendSms = await SMS.sendRaw(
      mobileNumber,
      new_message,
      hospitality_host_template_id?.[0]?.value
    );

    if (sendSms.smslist.sms.status == "success") {
      console.log("SMS sent successfully");
    } else {
      console.log("SMS failed");
    }

    return woloo;
  } catch (error: any) {
    console.log(error, " :error");

    return error;
  }
};
const reverseGeocoding = async (lat: number, lng: number) => {
  try {
    let response = await axios.get(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=AIzaSyCkPmUz4UlRdzcKG9gniW9Qfrgzsjhnb_4`
    );
    if (response.data.results.length < 1) return Error("No location found");
    response = response.data.results;
    return response;
  } catch (error) {
    return error;
  }
};

const invite = async (req: any) => {
  try {
    let userId = req.session.id;
    let mobile_number = req.body.mobile_numbers;
    if (!mobile_number.length)
      return new Error(`Please select at least 1 mobile number`);
    let flag = false;
    let query = `where id=${userId} limit 1  `;
    let invite_by = await new WolooGuestModel().findUser(query);
    query = `where s.key ="site.invite_temp_id"`;
    let tempId = await new WolooGuestModel().getSettingValue(query);
    query = `where s.key ="site.invite_temp"`;
    let template = await new WolooGuestModel().getSettingValue(query);
    for (let number of mobile_number) {
      if (number.length < 10)
        return new Error(
          `Invalid mobile number ${number}. It should have at least 10 digits.`
        );
      if (number.length == 11 && number[0] == 0) {
        number = number.slice(1);
      }
      if (number.length > 10) {
        number = extractValidDigits(number);
        if (!number) {
          return new Error(`Invalid mobile number.`);
        }
      }
      query = `where mobile=${number} limit 1  `;
      let finduser = await new WolooGuestModel().findUser(query);

      if (finduser.length == 0) {
        let message =
          invite_by[0].name != null
            ? template[0].value
                .replace("{#var#}", number)
                .replace("{#var#}", invite_by[0].name)
                .replace("{#var#}", invite_by[0].ref_code)
            : template[0].value
                .replace("{#var#}", number)
                .replace("{#var#}", invite_by[0].mobile)
                .replace("{#var#}", invite_by[0].ref_code);
        const sendSms = await SMS.sendRaw(number, message, tempId[0].value);
        console.log("sendSms.....", sendSms);
        if (sendSms) {
          flag = true;
        } else {
          flag = false;
        }
      } else {
        flag = true;
      }
    }
    if (flag) {
      return { message: "Invitation sent successfully" };
    } else {
      return Error("Something went wrong");
    }
  } catch (error) {
    return error;
  }
};

function extractValidDigits(phoneNumber: string) {
  try {
    let number;
    let parsedPhoneNumber: any = parsePhoneNumber(phoneNumber);
    if (parsedPhoneNumber) {
      number = parsedPhoneNumber?.nationalNumber;
      if (number.length == 10) {
        return number;
      } else {
        return null;
      }
    } else {
      return null;
    }
  } catch (error: any) {
    console.error("Error parsing phone number:", error.message);
  }

  return null;
}

const web_invite_page = async (req: any) => {
  try {
    // let userId = req.session.id;
    let ref_code = req.query.ref_code;
    let findUserIdquery = `where ref_code='${ref_code}' limit 1  `;
    let finduser = await new WolooGuestModel().findUser(findUserIdquery);
    let userId = finduser[0].id;
    let mobile_number = req.query.mobile_number;
    let query = `where mobile=${mobile_number} limit 1  `;
    finduser = await new WolooGuestModel().findUser(query);
    let invited_byquery = `where id=${userId} limit 1  `;
    let invited_by = await new WolooGuestModel().findUser(invited_byquery);
    let host_name: any = req.headers.host;
    let success = 0;
    return {
      invited_by: invited_by,
      mobile_number: mobile_number,
      finduser: finduser,
      success: success,
      baseUrl: host_name,
    };
  } catch (error) {
    return error;
  }
};
const registration = async (req: any) => {
  let WolooUser: any = {};
  try {
    let mobile_number = req.body.mobile_number;
    let name = req.body.name;
    let password = req.body.password;
    let email = req.body.email;
    let invited_by_id = req.body.invited_by_id;
    let ref_code = common.genRefCode();
    const date = new Date();
    const expiry_date = date.toISOString().split("T")[0];

    if (!name) throw new Error("Please enter your name");
    WolooUser.name = name;

    if (!email) throw new Error("Please enter your email");
    WolooUser.email = email;

    let hash = await new Hashing().generateHash(password, 12);
    WolooUser.password = hash;

    if (!mobile_number) throw new Error("Please enter your mobile");
    WolooUser.mobile = mobile_number;

    WolooUser.ref_code = ref_code;
    WolooUser.expiry_date = expiry_date;
    WolooUser.sponsor_id = invited_by_id;

    let createUser = await new WolooGuestModel().createWolooGuest(WolooUser);
    if (createUser) {
      let user_id = await new WolooGuestModel().getNewUser();

      let data: any = {};
      data.transaction_type = "CR";
      data.value = 50;
      data.type = "Invitation Point";
      data.user_id = user_id[0].id;
      await new WalletModel().createWallet(data);
      let query = `where id =${invited_by_id}`;
      let invited_by = await new WolooGuestModel().findUser(query);
      let success = 1;
      return { success: success };
    }
  } catch (error) {
    return error;
  }
};

const scanWoloo = async (req: any) => {
  try {
    let userId = req.session.id;

    if (!req.query.name) {
      throw new Error("Please provide the woloo name.");
    }

    const history = await new WolooGuestModel().getWolooScanHistory(userId);
    if (history.length) {
      const lastScan = new Date(history[0].created_at);
      const addHours = (date: Date, hours: number): Date => {
        date.setTime(date.getTime() + hours * 3600000);
        return date;
      };
      const nextScanTime = addHours(lastScan, 1);

      if (nextScanTime > new Date()) {
        throw new Error("Please try after some time.");
      }
    }

    const wolooQuery = `where w.code like "%${req.query.name}%"`;
    const woloos = await new WolooGuestModel().getWoloo(wolooQuery);

    if (!woloos.length) {
      throw new Error("Incorrect woloo name.");
    }

    const woloo = woloos[0];
    if (woloo.is_offer) {
      const settingQuery = `where s.key ="site.woloo_amount"`;
      const settingAmount = await new WolooGuestModel().getSettingValue(
        settingQuery
      );

      const wolooWalletData = {
        user_id: userId,
        type: "CR",
        woloo_id: woloo.id,
        amount: settingAmount[0].value,
      };
      await new WolooGuestModel().createWolooWallet(wolooWalletData);

      const historyData = {
        user_id: userId,
        offer_id: woloo.is_offer,
      };
      await new WolooGuestModel().createWolooScanHistory(historyData);

      const userOfferData = {
        user_id: userId,
        offer_id: woloo.is_offer,
        expiry_date: woloo.end_date,
        status: 1,
      };
      await new WolooGuestModel().createUserOffer(userOfferData);

      return "You are eligible for the offer now!";
    } else {
      // create entry in wallet table to credit user points
      const userAmount = await new WolooGuestModel().getSettings(
        "site.user_amount"
      );
      const createUserData = {
        user_id: userId,
        woloo_id: woloo?.id,
        transaction_type: "CR",
        remarks: "Woloo Scan credits",
        value: userAmount[0].value,
        type: "Woloo Scan Reward credits",
        is_gift: 0,
      };
      const userCredit = await new WalletModel().createWallet(createUserData);

      // create entry in wallet table to credit woloo host points
      const wolooAmount = await new WolooGuestModel().getSettings(
        "site.woloo_amount"
      );
      let hostUserId = woloo?.user_id;
      let wolooHostCredit;
      if (hostUserId) {
        const creditHostWallet = {
          user_id: hostUserId,
          woloo_id: woloo.id,
          transaction_type: "CR",
          remarks: "Woloo Scan credits",
          value: wolooAmount[0].value,
          type: "Woloo Scan Reward credits",
          is_gift: 0,
        };
        wolooHostCredit = await new WalletModel().createWallet(
          creditHostWallet
        );
      }
      if (!userCredit || !wolooHostCredit) {
        throw new Error("Error occured while crediting points");
      }
    }
    return "You have successfully scanned the woloo and points have been credited!";
  } catch (error) {
    return error;
  }
};

const getUserOffer = async (
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
      orderQuery = " ORDER BY uo.id DESC";
    }

    let user = await new WolooGuestModel().getUserOffer(
      pageSize,
      (pageIndex - 1) * pageSize,
      orderQuery,
      query
    );

    // if (user.length < 1) return Error("details did not match");

    return user;
  } catch (error: any) {
    return error;
  }
};
const getUserOfferCount = async (query: any) => {
  try {
    let total = await new WolooGuestModel().getUserOfferCount(query);
    return total[0].count;
  } catch (error) {
    return error;
  }
};
const deleteUserOfferById = async (id: any) => {
  try {
    let userOffer = await new WolooGuestModel().deleteUserOfferById(id);
    if (!userOffer) return Error("Record Not Found");
    return { Response: "USER OFFER DELETED SUCCESSFULLY" };
  } catch (error: any) {
    return error;
  }
};
const fetchUserOfferByID = async (user_id: any) => {
  let userOffer;
  try {
    userOffer = await new WolooGuestModel().fetchUserOfferById(user_id);
    if (userOffer.length < 1) return Error("Record Not Found  !");
    let { id, mobile, title, expiry_date, status, us_id, offer_id } =
      userOffer[0];
    let offer = {
      label: title,
      value: offer_id,
    };
    status = {
      label: status ? "ACTIVE" : "INACTIVE",
      value: status,
    };
    let data = {
      id: id,
      mobile: mobile,
      offer: offer,
      expiry_date: expiry_date,
      status: status,
    };

    return data;
  } catch (e) {
    return e;
  }
};
const updateUserOffer = async (req: any) => {
  try {
    // @ts-ignore
    let data = req.body;
    data.updated_at = new Date();
    let userExist = await new WolooGuestModel().getUserByMobile(data.mobile);
    if (!userExist.length) return new Error("USER IS NOT EXIST ");
    delete data.mobile;
    if (userExist.length) data.user_id = userExist[0].id;
    let userOffer = await new WolooGuestModel().updateUserOffer(
      data,
      req.body.id
    );

    if (userOffer.affectedRows == 0)
      return Error("Record Not Found for given ID !");

    return { Response: "USER OFFER SUCCESSFULLY UPDATED !" };
  } catch (e) {
    return e;
  }
};
const addUserOffer = async (data: any) => {
  try {
    data.status = 1;
    let userExist = await new WolooGuestModel().getUserByMobile(data.mobile);
    if (!userExist.length) return new Error("USER IS NOT EXIST ");
    delete data.mobile;
    if (userExist.length) data.user_id = userExist[0].id;
    let userOffer = await new WolooGuestModel().addUserOffer(data);
    if (!userOffer) return new Error("operation  failed");
    return { Response: "USER OFFER SUCCESSFULLY CREATED ! " };
  } catch (e) {
    return e;
  }
};
const getOffer = async () => {
  try {
    let userOffer = await new WolooGuestModel().getOffer();
    if (!userOffer) throw new Error("Record Not Found !");
    userOffer = userOffer.map((offer: any) => {
      let Data = {
        label: offer.title,
        value: offer.id,
      };
      return Data;
    });

    return userOffer;
  } catch (e) {
    return e;
  }
};
const getRoles = async () => {
  try {
    let roles = await new WolooGuestModel().getRoles();
    if (!roles) throw new Error("Record Not Found !");
    roles = roles.map((role: any) => {
      let Data = {
        label: role.display_name,
        value: role.id,
      };
      return Data;
    });

    return roles;
  } catch (e) {
    return e;
  }
};
const getUserDetailByUser_id = async (user_id: any) => {
  try {
    let woloo_id = await new WolooGuestModel().getUserDetailByUser_id(user_id);
    if (!woloo_id) throw new Error("Record Not Found !");
    return woloo_id;
  } catch (e) {
    return e;
  }
};

const userLog = async (req: any) => {
  try {
    let user_id = req.session.id;
    let data = req.body;
    data.user_id = user_id;
    let userLog = await new WolooGuestModel().userLog(data);
    if (!userLog.affectedRows)
      throw new Error("Error occure while submitting user logs details");
    return "User log details submitted successfully";
  } catch (e) {
    return e;
  }
};
const getUserDetailBySponser_id = async (user_id: any) => {
  try {
    let user = await new WolooGuestModel().getUserDetailBySponser_id(user_id);
    if (!user) throw new Error("Record Not Found !");
    return user;
  } catch (e) {
    return e;
  }
};

const createClient = async (data: any) => {
  try {
    let { password, email, mobile } = data;
    let defaultPassword = generateRandomPassword();
    if (!password) {
      password = defaultPassword;
    }
    let hash = await new Hashing().generateHash(password, 12);
    data.password = hash;
    data.role_id = 13;
    let getUser = await new WolooGuestModel().getUserByMobileOrEmail(
      email,
      mobile
    );
    if (getUser.length) {
      return {
        user_id: getUser[0].id,
      };
    }
    let insertUser = await new WolooGuestModel().insertUser(data);
    if (!insertUser.affectedRows) return Error("Failed to insert");
    return {
      user_id: insertUser.insertId,
    };
  } catch (err: any) {
    throw err;
  }
};

const adminCreateClient = async (data: any, role: number) => {
  try {
    const adminRoleId = Constants.rbac.role_id.admin;
    // if (role != adminRoleId) {
    //   throw new Error("Access denied: Only administrators are allowed to access this API.");
    // }

    const { email } = data;

    // Check if  email already exist
    const getUser = await new WolooGuestModel().getUserByEmail(email);
    if (getUser.length) {
      return {
        user_id: getUser[0].id,
        isEmail: true,
      };
    }

    let password = generateRandomPassword();
    // Create nodemailer transporter
    const transporter = nodemailer.createTransport({
      port: 587,
      host: config.email.hostname,
      tls: { rejectUnauthorized: false },
      debug: true,
      auth: {
        type: "LOGIN",
        user: config.email.email_user,
        pass: config.email.email_pass,
      },
    });

    // Generate password hash
    const hash = await new Hashing().generateHash(password, 12);
    data.password = hash;
    data.role_id = 13;

    // Insert user data

    const insertUser = await new WolooGuestModel().insertUser(data);
    if (!insertUser.affectedRows) {
      throw new Error("Failed to insert user");
    }

    const emailData = {
      to: email,
      from: "info@woloo.in",
      from_name: "Woloo",
      subject: "Woloo",
      html: emailTemplate(email, password),
    };

    // Send registration email
    await transporter.sendMail(emailData);

    return {
      user_id: insertUser.insertId,
      isEmail: false,
    };
  } catch (err) {
    console.error("Error in adminCreateClient:", err);
    throw err;
  }
};

const generateRandomPassword = (): string => {
  const charset =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_-+=<>?";
  let password = "";
  for (let i = 0; i < 8; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    password += charset.charAt(randomIndex);
  }
  return password;
};

const generateResetToken = async (email: string) => {
  try {
    const dummyPassword = generateRandomPassword();
    // Save user data to Redis with a 5-minute expiration
    let setDummyPassword = await RedisClient.getInstance().setEx(
      email,
      300,
      dummyPassword
    );
    const emailData = {
      to: email,
      from: "info@woloo.in",
      from_name: "Woloo",
      subject: "Password Reset",
      text: `Your temporary password is: ${dummyPassword}. This password will expire within 5 minutes. Click the following link to reset your password: https://staging-portal.woloo.in/reset-password`,
    };
    await transporter.sendMail(emailData);
    return null;
  } catch (e) {
    console.error(`Error in generateResetToken: ${e}`);
    return e;
  }
};

const resetPassword = async (email: any, newPassword: string) => {
  try {
    let isUserExist = await new WolooGuestModel().getUserByEmail(email);
    if (!isUserExist.length) throw new Error("Email id does not exist");
    let hash = await new Hashing().generateHash(newPassword, 12);
    newPassword = hash;
    let resetPassword = await new WolooGuestModel().resetPassword(
      email,
      newPassword,
      0
    );
    if (!resetPassword.affectedRows)
      throw new Error("Error occure while submitting user logs details");
    return "User log details submitted successfully";
  } catch (e) {
    throw e;
  }
};

export default {
  createWolooGuest,
  fetchAllWolooGuest,
  fetchWolooGuestCount,
  fetchWolooGuestById,
  deleteWolooGuestById,
  updateWolooGuest,
  createGuestOTP,
  verifyGuestOTP,
  appConfigGet,
  deleteWolooGuestByMultiId,
  login,
  fetchWolooGuestProfile,
  navigationRewardService,
  profileStatusService,
  coinHistory,
  fetchAllUserWolooRating,
  fetchAllUserWolooRatingCount,
  thirstReminder,
  periodtracker,
  PeriodTrackerByID,
  getUsersReport,
  getUsersReportCount,
  giftVoucher,
  giftVoucherCount,
  userReportSubscription,
  userReportSubscriptionCount,
  userReportVoucher,
  ownerHistoryCount,
  ownerWiseHistory,
  ownerWiseHistoryCount,
  exportXl,
  customerHistory,
  customerHistoryCount,
  getPointsSource,
  getUsers,

  userReportVoucherCount,

  getUserVoucherUsage,
  getUserVoucherUsageTotal,
  getCorporate,
  getReviewOptions,
  getReviewList,
  getReviewListCount,
  getPendingReviewStatus,
  wahcertificate,
  reverseGeocoding,
  invite,
  web_invite_page,
  registration,
  myOffers,
  redeemOffer,
  getGiftPlan,
  fetchWolooGuestByMobileNo,
  getGiftSubscriptionId,
  findSubscriptionBySubId,
  getFreeTrialPeriodDays,
  createUser,
  createWallet,
  createRZP,
  scanWoloo,
  getUserOffer,
  getUserOfferCount,
  addUserOffer,
  updateUserOffer,
  fetchUserOfferByID,
  deleteUserOfferById,
  getOffer,
  getRoles,
  getUserDetailByUser_id,
  getUserDetailBySponser_id,
  userLog,
  updateDeviceToken,
  createClient,
  adminCreateClient,
  generateResetToken,
  resetPassword,
  createOTPForHost,
  verifyHostOTP,
};
