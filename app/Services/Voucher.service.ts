import moment from "moment";
import config from "../config";
import _ from "lodash";
import { VoucherModel } from "../Models/Voucher.model";
import HttpClient from "../utilities/HttpClient";
import RazorpayUtils from "../utilities/Razorpay";

import Constants from "../Constants/common";
import { CorporateModel } from "../Models/Corporate.model";
import common from "../utilities/common";
import { writeFileXLSX } from "../utilities/XLSXUtility";
import { uploadLocalFile } from "../utilities/S3Bucket";
import path from "path";
import { WolooGuestModel } from "./../Models/WolooGuest.model";
import formidable from "formidable";
import { uploadFile } from "../utilities/S3Bucket";
import transporter from "../utilities/Email";

import { SubscriptionModel } from "../Models/Subscription.model";
import Guest from "./CommonService/Guest";
const fs = require("fs");

const createDynamicLink = async (short_code: any) => {
  const url = config.firebaseLink.url;
  var data: any = JSON.stringify({
    dynamicLinkInfo: {
      domainUriPrefix: config.firebaseLink.domainUriPrefix,
      link: `https://app.woloo.in?voucher=${short_code}`,
      androidInfo: {
        androidPackageName: config.firebaseLink.androidPackageName,
      },
      iosInfo: {
        iosBundleId: config.firebaseLink.iosBundleId,
      },
    },
  });
  return await HttpClient.api("POST", url, { data: data });
};

const createOnlinePaymentVoucher = async (
  req: any,
  amountValue: number,
  corporate: any,
  voucherid: number
) => {
  const proto = req.connection && req.connection.encrypted ? "https" : "http";
  const callback =
    proto + "://" + req.headers.host + Constants.voucher.CALLBACK_URL;
  const method = Constants.voucher.CALLBACK_METHOD;
  const amount = amountValue * 100;
  const description = "Payment for woloo voucher";
  const { short_url, id } = await RazorpayUtils.createPaymentLink(
    amount,
    corporate,
    callback,
    method,
    description
  );
  await new VoucherModel().updateVoucher(
    { payment_link: short_url, plink: id },
    voucherid
  );
  // if (updateVoucher.affectedRows == 1) {
  //   return { message: "Voucher created successfully and payment link sent",downloadLink: downloadLink  };
  // } else {
  //   throw new Error("Failed to create voucher");
  // }
};

const createVoucherService = async (
  req: any,
  voucherDetails: any,
  isCreateLinks: boolean
) => {
  let {
    corporate_id,
    expiry,
    value,
    lifetime_free,
    type_of_organization,
    type_of_voucher,
    discount_percentage,
    subscriptions_id,
    number_of_uses,
    code,
    payment_mode,
    isEmail,
  } = voucherDetails;

  if (
    !isCreateLinks &&
    Number(number_of_uses) != voucherDetails.mobileNumbers.length
  ) {
    throw new Error(
      "number_of_uses is not equal to provide total number of mobile_numbers in the file."
    );
  }
  const corporate = await new CorporateModel().fetchCorporatesById(
    voucherDetails["corporate_id"]
  );
  const subscription = (
    await new SubscriptionModel().fetchSubscriptionById(subscriptions_id)
  )[0];
  if (!subscription) throw new Error("Invalid Subscription id");

  if (!voucherDetails.forceApply && !isCreateLinks) {
    let existingUser = [];
    console.log("Mobile num ", voucherDetails.mobileNumbers);
    for (let i = 0; i < voucherDetails.mobileNumbers.length; i++) {
      const mobileNumber = voucherDetails.mobileNumbers[i];
      let user = (
        await new WolooGuestModel().getWolooGuestByMobile(mobileNumber)
      )[0];
      if (user) {
        existingUser.push(user.mobile);
      }
    }
    if (existingUser.length > 0) {
      return {
        message: `Mobile Numbers with ${existingUser.toString()} already exist do you want to continue applying the voucher ?`,
        isApplied: false,
      };
    }
  }

  const subdays = common.convertToDaysAndMonths(subscription.days);
  if (corporate.length > 0) {
    const voucherData = {
      corporate_id: Number(corporate_id),
      expiry: expiry,
      value: Number(value),
      lifetime_free: Number(lifetime_free),
      type_of_organization: type_of_organization,
      type_of_voucher: type_of_voucher,
      discount_percentage: Number(discount_percentage),
      days: subdays.days,
      subscriptions_id: Number(subscriptions_id),
      number_of_uses: Number(number_of_uses),
      status: 0,
      code: code,
      payment_mode: payment_mode,
      is_email: isEmail,
    };
    let voucher = await new VoucherModel().addVoucher(voucherData);
    if (voucher) {
      if (type_of_voucher == Constants.voucher.PAID && payment_mode == 1) {
        await createOnlinePaymentVoucher(
          req,
          value,
          corporate[0],
          voucher.insertId
        );
      } else {
        await new VoucherModel().updateVoucher({ status: 1 }, voucher.insertId);
      }
      if (isCreateLinks) {
        const noOfUses = voucherDetails.number_of_uses;
        const shortLinks = [];
        for (let i = 0; i < noOfUses; i++) {
          const short_code = common.voucherGenerator(5);
          const resp = await createDynamicLink(short_code);
          let voucher_link = {
            short_code: short_code,
            dynamic_link: resp.shortLink,
            voucher_id: voucher.insertId,
            user_id: 0,
            status: 1,
          };
          await new VoucherModel().createVoucherLinks(voucher_link);
          shortLinks.push({ links: resp.shortLink });
        }
        const filePath: any = await writeFileXLSX(shortLinks);
        const key = path.parse(filePath);
        const uploadPath = Constants.voucher.UPLOAD_PATH + key.base;
        const uploadstatus = await uploadLocalFile(
          filePath,
          uploadPath,
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        );
        //await fs.unlinkSync(filePath);
        await new VoucherModel().updateVoucher(
          { downloadLink: uploadPath },
          voucher.insertId
        );
        if (payment_mode == 1) {
          return {
            message: `Voucher created successfully and payment link send to email ${corporate[0].email}`,
          };
        }
        if (voucherDetails.isEmail == 1 && payment_mode !== 1) {
          // send Email
          // const dirPath = path.join(__dirname, '..', 'public');
          const templatePath = "./public/template/emailTemplate.html";
          await fs.readFile(
            templatePath,
            "utf8",
            async function (error: any, html: any) {
              if (error) {
                throw error;
              }
              html = html.replace("{{customer_name}}", corporate[0].name);
              html = html.replace(
                "{{link}}",
                config.s3imagebaseurl + uploadPath
              );
              const mailData = {
                from: config.email.email,
                to: corporate[0].email,
                subject: `Voucher Links`,
                // text:,
                html: html,
              };
              const emailStatus = await transporter.sendMail(mailData);
            }
          );
          return {
            message: `Voucher created successfully and send to email ${corporate[0].email}`,
          };
        } else {
          // Download Voucher
          return {
            message: "Voucher created successfully",
            downloadLink: config.s3imagebaseurl + uploadPath,
          };
        }
        //throw error
      } else {
        // create user and attach voucher
        const newUsers = [];
        const oldUsers = [];
        for (let i = 0; i < voucherDetails.mobileNumbers.length; i++) {
          const mobileNumber = voucherDetails.mobileNumbers[i];
          let user = await new WolooGuestModel().getWolooGuestByMobile(
            mobileNumber
          );
          if (user.length > 0) {
            oldUsers.push(user[0]);
          } else {
            newUsers.push(mobileNumber);
          }
        }
        if (newUsers.length > 0) {
          for (let i = 0; i < newUsers.length; i++) {
            await Guest.createGuest(newUsers[i], voucher.insertId,null,null);
          }
        }
        if (oldUsers.length > 0) {
          for (let i = 0; i < oldUsers.length; i++) {
            let exp_date = new Date(Date.now());
            exp_date.setDate(exp_date.getDate() + voucherData.days);
            await new WolooGuestModel().updateWolooGuest(
              { expiry_date: exp_date, voucher_id: voucher.insertId },
              oldUsers[i].id
            );
            await new VoucherModel().insertUserVoucher({
              user_id: oldUsers[i].id,
              voucher_code_id: voucher.insertId,
            });
          }
        }
        return {
          message:
            "Voucher created and applied successfully for mobile Numbers",
          isApplied: true,
        };
      }
    } else {
      throw new Error("Voucher Creation Failed");
    }
  } else {
    throw new Error("Invalid corporate id");
  }
};

const voucherWebhook = async (payment: any) => {
  try {
    const voucher = await new VoucherModel().fetchVoucher(
      payment.razorpay_payment_link_id
    );
    if (voucher.length > 0) {
      // make status Active;
      const response = JSON.stringify(payment);
      await new VoucherModel().updateVoucherByPlink(
        { status: 1, webhook_details: response, payment_details: response },
        payment.razorpay_payment_link_id
      );
      const corporate = (
        await new CorporateModel().fetchCorporatesById(voucher[0].corporate_id)
      )[0];
      if (voucher[0].is_email) {
        // send email
        const templatePath = "./public/template/emailTemplate.html";
        await fs.readFile(
          templatePath,
          "utf8",
          async function (error: any, html: any) {
            if (error) {
              throw error;
            }
            html = html.replace("{{customer_name}}", corporate.name);
            html = html.replace(
              "{{link}}",
              config.s3imagebaseurl + voucher[0].downloadLink
            );
            const mailData = {
              from: config.email.email,
              to: corporate.email,
              subject: `Voucher Links`,
              // text:,
              html: html,
            };
            const emailStatus = await transporter.sendMail(mailData);
            console.log(emailStatus);
          }
        );
        return {
          message: "Payment Success",
          corporate: corporate.name,
          sendEmail: 1,
        };
      } else {
        return {
          message: "Payment Success",
          corporate: corporate.name,
          downloadLink: config.s3imagebaseurl + voucher[0].downloadLink,
        };
      }
    }

    throw new Error("Voucher not found");
  } catch (error) {
    return { error: error };
  }
};

const voucherVerify = async (shortCode: any) => {
  try {
    const link = await new VoucherModel().fetchVoucherLink(shortCode);
    if (!link) throw new Error("Invalid Code");
    if (link[0].status == 0) throw new Error("Link Expired");
    return { link: link[0].dynamic_link };
  } catch (error) {
    console.log("Error ", error);
    return { error: error };
  }
};

const applyVoucher = async (
  userId: number,
  voucherid: any,
  shortCode: any,
  days: number,
  alreadyUseCount: number,
  lifetime_free: number,
  type_of_voucher: any
) => {
  let setExpiry;
  let expiryNote = "";
  if (lifetime_free) {
    setExpiry = new Date(Date.now());
    setExpiry.setFullYear(setExpiry.getFullYear() + 100);
    console.log("Life time free ", setExpiry);
  } else {
    let user = (await new WolooGuestModel().getWolooGuestById(userId))[0];
    if (Date.parse(user.expiry_date) > Date.now() && !user.voucher_id) {
      setExpiry = new Date(user.expiry_date);
      setExpiry.setDate(setExpiry.getDate() + days);
      expiryNote =
        "If you already have free trial active, your current applied voucher will get active after free trial ends.";
    } else {
      setExpiry = new Date(Date.now());
      setExpiry.setDate(setExpiry.getDate() + days);
    }
  }
  const res = await new WolooGuestModel().updateWolooGuest(
    {
      voucher_id: voucherid,
      expiry_date: setExpiry,
      subscription_id: null,
      gift_subscription_id: null,
    },
    userId
  );
  if (res.affectedRows == 1) {
    const userVoucher = await new VoucherModel().insertUserVoucher({
      user_id: userId,
      voucher_code_id: voucherid,
    });
    if (userVoucher.insertId) {
      await new VoucherModel().updateVoucherLinkById({ status: 0 }, shortCode);
      await new VoucherModel().updateVoucher(
        { already_use_count: alreadyUseCount + 1 },
        shortCode
      );
      let message;
      let daysMsg = lifetime_free == 1 ? "Unlimited" : days;
      message =
        "Congratulation you have received " + daysMsg + " Days of Subscription";
      return {
        message: message,
        isAlreadyApplied: false,
        days: days,
        isLifetime: lifetime_free,
        typeOfVoucher: type_of_voucher,
        expiryNote: expiryNote,
      };
    }
  }
  throw new Error("Voucher Applied failed");
};

const voucherApply = async (
  shortCode: any,
  userId: number,
  forceApply: Boolean
) => {
  try {
    const link = await new VoucherModel().fetchVoucherLink(shortCode);

    const voucherid = link[0].voucher_id;
    const voucher = await new VoucherModel().fetchVoucherById(voucherid);

    const user = await new WolooGuestModel().getWolooGuestById(userId);

    if (voucher.length == 0) throw new Error("Invalid Voucher");
    if (voucher[0].status == 0) throw new Error("Voucher is inactive");
    if (link.length < 1) throw new Error("Invalid code");
    if (link[0].status == 0 && user[0].voucher_id == voucherid) {
      return {
        isAlreadyApplied: true,
        isAlreadyConsumed: true,
      };
    }
    if (link[0].status == 0) throw new Error("Link expired");
    const currDate = new Date(Date.now()).toISOString();

    // if (Date.parse(voucher[0].expiry) < Date.parse(currDate))
    //   throw new Error("Voucher Expired");
    const days = voucher[0].days;

    // check for subscription

    if (user[0].subscription_id && !forceApply) {
      if (Date.parse(user[0].expiry_date) > Date.parse(currDate)) {
        return {
          message: Constants.voucher.FUTURE_SUB_MSG,
          isAlreadyApplied: true,
          isPopup: 0,
        };
      }
    }
    if (
      Date.parse(user[0].expiry_date) > Date.parse(currDate) &&
      !user[0].voucher_id
    ) {
      return await applyVoucher(
        userId,
        voucherid,
        shortCode,
        days,
        voucher[0].already_use_count,
        voucher[0].lifetime_free,
        voucher[0].type_of_voucher
      );
    } else if (forceApply) {
      return await applyVoucher(
        userId,
        voucherid,
        shortCode,
        days,
        voucher[0].already_use_count,
        voucher[0].lifetime_free,
        voucher[0].type_of_voucher
      );
    } else {
      const futureSubscription = await new VoucherModel().fetchUserSubscription(
        userId,
        2
      );

      if (futureSubscription && futureSubscription.length > 1) {
        return {
          message: Constants.voucher.FUTURE_SUB_EXIST,
          isAlreadyApplied: true,
        };
      }
      if (user[0].voucher_id) {
        if (Date.parse(voucher[0].expiry) > Date.parse(currDate)) {
          if (user[0].voucher_id == voucherid) {
            // return {
            //   message: Constants.voucher.VOUCHER_CONSUMED,
            //   isAlreadyApplied: true,
            //   isPopup: 0
            // };
            return {
              isAlreadyApplied: true,
              isAlreadyConsumed: true,
            };
          }

          return {
            isAlreadyApplied: true,
            isAlreadyConsumed: false,
          };
          // send for override response
          // const currVoucher = await new VoucherModel().fetchVoucherById(
          //   user[0].voucher_id
          // );
          // if (currVoucher.length > 0) {
          //   if (Date.parse(currVoucher[0].expiry) > Date.parse(currDate)) {
          //     // return {
          //     //   message: Constants.UTURE_SUB_MSG,
          //     //   isAlreadyApplied: true,
          //     // };
          //   }
          // }
          // return await applyVoucher(
          //   userId,
          //   voucherid,
          //   shortCode,
          //   days,
          //   voucher[0].already_use_count,
          //   voucher[0].lifetime_free,
          //   voucher[0].type_of_voucher
          // );
        } else {
          return {
            message: Constants.voucher.FUTURE_EXPIRED_VOUCHER,
            isAlreadyApplied: true,
          };
        }
      } else {
        return await applyVoucher(
          userId,
          voucherid,
          shortCode,
          days,
          voucher[0].already_use_count,
          voucher[0].lifetime_free,
          voucher[0].type_of_voucher
        );
      }
    }
  } catch (err) {


    throw new Error("Something went wrong !");
  }
};

const fetchAllVoucher = async (
  pageSize: any,
  pageIndex: any,
  sort: any,
  query: string,
  isPaginated: boolean
) => {
  let orderQuery: string;
  if (sort.key != "") {
    orderQuery = " ORDER BY " + sort.key + " " + sort.order + " ";
  } else {
    orderQuery = " ORDER BY id DESC";
  }

  let voucher;
  voucher = await new VoucherModel().fetchAllVoucher(
    pageSize,
    (pageIndex - 1) * pageSize,
    orderQuery,
    query,
    isPaginated
  );

  if (voucher.length < 1) return Error("details did not match");

  for (let obj of voucher) {
    let {
      id,
      code,
      corporate_id,
      expiry,
      value,
      created_at,
      updated_at,
      deleted_at,
      subscriptions_id,
      number_of_uses,
      already_use_count,
      type_of_organization,
      type_of_voucher,
      lifetime_free,
      status,
      days,
      discount_percentage,
      payment_link,
      plink,
      payment_details,

      webhook_details,
      payment_mode,
      is_email,
      po_url,
    } = obj;

    let webhook_status;
    let payment_status;

    if (webhook_details) {
      webhook_details = JSON.parse(webhook_details);
      webhook_status = webhook_details.razorpay_payment_link_status;
    }
    if (payment_mode == "2") {
      payment_status = "free";
    } else if (
      (payment_mode == "1" && webhook_status == "paid") ||
      (payment_mode == "0" && po_url)
    ) {
      payment_status = "paid";
    } else {
      payment_status = "pending";
    }

    let corporateName = await new VoucherModel().fetchCorporateName(
      corporate_id
    );

    obj.id = id;
    obj.code = code ? code : null;

    (obj.payment_mode =
      payment_mode == 1
        ? { label: "ONLINE", value: 1 }
        : payment_mode == 0
          ? { label: "OFFLINE", value: 0 }
          : { label: "FREE", value: 2 }),
      (obj.is_email = is_email
        ? { label: "YES", value: 1 }
        : { label: "NO", value: 0 }),
      (obj.corporate_name = corporateName[0] ? corporateName[0].name : null);
    //delete obj.corporate_id;
    //(obj.corporate_id = corporateName[0] ? corporateName[0].name : null);

    console.log("expiry: ", expiry);
    
    obj.expiry = expiry ? new Date(expiry).toLocaleDateString() : null;

    console.log(obj.expiry, " :expiry");
    
    obj.value = value ? value : null;

    obj.created_at = created_at
      ? moment(created_at).utc().format("YYYY-MM-DD")
      : moment(Date.now()).utc().format("YYYY-MM-DD");
    obj.updated_at = updated_at
      ? moment(updated_at).utc().format("YYYY-MM-DD")
      : moment(Date.now()).utc().format("YYYY-MM-DD");
    obj.deleted_at = deleted_at
      ? moment(deleted_at).utc().format("YYYY-MM-DD")
      : null;

    (obj.status = status
      ? { label: "ACTIVE", value: 1 }
      : { label: "INACTIVE", value: 0 }),
      (obj.subscriptions_id = subscriptions_id ? subscriptions_id : null);
    obj.number_of_uses = number_of_uses ? number_of_uses : 0;
    obj.already_use_count = already_use_count ? already_use_count : 0;

    (obj.type_of_organization =
      type_of_organization == "Public"
        ? { label: "Public", value: 0 }
        : type_of_organization == "Government"
          ? { label: "Government", value: 1 }
          : { label: "Private", value: 0 }),
      (obj.type_of_voucher =
        type_of_voucher == "paid"
          ? { label: "paid", value: 1 }
          : { label: "free", value: 0 }),
      (obj.lifetime_free =
        lifetime_free == 1
          ? { label: "Yes", value: 1 }
          : { label: "No", value: 0 }),
      (obj.days = days ? days : 0);
    obj.discount_percentage = discount_percentage ? discount_percentage : 0;
    obj.payment_link = payment_link ? payment_link : null;
    obj.payment_details = payment_details ? payment_details : null;
    obj.webhook_details = webhook_details ? webhook_details : null;
    obj.payment_status = payment_status;
  }
  return voucher;
};

const fetchVoucherUsers = async (
  id: any,
  pageSize: any,
  pageIndex: any,
  sort: any,
  query: string
) => {
  let orderQuery: string;
  if (sort.key != "") {
    orderQuery = " ORDER BY " + sort.key + " " + sort.order + " ";
  } else {
    orderQuery = " ORDER BY id DESC";
  }

  let voucher;

  voucher = await new VoucherModel().fetchVoucherUsers(
    id,
    pageSize,
    (pageIndex - 1) * pageSize,
    orderQuery,
    query
  );

  if (voucher.length < 1) return Error("details did not match");
  for (let obj of voucher) {
    let { id, name, expiry_date, mobile } = obj;
    obj.id = id;
    obj.name = name ? name : null;

    obj.expiry_date = expiry_date
      ? moment(expiry_date).utc().format("YYYY-MM-DD")
      : null;

    const currDate = new Date(Date.now()).toISOString();
    if (Date.parse(expiry_date) < Date.parse(currDate)) {
      obj.isDeactivate = 1;
    } else {
      obj.isDeactivate = 0;
    }

    obj.mobile = mobile ? mobile : null;
  }
  return voucher;
};

const fetchAllVoucherCount = async (query: string) => {
  let total;
  total = await new VoucherModel().fetchAllVoucherCount(query);
  return total[0].count;
};

const fetchVoucherUsersCount = async (id: any) => {
  let total = await new VoucherModel().fetchVoucherUsersCount(id);
  return total[0].count;
};

const fetchVoucherById = async (id: any) => {
  let corporateName;
  let subscriptioneName;

  let voucher = await new VoucherModel().fetchVoucherById(id);
  let corporate = await new VoucherModel().fetchCorporateForVoucherDetails(id);

  let subscription =
    await new VoucherModel().fetchSubscriptionForVoucherDetails();

  for (let c of corporate) {
    if (c.id == voucher[0].corporate_id) {
      let { id: value, name: label } = c;
      c = { value, label };
      corporateName = c;
    }
  }

  for (let s of subscription) {
    if (s.id == voucher[0].subscriptions_id) {
      let { id: value, name: label } = s;
      s = { value, label };

      subscriptioneName = s;
    }
  }

  if (voucher.length < 1) return Error("Record Not Found  !");
  let {
    code,
    corporate_id,
    expiry,
    value,
    created_at,
    updated_at,
    deleted_at,
    subscriptions_id,
    number_of_uses,
    already_use_count,
    type_of_organization,
    type_of_voucher,
    lifetime_free,
    status,
    days,
    discount_percentage,
    payment_link,
    plink,
    payment_details,
    webhook_details,
    payment_mode,
    is_email,
  } = voucher[0];

  return {
    code: code ?? null,

    corporate: corporateName ?? "",
    expiry: expiry ? moment(expiry).utc().format("YYYY-MM-DD") : null,
    days: days ?? null,
    value: value ?? null,
    created_at: created_at
      ? moment(created_at).utc().format("YYYY-MM-DD")
      : moment(Date.now()).utc().format("YYYY-MM-DD"),
    updated_at: updated_at
      ? moment(updated_at).utc().format("YYYY-MM-DD")
      : moment(Date.now()).utc().format("YYYY-MM-DD"),
    deleted_at: deleted_at
      ? moment(deleted_at).utc().format("YYYY-MM-DD")
      : null,
    subscription: subscriptioneName ?? null,

    status: status
      ? { label: "ACTIVE", value: 1 }
      : { label: "INACTIVE", value: 0 },

    payment_mode: payment_mode
      ? { label: "ONLINE", value: 1 }
      : { label: "OFFLINE", value: 0 },

    is_email: is_email ? { label: "YES", value: 1 } : { label: "NO", value: 0 },

    number_of_uses: number_of_uses ?? 0,
    already_use_count: already_use_count ?? 0,

    type_of_organization:
      type_of_organization == "Government"
        ? { label: "Government", value: 1 }
        : { label: "Private", value: 0 },

    type_of_voucher:
      type_of_voucher == "paid"
        ? { label: "paid", value: 1 }
        : { label: "free", value: 0 },

    lifetime_free: lifetime_free
      ? { label: "Yes", value: 1 }
      : { label: "No", value: 0 },

    discount_percentage: discount_percentage ?? null,
    payment_link: payment_link ?? null,
    plink: plink ?? null,
    payment_details: payment_details ?? null,
    webhook_details: webhook_details ?? "",
    base_url: config.s3imagebaseurl,
  };
};

const getPriceByID = async (id: any) => {
  let price;
  price = await new VoucherModel().getPriceByID(id);

  if (price.length < 1) return Error("Details not found");
  return price[0];
};

const fetchCorporateForVoucherDetails = async (id: any) => {
  let corporate;

  corporate = await new VoucherModel().fetchCorporateForVoucherDetails(id);

  if (corporate.length < 1) return Error("Record Not Found  !");

  let data = [];

  for (let c of corporate) {
    let { id: value, name: label } = c;
    c = { value, label };
    data.push(c);
  }

  return {
    data,
  };
};

const fetchSubscriptionForVoucherDetails = async () => {
  let subscription;

  subscription = await new VoucherModel().fetchSubscriptionForVoucherDetails();

  if (subscription.length < 1) return Error("Record Not Found  !");

  let data = [];

  for (let c of subscription) {
    let { id: value, name: label } = c;
    c = { value, label };
    data.push(c);
  }

  return {
    data,
  };
};
const deleteVoucher = async (id: any) => {
  let delStatus = await new VoucherModel().deleteVoucher(id);
  if (delStatus.affectedRows == 0) return Error("Record Not Found !");
  return { Response: " DELETED SUCCESSFULLY" };
};

const deactivateVoucherUser = async (user_id: any, voucher_id: any) => {
  let deactivateUser = await new VoucherModel().deactivateVoucherUser(
    user_id,
    voucher_id
  );

  if (deactivateUser.affectedRows == 0)
    return Error("Please enter correct user_id and voucher_id !");
  return { Response: "DEACTIVATE SUCCESSFULLY" };
};

const deactivateVoucher = async (voucher_id: any) => {
  let deactivateVoucher = await new VoucherModel().deactivateVoucher(
    voucher_id
  );
  if (deactivateVoucher.affectedRows == 0)
    return Error("Voucher ID Not Found !");
  return { Response: "DEACTIVATE SUCCESSFULLY" };
};

const bulkDeleteVoucher = async (id: any) => {
  let voucher = await new VoucherModel().bulkDeleteVoucher(id);

  if (!voucher) throw new Error("details did not match");
  return "VOUCHER DELETED SUCCESSFULLY";
};

const getVoucherUser = async (id: any) => {
  let voucher;
  voucher = await new VoucherModel().getVoucherUser(id);
  if (voucher.length < 1) return Error("Record Not Found  !");
  return voucher;
};

const noOfUsesVoucher = async (id: any) => {
  let voucherUses;

  voucherUses = await new VoucherModel().noOfUsesVoucher(id);

  if (voucherUses.length < 1) return Error("Record Not Found  !");

  return voucherUses;
};

const updateNoOfUses = async (id: any, number_of_uses: any) => {
  let voucher = await new VoucherModel().fetchVoucherById(id);

  let { webhook_details, payment_mode, po_url, status } = voucher[0];

  let webhook_status;
  let payment_status;

  if (webhook_details) {
    webhook_details = JSON.parse(webhook_details);

    webhook_status = webhook_details.razorpay_payment_link_status;
  }
  if (payment_mode == "2") {
    payment_status = "free";
  } else if (
    (payment_mode == "1" && webhook_status == "paid") ||
    (payment_mode == "0" && po_url)
  ) {
    payment_status = "paid";
  } else {
    payment_status = "pending";
  }

  let updateUses;
  if (payment_status == "pending" && status == 1) {
    updateUses = await new VoucherModel().updateNoOfUses(id, number_of_uses);
  } else {
    updateUses = [];
  }
  if (updateUses.length < 1) return Error("CAN'T UPDATE !");

  return "UPDATED SUCCESSFULLY";
};

const PoUpload = async (req: any) => {
  try {
    let s3Path, response: any, fields: any, files: any;
    // @ts-ignore

    response = await processPoUploadForm(req);

    if (response instanceof Error) return response;

    let { utr, id } = response.fields;

    s3Path = response.s3Path;

    let paidVoucher: any = {};

    paidVoucher.po_url = s3Path.toString();

    if (!utr) return Error("utr field required");
    paidVoucher.utr = utr;

    if (!id) return Error("id field required");
    paidVoucher.id = id;

    let voucher = await new VoucherModel().PoUpload(paidVoucher, id);

    if (voucher.affectedRows == 0) {
      return Error("Record Not Found  !");
    } else {
      let changeStatus = await new VoucherModel().changeStatus(id);
      return {
        MESSAGE: " UPLOADED SUCCESSFULLY",
      };
    }
  } catch (e) {
    throw e;
  }
};

const processPoUploadForm = async (req: any) => {
  let s3Path: any = [];
  const form = new formidable.IncomingForm({ multiples: true });

  return new Promise((resolve, reject) => {
    form.parse(req, async (err: any, fields: any, files: any) => {
      try {
        const images: any = files.po_url;

        const uploadImage = async (image: any) => {
          const imageName =
            moment().unix() + "." + image.originalFilename.split(".").pop();
          let name: string = "voucher" + "/" + imageName;

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

        resolve({ fields: fields, s3Path: s3Path });
      } catch (e) {
        throw e;
      }
    });
  });
};

const voucherDownload = async (voucherId: number) => {
  const result = await new VoucherModel().fetchVoucherById(voucherId);
  if (result.length == 0) throw new Error("Invalid Voucher Id");
  if (!result[0].downloadLink) throw new Error("No Download Link found");
  return { link: config.s3imagebaseurl + result[0].downloadLink };
};

const UserGiftPopUp = async (giftId: number, userId: number) => {
  console.log("User Pop up", giftId, userId);
  let userGift = await new VoucherModel().UserGiftPopUp(giftId, userId);
  let setStatus = await new VoucherModel().setStatus(giftId, userId);
  if (userGift.length < 1 || !userGift[0].value)
    return Error("No gift found for this User!");
  return { message: "Congratulations You have got the Gift card !" };
};

export default {
  createVoucherService,
  voucherWebhook,
  voucherVerify,
  voucherApply,
  fetchAllVoucher,
  fetchAllVoucherCount,
  fetchVoucherById,
  deleteVoucher,
  getVoucherUser,
  fetchCorporateForVoucherDetails,
  fetchSubscriptionForVoucherDetails,
  getPriceByID,
  bulkDeleteVoucher,
  noOfUsesVoucher,
  fetchVoucherUsers,
  fetchVoucherUsersCount,
  PoUpload,
  voucherDownload,
  deactivateVoucherUser,
  deactivateVoucher,
  updateNoOfUses,
  UserGiftPopUp,
};
