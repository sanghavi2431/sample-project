import moment from "moment";
import { SubscriptionModel } from "../Models/Subscription.model";
import config from "../config";

import formidable from "formidable";
import { uploadFile } from "../utilities/S3Bucket";
import RazorpayUtils from "../utilities/Razorpay";
import CommonUtils from "../utilities/common";
import { VoucherModel } from "../Models/Voucher.model";
import common from "../utilities/common";
import { WolooGuestModel } from "../Models/WolooGuest.model";
import { WalletModel } from "../Models/Wallet.model";

import { getClientAddress, subscriptionTime } from "../utilities/ApiUtilities";
import { CorporateModel } from "../Models/Corporate.model";
import { WolooHostModel } from "../Models/WolooHost.model";
import { SettingModel } from "../Models/Setting.model";

const fetchAllSubscription = async (
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

    let subscription = await new SubscriptionModel().fetchAllSubscription(
      pageSize,
      (pageIndex - 1) * pageSize,
      orderQuery,
      query
    );
    if (subscription.length < 1) return Error("details did not match");
    for (let obj of subscription) {
      let {
        id,
        name,
        description,
        frequency,
        days,
        image,
        price,
        discount,
        is_expired,
        status,
        created_at,
        updated_at,
        deleted_at,
        plan_id,
        currency,
        is_voucher,
        backgroud_color,
        shield_color,
        is_recommended,
        before_discount_price,
        price_with_gst,
        apple_product_id,
        apple_product_price,
        is_insurance_available,
        strike_out_price,
      } = obj;
      obj.id = id;
      obj.name = name ? name : null;
      obj.description = description ? description : null;

      obj.is_insurance_available = is_insurance_available
        ? is_insurance_available
        : 0;

      (obj.is_insurance_availabl = is_insurance_available
        ? { label: "Yes", value: 1 }
        : { label: "No", value: 0 }),
        (obj.frequency = frequency ? frequency : null);
      obj.days = days;

      obj.image = image ? image : "classic.png";
      obj.price = price ? price : null;
      obj.discount = discount ? discount : null;
      obj.is_expired = is_expired ? is_expired : 0;

      obj.base_url = config.s3imagebaseurl;

      (obj.status = status
        ? { label: "ACTIVE", value: 1 }
        : { label: "INACTIVE", value: 0 }),
        (obj.created_at = created_at
          ? moment(created_at).format("YYYY-MM-DD")
          : moment(Date.now()).format("YYYY-MM-DD"));
      obj.updated_at = updated_at
        ? moment(updated_at).format("YYYY-MM-DD")
        : moment(Date.now()).format("YYYY-MM-DD");
      obj.deleted_at = deleted_at
        ? moment(deleted_at).format("YYYY-MM-DD")
        : null;
      obj.plan_id = plan_id ? plan_id : null;
      obj.currency = currency ? currency : "INR";

      (obj.is_voucher = is_voucher
        ? { label: "Yes", value: 1 }
        : { label: "No", value: 0 }),
        (obj.backgroud_color = backgroud_color ? backgroud_color : null);
      obj.shield_color = shield_color ? shield_color : null;

      (obj.is_recommended = is_recommended
        ? { label: "Yes", value: 1 }
        : { label: "No", value: 0 }),
        (obj.before_discount_price = before_discount_price
          ? before_discount_price
          : null);

      obj.price_with_gst = price_with_gst ? price_with_gst : null;

      obj.apple_product_id = apple_product_id ? apple_product_id : null;

      obj.apple_product_price = apple_product_price
        ? apple_product_price
        : null;
      obj.strike_out_price = strike_out_price ? strike_out_price : null;
    }
    return subscription;
  } catch (error: any) {
    return error;
  }
};

const fetchAllSubscriptionCount = async (query: any) => {
  let total;
  total = await new SubscriptionModel().fetchAllSubscriptionCount(query);
  return total[0].count;
};

const fetchSubscriptionById = async (id: any) => {
  let subscription;

  let subscriptions_id = [
    { label: "1 week", value: 1 },
    { label: "1 month", value: 2 },
    { label: "2 months", value: 3 },
    { label: "3 months", value: 4 },
    { label: "6 months", value: 5 },
    { label: "1 year", value: 6 },
  ];

  subscription = await new SubscriptionModel().fetchSubscriptionById(id);
  if (subscription.length < 1) return Error("Record Not Found  !");
  let {
    name,
    description,
    frequency,
    days,
    image,
    price,
    discount,
    is_expired,
    status,
    created_at,
    updated_at,
    deleted_at,
    plan_id,
    currency,
    is_voucher,
    backgroud_color,
    shield_color,
    is_recommended,
    before_discount_price,
    price_with_gst,
    apple_product_id,
    apple_product_price,
    is_insurance_available,
    insurance_desc,
    strike_out_price,
  } = subscription[0];

  let day;
  for (let s of subscriptions_id) {
    if (s.label == days) {
      day = s;
    }
  }

  return {
    name: name ?? null,

    is_insurance_available: is_insurance_available
      ? { label: "Yes", value: 1 }
      : { label: "No", value: 0 },

    description: description ?? null,
    frequency: frequency ?? null,
    days: day,
    image: image ?? "classic.png",
    price: price ?? null,
    strike_out_price: strike_out_price ?? null,
    discount: discount ?? null,
    is_expired: is_expired ?? 0,
    status: status
      ? { label: "ACTIVE", value: 1 }
      : { label: "INACTIVE", value: 0 },
    created_at: created_at
      ? moment(created_at).utc().format("YYYY-MM-DD")
      : moment(Date.now()).utc().format("YYYY-MM-DD"),
    updated_at: updated_at
      ? moment(updated_at).utc().format("YYYY-MM-DD")
      : moment(Date.now()).utc().format("YYYY-MM-DD"),
    deleted_at: deleted_at
      ? moment(deleted_at).utc().format("YYYY-MM-DD")
      : null,
    plan_id: plan_id ?? null,
    currency: currency ?? "INR",
    is_voucher: is_voucher
      ? { label: "Yes", value: 1 }
      : { label: "No", value: 0 },
    backgroud_color: backgroud_color ?? null,
    shield_color: shield_color ?? null,
    is_recommended: is_recommended
      ? { label: "Yes", value: 1 }
      : { label: "No", value: 0 },
    before_discount_price: before_discount_price ?? null,
    price_with_gst: price_with_gst ?? null,
    apple_product_id: apple_product_id ?? null,
    apple_product_price: apple_product_price ?? null,
    base_url: config.s3imagebaseurl,
    insurance_desc: insurance_desc,
  };
};

const deleteSubscription = async (id: any) => {
  let subscriptionStatus = (
    await new SubscriptionModel().fetchSubscriptionDetailsById(id)
  )[0];
  if (subscriptionStatus.status == 0)
    throw new Error(
      "Failed to delete subscription, Subscription already inactive"
    );
  let voucher = await new VoucherModel()._executeQuery(
    "select id from voucher_codes where subscriptions_id = ?",
    [id]
  );
  if (voucher.length > 0)
    throw new Error(
      "Failed to delete subscription, Subscription active for voucher"
    );
  let subscription = await new SubscriptionModel().deleteSubscription(id);
  if (subscription.affectedRows == 0) return Error("Record Not Found !");
  return { Response: " DELETED SUCCESSFULLY" };
};

const createSubscription = async (req: any) => {
  try {
    let s3Path, response: any, fields: any, files: any;
    // @ts-ignore

    response = await createSubscriptionForm(req);
    if (response instanceof Error) throw response;

    let {
      name,
      description,
      frequency,
      days,
      price,
      discount,
      is_insurance_available,
      insurance_desc,
      is_voucher,
      backgroud_color,
      shield_color,
      is_recommended,
      before_discount_price,
      price_with_gst,
      apple_product_id,
      apple_product_price,
      strike_out_price,
    } = response.fields;

    s3Path = response.s3Path;

    let data: any = {};

    if (!name) throw new Error("Please enter your name");
    data.name = name;

    if (!description) throw new Error("description field required");
    data.description = description;

    if (!is_insurance_available)
      throw new Error("Please enter is_insurance_available field");
    data.is_insurance_available = is_insurance_available;

    if (!days) throw new Error("days field required");
    data.days = days;

    if (!price) throw new Error("Please enter price");
    data.price = price;

    if (!discount) throw new Error("Please enter discount");
    data.discount = discount;

    if (!is_voucher) throw new Error("is_voucher field required");
    data.is_voucher = is_voucher;

    if (!description) throw new Error("description field required");
    data.description = description;

    if (!backgroud_color) throw new Error("backgroud_color field required");
    data.backgroud_color = backgroud_color;

    if (!shield_color) throw new Error("shield_color field required");
    data.shield_color = shield_color;
    if (!is_recommended) throw new Error("is_recommended field required");
    data.is_recommended = is_recommended;

    if (!before_discount_price)
      throw new Error("before_discount_price field required");
    data.before_discount_price = before_discount_price;

    if (!price_with_gst) throw new Error("price_with_gst field required");
    data.price_with_gst = price_with_gst;

    if (apple_product_id) data.apple_product_id = apple_product_id;

    if (apple_product_price) data.apple_product_price = apple_product_price;
    if (strike_out_price) data.strike_out_price = strike_out_price;

    if (insurance_desc) data.insurance_desc = insurance_desc;

    if (s3Path[0]) data.image = s3Path;
    const subTime = CommonUtils.convertToDaysAndMonths(days);

    frequency = subTime.period;

    if (frequency) data.frequency = frequency;

    const amount = price_with_gst * 100;
    const subcreate = await RazorpayUtils.createSubscription(
      subTime.period,
      subTime.interval,
      name,
      amount,
      description
    );
    if (subcreate) {
      data.plan_id = subcreate.id;
      data.status = 1;
      let subscription = await new SubscriptionModel().createSubscription(data);
      if (!subscription) throw new Error("Registration  failed");
      return { Response: "SUBSCRIPTION CREATED SUCCESSFULLY" };
    }
    throw new Error("Registration  failed");
  } catch (e) {
    console.log(e);
    throw e;
  }
};

const createSubscriptionForm = async (req: any) => {
  let s3Path: any = [];

  const form = new formidable.IncomingForm();
  return new Promise((resolve, reject) => {
    form.parse(req, async (err: any, fields: any, files: any) => {
      try {
        const images: any = files.image;

        if (images) {
          const imageName =
            moment().unix() + "." + images.originalFilename.split(".").pop();

          let name: string = "Images/" + "subscription" + "/" + imageName;

          const result = await uploadFile(images, name);

          if (result == 0 && result == undefined)
            return Error("file upload to s3 failed");

          s3Path.push(result.key);
        }

        resolve({ fields: fields, s3Path: s3Path });
      } catch (e) {
        throw e;
      }
    });
  });
};

const updateSubscription = async (req: any) => {
  try {
    let wolooData, s3Path, response: any, fields: any, files: any;
    // @ts-ignore

    response = await updateSubscriptionForm(req);
    if (response instanceof Error) throw response;
    let subscriptionStatus = (
      await new SubscriptionModel().fetchSubscriptionDetailsById(
        response.fields.id
      )
    )[0];
    // if (subscriptionStatus.status == 0)
    //   throw new Error(
    //     "Failed to delete subscription, Subscription already inactive"
    //   );
    let voucher = await new VoucherModel()._executeQuery(
      "select id from voucher_codes where subscriptions_id = ?",
      [response.fields.id]
    );
    if (response.fields.status == 0 && voucher.length > 0)
      throw new Error(
        "Failed to delete subscription, Subscription active for voucher"
      );

    let {
      id,
      name,
      description,
      frequency,
      days,

      price,
      discount,
      is_expired,
      status,

      plan_id,
      currency,
      is_voucher,
      backgroud_color,
      shield_color,
      is_recommended,
      before_discount_price,
      price_with_gst,
      apple_product_id,
      apple_product_price,
      is_insurance_available,
      strike_out_price,
      insurance_desc,
    } = response.fields;

    s3Path = response.s3Path;

    let data: any = {};

    if (!name) throw new Error("Please enter your name");
    data.name = name;

    if (!description) throw new Error("description field required");
    data.description = description;

    if (!days) throw new Error("days field required");
    data.days = days;

    if (!price) throw new Error("Please enter price");
    data.price = price;

    if (!discount) throw new Error("Please enter discount");

    data.discount = discount;

    if (!status) throw new Error("Please enter status");

    data.status = status;

    if (plan_id) data.plan_id = "plan_id";

    if (!description) throw new Error("description field required");
    data.description = description;

    if (!is_voucher) throw new Error("is_voucher field required");
    data.is_voucher = is_voucher;

    if (!description) throw new Error("description field required");
    data.description = description;

    if (!backgroud_color) throw new Error("backgroud_color field required");
    data.backgroud_color = backgroud_color;

    if (!is_insurance_available)
      throw new Error("is_insurance_available field required");
    data.is_insurance_available = is_insurance_available;

    if (!shield_color) throw new Error("shield_color field required");
    data.shield_color = shield_color;
    if (!is_recommended) throw new Error("is_recommended field required");
    data.is_recommended = is_recommended;
    if (apple_product_id) data.apple_product_id = apple_product_id;
    if (apple_product_price) data.apple_product_price = apple_product_price;
    if (insurance_desc) data.insurance_desc = insurance_desc;
    if (strike_out_price) data.strike_out_price = strike_out_price;

    const subTime = CommonUtils.convertToDaysAndMonths(days);
    frequency = subTime.period;
    if (frequency) data.frequency = frequency;

    if (s3Path[0]) data.image = s3Path;

    let updatedSubscription = await new SubscriptionModel().updateSubscription(
      data,
      id
    );

    if (updatedSubscription.affectedRows == 0)
      return Error("Record Not Found !");

    return { MESSAGE: "UPDATED SUCCESSFULLY" };
  } catch (e) {
    throw e;
  }
};

const bulkDeleteSubscription = async (id: any) => {
  let subscriptionStatus = await new SubscriptionModel()._executeQuery(
    "select id from subscriptions where id in (?) and status =1",
    [id]
  );

  if (subscriptionStatus.length < id.length)
    return Error(
      "Failed to delete subscription, Subscription already inactive"
    );

  let voucher = await new VoucherModel()._executeQuery(
    "select id from voucher_codes where subscriptions_id in (?)",
    [id]
  );

  if (voucher.length > 0)
    return Error(
      "Failed to delete subscription, Subscription active for voucher"
    );
  let subscription = await new SubscriptionModel().bulkDeleteSubscription(id);
  if (!subscription) return Error("details did not match");
  return { Response: "SUBSCRIPTIONS DELETED SUCCESSFULLY" };
};

const updateSubscriptionForm = async (req: any) => {
  let s3Path: any = [];
  const form = new formidable.IncomingForm({ multiples: true });
  return new Promise((resolve, reject) => {
    form.parse(req, async (err: any, fields: any, files: any) => {
      try {
        if (files && files.image) {
          let images: any = files.image;

          const uploadImage = async (image: any) => {
            const imageName =
              moment().unix() + "." + image.originalFilename.split(".").pop();
            let name: string = "Images/" + "subscription" + "/" + imageName;

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
        resolve({ fields: fields, s3Path: s3Path });
      } catch (e) {
        throw e;
      }
    });
  });
};

const isFutureSubscriptionExist = async (userdetails: any) => {
  let { subscription_id, voucher_id, expiry_date } = userdetails;

  if (!subscription_id && voucher_id) {
    let sub_id = await new WolooGuestModel().fetchSubscriptionIdByVoucherId(
      voucher_id
    );
    subscription_id = sub_id[0].subscriptions_id;
  }

  let subscriptionDetails: any =
    await new SubscriptionModel().fetchSubscriptionDetailsById(subscription_id);

  let isFutureSubcriptionExist = false;

  let createdDate = moment(subscriptionDetails[0].created_at)
    .utc()
    .format("YYYY-MM-DD");

  if (new Date().toLocaleDateString("en-CA") < createdDate) {
    isFutureSubcriptionExist = true;
  }

  if (isFutureSubcriptionExist) return Error("You have future subscription");

  // if(userdetails.expiry_date &&  userdetails.expiry_date>)
};

const isInsurance = async (id: any) => {
  let isInsurance = await new SubscriptionModel().isInsurance(id);

  if (isInsurance.length < 1) return Error("Record Not Found  !");
  let { is_insurance_available } = isInsurance[0];

  return {
    is_insurance_available: is_insurance_available ? "Yes" : "No",
  };
};

const fetchSubscriptionPlan = async (req: any) => {
  let plans = await new SubscriptionModel().fetchSubscriptionPlan();

  if (plans.length < 1) return Error("Data Not Found!");
  plans = plans.map((plan: any) => {
    try {
      const d = common.convertToDaysAndMonths(plan.days);
      plan.days = Number(d.days);
      plan.frequency = d.frequency;
    } catch (e) {
      console.log(".................>", e);
    }
    // console.log("plan",plan)
    return plan;
  });
  return plans;
};

const initSubscription = async (req: any) => {
  try {
    //@ts-ignore
    let userId = req.session.id;

    let planRecordId = req.body.id;
    let planId = req.body.plan_id;
    let future = req.body.future;

    var transactionDate = new Date();
    let userdetails = await new WolooGuestModel().getUserByID(userId);

    if (!userdetails) throw "user not found ";
    /**
     * check future subscription
     */

    let isFutureSubcriptionExist =
      await new SubscriptionModel().isFutureSubcriptionExist(userId, 2);

    if (isFutureSubcriptionExist) throw "You have future subscription !";

    /**
     * Validate Plan and Get Plan Details
     */

    let planDetails = await new SubscriptionModel().fetchPlanDetails(
      planRecordId,
      planId,
      1,
      0
    );

    let { price, currency, days } = planDetails;

    var subscriptionParams: any = {
      plan_id: planId,
      customer_notify: 1,
      total_count: 99,
      quantity: 1,
    };

    if (future && future == 1) {
      let expiryTimeStamp = userdetails.expiry_date.getTime() / 1000;

      subscriptionParams["start_at"] = expiryTimeStamp;
    }

    var createSubscription = await RazorpayUtils.createUserSubscription(
      subscriptionParams
    );

    if (!createSubscription.status) {
      throw "RAZORPAY BAD_REQUEST_ERROR  !";
    }

    var subscriptionId = createSubscription.id;

    let clientIp = getClientAddress(req);

    let { platform, country, actualCountry } = req.body.locale;
    let unitType = "subscription";

    let txnKeyOptions = [planId + "-"];

    let midLayerTransactionId = await RazorpayUtils.getTransactionId(
      "TXN_PREFIX",
      "WOLOO-",
      txnKeyOptions
    );

    let transactionDetails = {
      user_id: userId,
      client_ip: clientIp,
      platform: platform,
      country: actualCountry,
      transaction_utc_datetime: transactionDate,
      transaction_id: midLayerTransactionId,
      request_type: "new",
      channel_tag: "razorpay",
      channel_name: "razorpay",
      super_store_id: -1,
      store_id: -1,
      parent_package_id: -1,
      package_id: -1,
      event_id: -1,
      product_id: -1,
      channel_id: -1,
      app_package_name: null,
      jetpay_txn_id: null,
      developer_payload: null,
      return_url: null,
      fail_return_url: null,
      jetpay_customer_identification_id: null,
      payload_hash: null,
      re_attempt: null,
      ios_original_txn_id: null,
      purchase_time: new Date(),
      is_auto_renewed: 0,
      unit_type: unitType,
      plan_id: planId,
      plan_type: unitType,
      currency: currency,
      transaction_amount: price,
      user_order_id: subscriptionId,
      charging_status: 1,
      response_code: -1,
      response_description: -1,
    };

    await new SubscriptionModel().saveTransactionDetails(transactionDetails);

    let response = {
      subscription_id: subscriptionId,
    };

    return response;
  } catch (e: any) {
    return Error(e.toString());
  }
};

const initSubscriptionByOrder = async (req: any) => {
  try {
    //@ts-ignore
    let userId = req.session.id;
    let planRecordId = req.body.id;
    let planId = req.body.plan_id;
    let future = req.body.future;
    var transactionDate = new Date();
    let user = await new WolooGuestModel().getUserByID(userId);
    if (!user) throw "user not found";
    let planDetails = await new SubscriptionModel().fetchPlanDetails(
      planRecordId,
      planId,
      1,
      0
    );

    if (planDetails.length === 0) throw "Plan did not exists";
    let { price, currency, days, id } = planDetails[0];
    var subscriptionParams = {
      amount: price * 100,
      currency: currency,
    };
    var createOrder = await RazorpayUtils.createSubscriptionOrder(
      subscriptionParams
    );
    if (!createOrder.status) throw " RAZORPAY BAD_REQUEST_ERROR !";
    let subscriptionId = createOrder.id;
    let clientIp = getClientAddress(req);
    let { platform, actualCountry } = req.body.locale;
    let unitType = "subscription";
    let txnKeyOptions = [planId + "-"];
    let midLayerTransactionId = await RazorpayUtils.getTransactionId(
      "TXN_PREFIX",
      "WOLOO-",
      txnKeyOptions
    );
    let transactionDetails = {
      user_id: userId,
      client_ip: clientIp,
      platform: platform,
      country: actualCountry,
      actual_country: actualCountry,
      transaction_utc_datetime: transactionDate,
      transaction_id: midLayerTransactionId,
      request_type: "new",
      channel_tag: "razorpay",
      channel_name: "razorpay",
      super_store_id: -1,
      store_id: -1,
      parent_package_id: -1,
      package_id: -1,
      event_id: -1,
      product_id: -1,
      channel_id: -1,
      app_package_name: null,
      jetpay_txn_id: null,
      developer_payload: null,
      return_url: null,
      fail_return_url: null,
      jetpay_customer_identification_id: null,
      payload_hash: null,
      re_attempt: null,
      ios_original_txn_id: null,
      purchase_time: new Date(),
      is_auto_renewed: 0,
      unit_type: unitType,
      plan_id: planId,
      plan_type: unitType,
      currency: currency,
      transaction_amount: price,
      order_id: subscriptionId,
      charging_status: 1,
      response_code: -1,
      response_description: -1,
    };

    // console.log("transactionDetails........>", transactionDetails);
    let saveTransactionDetails =
      await new SubscriptionModel().saveTransactionDetails(transactionDetails);
    let response = {
      subscription_id: subscriptionId,
    };
    return response;
  } catch (e: any) {
    console.error("Execption ->", e);
    return Error(e.toString());
  }
};

const submitSubscriptionPurchase = async (
  userId: number,
  planId: string,
  paymentId: string,
  paymentSignature: any,
  orderId: string,
  future: number
) => {
  try {
    let userdetails = await new WolooGuestModel().getUserByID(userId);
    
    if (!userdetails) throw "User not exists";
    delete userdetails.email;
    delete userdetails.password;

    let sponsorUserId = userdetails.sponsor_id;
    let receivedBy = userdetails.name ? userdetails.name : userdetails.mobile;

    if (sponsorUserId) {
      let fetchByUserId =
        await new SubscriptionModel().fetchSubscriptionByUserId(userId);
      let referralPointsOnSubscription =
        await new SettingModel().referralPointsOnSubscription();

      if (fetchByUserId.length == 0) {
        let data = {
          user_id: sponsorUserId,
          type: "Gift Received",
          remarks: `Gift Received for referreing to ${receivedBy}`,
          value: referralPointsOnSubscription[0].value,
          transaction_type: "CR",
          is_gift: 1,
        };
        let createWallet = await new WalletModel().createWallet(data);
      }
    }
    let { expiry_date } = userdetails;
    let latestExpiryDate = moment(expiry_date, "DD-MM-YYYY");
    // console.log(expiry_date, " :expiry_date");

    const futureUserSubscription =
      await new WolooGuestModel().fetchUserSubscription(userdetails.id, 2);
    // console.log(futureUserSubscription, " :futureUserSubscription");

    if (futureUserSubscription && futureUserSubscription.length > 0) {
      for (const userSubscription of futureUserSubscription) {
        if (userSubscription.subscription_id) {
          const futureSubscription =
            await new SubscriptionModel().findSubscription(
              userSubscription.subscription_id
            );
          if (futureSubscription && futureSubscription.length > 0) {
            const subscriptionDetails = futureSubscription[0];
            let subscription_time = CommonUtils.convertToDaysAndMonths(
              subscriptionDetails.days
            );

            subscriptionDetails.days = Number(subscription_time.days);

            const subscriptionEndDate = moment(latestExpiryDate)
              .add(subscription_time, "days")
              .format("DD-MM-YYYY");

            latestExpiryDate = moment(subscriptionEndDate, "DD-MM-YYYY");
            // userSubscription[0].end_at = futureSubscriptionExpiryDate;
          }
        }
      }
    }

    let planDetails = await new SubscriptionModel().getPlanDetails(
      planId,
      1,
      0
    );

    if (planDetails.length === 0) throw "Plan details not found";
    planDetails = planDetails[0];
    let { id } = planDetails;
    let transactionExists = await new SubscriptionModel().transactionExists(
      userId,
      orderId,
      paymentId
    );
    if (transactionExists == true) throw "Transaction already exist!";
    let getpendingTransaction =
      await new SubscriptionModel().getpendingTransaction(userId, orderId);
    if (getpendingTransaction.length == 0) throw "Invalid Transaction Detail";
    if (
      getpendingTransaction.length === 0 ||
      getpendingTransaction[0].charging_status != 1
    )
      throw "Invalid Subscription Status !";
    getpendingTransaction = getpendingTransaction[0];
    var getRPPaymentDetails = await RazorpayUtils.fetchPaymentDetails(
      paymentId
    );
    getpendingTransaction.wallet_txn_id = paymentId;
    getpendingTransaction.purchase_token = paymentSignature;
    let transaction: any = {};
    if (
      getRPPaymentDetails.status &&
      getRPPaymentDetails.status == "captured"
    ) {
      let day = CommonUtils.convertToDaysAndMonths(planDetails.days);
      // let subscription_expiry_date = moment()
      //   .add(day.days, "day")
      //   .format("YYYY-MM-DD");
      let newExpiryDate = moment(latestExpiryDate).isValid()
        ? moment(latestExpiryDate)
        : moment();
      newExpiryDate = future
        ? newExpiryDate.add(day.days, "days")
        : moment().add(day.days, "days");
      let formattedExpiryDate = newExpiryDate.format("YYYY-MM-DD");

      let data = {
        user_id: userId,
        subscription_id: id,
        payment_id: getpendingTransaction.id,
        status: future ? 2 : 1,
      };
      let createUserSubscription =
        await new SubscriptionModel().createUserSubscription(data);

      let updateUserDetails;
      // console.log(formattedExpiryDate, " :formattedExpiryDate");

      if (!future)
        updateUserDetails = await new SubscriptionModel().updateUserDetails(
          userId,
          id,
          formattedExpiryDate
        );
      transaction.charging_status = 2;
      transaction.response_code = 200;
      transaction.response_description = getRPPaymentDetails.status;
    } else {
      transaction.charging_status = 0;
      transaction.response_code = 400;
      transaction.response_description = getRPPaymentDetails.status
        ? getRPPaymentDetails.status
        : "failed";
    }
    let transactionId: number = getpendingTransaction["id"];
    delete getpendingTransaction["id"];

    let savePendingTransaction =
      await new SubscriptionModel().updatePendingTransaction(
        transaction,
        transactionId
      );

    return userdetails;
  } catch (e: any) {
    console.log("Exception ", e);
    return Error(e.toString());
  }
};

const submitGiftSubscriptionPurchase = async (
  userId: number,
  planId: string,
  future: number
) => {
  try {
    let userdetails = await new WolooGuestModel().getUserByID(userId);
    if (!userdetails) throw "User not exists";
    // userdetails = userdetails[0];

    delete userdetails.email;
    delete userdetails.password;
    let giftCoinsCredit = await new WolooHostModel().giftCoinsCredit(userId);
    let giftCoinsDebit = await new WolooHostModel().giftCoinsDebit(userId);
    let totalGiftCoins =
      giftCoinsCredit[0].giftCoinsCredit - giftCoinsDebit[0].giftCoinsDebit;

    let planDetails = await new SubscriptionModel().getPlanDetails(
      planId,
      1,
      0
    );
    if (totalGiftCoins >= planDetails[0].price) {
      let transaction: any = {};
      (transaction.user_id = userId),
        (transaction.purchase_time = Date.now()),
        (transaction.unit_type = "subscription"),
        (transaction.plan_id = planId),
        (transaction.plan_type = "subscription"),
        (transaction.request_type = "new");
      transaction.order_id = "order_M5N3TiJQ9jDIPz";
      transaction.response_code = 200;
      transaction.response_description = "captured";
      transaction.platform = "android";
      transaction.country = "India";
      transaction.actual_country = "India";
      transaction.client_ip = "152.57.220.40";
      transaction.currency = "INR";
      transaction.user_order_id = null;
      transaction.deleted_at = null;
      transaction.transaction_id = "WOLOO-plan_GidSDbisuqi1dY-1614942912167";
      transaction.channel_tag = "gift_voucher";
      transaction.channel_name = "razorpay";
      transaction.super_store_id = -1;
      transaction.store_id = -1;
      transaction.parent_package_id = 1;
      transaction.package_id = -1;
      transaction.event_id = "-1";
      transaction.channel_id = "razorpay";
      transaction.re_attempt = 0;
      transaction.is_auto_renewed = 0;
      transaction.transaction_amount = "0";
      transaction.charging_status = 2;
      transaction.product_id = "-1";
      transaction.purchase_state = null;
      transaction.reciept = 2;

      let day = CommonUtils.convertToDaysAndMonths(planDetails[0].days);
      let subscription_expiry_date = moment()
        .add(day.days, "day")
        .format("YYYY-MM-DD");

      let saveTransaction =
        await new SubscriptionModel().saveTransactionDetails(transaction);
      let data = {
        user_id: userId,
        subscription_id: planDetails[0].id,
        payment_id: saveTransaction.insertId,
        status: future ? 2 : 1,
      };
      let createUserSubscription =
        await new SubscriptionModel().createUserSubscription(data);
      let updateUserDetails;
      if (!future)
        updateUserDetails = await new SubscriptionModel().updateUserDetails(
          userId,
          planDetails[0].id,

          subscription_expiry_date
        );

      let details = {
        user_id: userId,
        value: planDetails[0].price,
        transaction_type: "DR",
        is_gift: 1,
        remarks: "Subscription purchased by gift voucher",
        type: "Gift points deducted",
      };
      let insertWallet = await new WolooHostModel().insertWallet(details);
      return userdetails;
    } else {
      throw "No sufficient points !";
    }
  } catch (e: any) {
    console.log("Exception ", e);
    return Error(e.toString());
  }
};

const cancelSubscription = async (req: any) => {
  //@ts-ignore

  try {
    let userId = req.session.id;
    let cancelReason = req.body.cancel_reason;
    let remark = req.body.remark;

    let findsubscription = await new WolooGuestModel().findsubscription(
      userId,
      1
    );
    if (findsubscription.length < 1) {
      throw "Subscription not found !";
    }
    if (!findsubscription[0].payment_id) {
      throw "Payment id not found !";
    }

    let transactionDetail = await new SubscriptionModel().findTransactionDetail(
      findsubscription[0].payment_id
    );

    if (!transactionDetail[0].user_order_id) {
      throw "Order id not found !";
    }

    var cancelSub = await RazorpayUtils.cancelSubscription(
      transactionDetail[0].user_order_id
    );

    if (!cancelSub.status) {
      throw "Razorpay Error !";
    }

    let updateSubscription =
      await new SubscriptionModel().updateCancelledSubscription(
        2,
        cancelReason,
        remark,
        userId
      );
    if (updateSubscription == "error") {
      throw "SQL error !";
    }

    let response = {
      status: "cancelled !",
    };

    return response;
  } catch (e: any) {
    return Error(e.toString());
  }
};

const userSubscriptionStatus = async (req: any) => {
  try {
    let userId = req.session.id;
    let user = await new WolooGuestModel().getUserByID(userId);
    if (!user) throw "user not found";
    // user = user[0];
    let purchase_by = null;
    let active_end_at;
    let activeSubscription;
    let subscription;

    if (user.subscription_id) {
      subscription = await new SubscriptionModel().fetchSubscriptionDetails(
        user.subscription_id
      );

      activeSubscription = await new SubscriptionModel().UserSubscription(
        user.id
      );

      if (activeSubscription) {
        let is_cancel = activeSubscription.is_expired
          ? activeSubscription.is_expired == 2 ||
            activeSubscription.is_expired == 1
            ? true
            : false
          : false;

        let activeSubscriptionPaymentDetails =
          await new SubscriptionModel().fetchTransactionDetail(
            activeSubscription.payment_id
          );
        let subscription_time = CommonUtils.convertToDaysAndMonths(
          subscription.days
        );
        activeSubscription = subscription;

        activeSubscription.days = Number(subscription_time.days);

        purchase_by = activeSubscriptionPaymentDetails
          ? activeSubscriptionPaymentDetails.channel_name
          : null;

        if (
          activeSubscriptionPaymentDetails &&
          activeSubscriptionPaymentDetails.created_at
        ) {
          let days = CommonUtils.convertToDaysAndMonths(
            activeSubscription.days
          );

          let start_at = moment(
            activeSubscriptionPaymentDetails.created_at
          ).format("DD-MM-YYYY");

          var endAt = new Date(
            moment(activeSubscriptionPaymentDetails.created_at).toString()
          );
          endAt.setDate(endAt.getDate() + days.days);

          let end_at = moment(endAt).format("DD-MM-YYYY");

          active_end_at = activeSubscriptionPaymentDetails.created_at;
          activeSubscription.start_at = start_at;
          activeSubscription.end_at = end_at;
        }

        activeSubscription.is_cancel = is_cancel;
      } else {
        activeSubscription = await new SubscriptionModel().fetchSubscription(
          0,
          0,
          0
        );
        if (activeSubscription) {
          activeSubscription.start_at = moment(user.created_at).format(
            "DD-MM-YYYY"
          );
          activeSubscription.end_at = moment(user.expiry_date).format(
            "DD-MM-YYYY"
          );
        }
      }
    } else if (user.voucher_id) {
      let voucher = await new VoucherModel().fetchByVoucherId(user.voucher_id);
      if (voucher) {
        subscription = await new SubscriptionModel().getSubscription(
          voucher.subscriptions_id
        );

        let corporate = await new CorporateModel().findByCorporateId(
          voucher.corporate_id
        );

        if (subscription) {
          let subscription_time = CommonUtils.convertToDaysAndMonths(
            subscription.days
          );
          activeSubscription = subscription;

          activeSubscription.days = Number(subscription_time.days);

          let userVoucher = await new VoucherModel().fetchUserVoucherCode(
            voucher.id,
            user.id
          );

          if (userVoucher) {
            activeSubscription.start_at = moment(userVoucher.created_at).format(
              "DD-MM-YYYY"
            );
            if (voucher.lifetime_free) {
              activeSubscription.end_at = "-";
            } else {
              activeSubscription.end_at = moment(user.expiry_date).format(
                "DD-MM-YYYY"
              );
            }
          }
          if (corporate) {
            activeSubscription.corporate_name = corporate.name;
          }
        } else {
          activeSubscription = await new SubscriptionModel().fetchSubscription(
            0,
            0,
            0
          );
          if (activeSubscription) {
            activeSubscription.start_at = moment(user.created_at).format(
              "DD-MM-YYYY"
            );

            activeSubscription.end_at = moment(user.expiry_date).format(
              "DD-MM-YYYY"
            );
          }
        }
      }
    } else if (user.gift_subscription_id) {
      subscription =
        await new SubscriptionModel().fetchSubscriptionByGiftSubscriptionId(
          user.gift_subscription_id
        );

      if (subscription) {
        activeSubscription = subscription;

        let subscription_time = CommonUtils.convertToDaysAndMonths(
          activeSubscription.days
        );
        activeSubscription.days = Number(subscription_time.days);
        let userGift = await new SubscriptionModel().fetchUserRazorpayDetails(
          user.id
        );

        if (userGift) {
          activeSubscription.start_at = moment(userGift.created_at).format(
            "DD-MM-YYYY"
          );

          var endAt = new Date(moment(userGift.created_at).toString());
          endAt.setDate(endAt.getDate() + subscription_time.days);
          let end_at = moment(endAt).format("DD-MM-YYYY");

          activeSubscription.end_at = end_at;

          let gifted_by = await new WolooGuestModel().fetchUserByID(
            userGift.user_id
          );

          if (gifted_by) {
            activeSubscription.gifted_by = gifted_by.name;
          }
        }
      } else {
        activeSubscription = await new SubscriptionModel().fetchSubscription(
          0,
          0,
          0
        );
        if (activeSubscription) {
          activeSubscription.start_at = moment(user.created_at).format(
            "DD-MM-YYYY"
          );
          activeSubscription.end_at = moment(user.expiry_date).format(
            "DD-MM-YYYY"
          );
        }
      }
    } else {
      activeSubscription = await new SubscriptionModel().fetchSubscription(
        0,
        0,
        0
      );

      if (activeSubscription) {
        activeSubscription.start_at = moment(user.created_at).format(
          "DD-MM-YYYY"
        );

        activeSubscription.end_at = moment(user.expiry_date).format(
          "DD-MM-YYYY"
        );
      }
    }

    let futureUserSubscription =
      await new WolooGuestModel().fetchUserSubscription(user.id, 2);

    let futureSubscription = null;
    if (futureUserSubscription) {
      if (futureUserSubscription.subscription_id) {
        let futureSubscriptionPaymentDetails =
          await new SubscriptionModel().fetchTransactionDetails(
            futureUserSubscription.payment_id
          );

        futureSubscription = await new SubscriptionModel().findSubscription(
          futureUserSubscription.subscription_id
        );
        if (futureSubscription) {
          let subscription_time = CommonUtils.convertToDaysAndMonths(
            futureSubscription[0].days
          );
          futureSubscription[0].days = Number(subscription_time.days);

          if (active_end_at) {
            let days = CommonUtils.convertToDaysAndMonths(
              futureSubscription[0].days
            );

            let start_at = moment(active_end_at).format("DD-MM-YYYY");

            var endAt = new Date(moment(active_end_at).toString());
            endAt.setDate(endAt.getDate() + days.days);
            let end_at = moment(endAt).format("DD-MM-YYYY");

            futureSubscription[0].start_at = start_at;
            futureSubscription[0].end_at = end_at;
          }
        }
      }
    }

    let response = {
      userData: user ? user : {},
      planData: activeSubscription ? activeSubscription : {},
      futureSubscription: futureSubscription ? futureSubscription[0] : {},
    };

    return response;
  } catch (e: any) {
    return Error(e.toString());
  }
};

// const mySubscription = async (req: any) => {
//   //@ts-ignore
//   try {
//     let userId = req.session.id;
//     let user = await new WolooGuestModel().getUserByID(userId);
//     if (user.length === 0) throw "User not Found";
//     user = user[0];
//     let { expiry_date } = user;
//     let purchase_by = null;
//     let active_end_at;
//     let activeSubscription;
//     let subscription;
//     if (user.subscription_id) {
//       //get subscription details
//       subscription = await new SubscriptionModel().fetchSubscriptionDetails(
//         user.subscription_id
//       );

//       activeSubscription = await new SubscriptionModel().UserSubscription(
//         user.id
//       );

//       if (activeSubscription.length) {
//         activeSubscription = activeSubscription[0];

//         let is_cancel =
//           activeSubscription.is_expired == 2 ||
//           activeSubscription.is_expired == 1
//             ? true
//             : false;
//         let activeSubscriptionPaymentDetails =
//           await new SubscriptionModel().fetchTransactionDetail(
//             activeSubscription.payment_id
//           );
//         let subscription_time = CommonUtils.convertToDaysAndMonths(
//           subscription.days
//         );
//         activeSubscription = subscription;
//         activeSubscription.frequency =
//           activeSubscription.frequency == "0"
//             ? "FREE TRIAL"
//             : activeSubscription.frequency;

//         activeSubscription.days = Number(subscription_time.days);

//         purchase_by = activeSubscriptionPaymentDetails
//           ? activeSubscriptionPaymentDetails.channel_name
//           : null;

//         if (
//           activeSubscriptionPaymentDetails &&
//           activeSubscriptionPaymentDetails.created_at
//         ) {
//           active_end_at = activeSubscriptionPaymentDetails.created_at;
//           activeSubscription.start_at = moment(activeSubscriptionPaymentDetails.created_at).format("DD-MM-YYYY");
//           activeSubscription.end_at = moment(user.expiry_date).format("DD-MM-YYYY");
//         }
//         activeSubscription.is_cancel = is_cancel;
//       } else {
//         activeSubscription = await new SubscriptionModel().fetchSubscription(
//           0,
//           0,
//           0
//         );

//         if (activeSubscription) {
//           activeSubscription.frequency =
//             activeSubscription.frequency == "0"
//               ? "FREE TRIAL"
//               : activeSubscription.frequency;
//           activeSubscription.days = Number(activeSubscription.days);
//           activeSubscription.start_at = moment(user.created_at).format(
//             "DD-MM-YYYY"
//           );
//           activeSubscription.end_at = moment(user.expiry_date).format(
//             "DD-MM-YYYY"
//           );
//         }
//       }
//     } else if (user.voucher_id) {
//       let voucher = await new VoucherModel().fetchByVoucherId(user.voucher_id);

//       if (voucher) {
//         subscription = await new SubscriptionModel().getSubscription(
//           voucher.subscriptions_id
//         );

//         let corporate = await new CorporateModel().findByCorporateId(
//           voucher.corporate_id
//         );

//         if (subscription) {
//           let subscription_time = CommonUtils.convertToDaysAndMonths(
//             subscription.days
//           );
//           activeSubscription = subscription;
//           activeSubscription.days = Number(subscription_time.days);
//           activeSubscription.frequency =
//             activeSubscription.frequency == "0"
//               ? "FREE TRIAL"
//               : activeSubscription.frequency;

//           let userVoucher = await new VoucherModel().fetchUserVoucherCode(
//             voucher.id,
//             user.id
//           );

//           if (userVoucher) {
//             activeSubscription.start_at = moment(userVoucher.created_at).format(
//               "DD-MM-YYYY"
//             );
//             if (voucher.lifetime_free) {
//               activeSubscription.end_at = "-";
//             } else {
//               activeSubscription.end_at = moment(user.expiry_date).format(
//                 "DD-MM-YYYY"
//               );
//             }
//           }
//           if (corporate) {
//             activeSubscription.corporate_name = corporate.name;
//           }
//         } else {
//           activeSubscription = await new SubscriptionModel().fetchSubscription(
//             0,
//             0,
//             0
//           );

//           if (activeSubscription) {
//             activeSubscription.frequency =
//               activeSubscription.frequency == "0"
//                 ? "FREE TRIAL"
//                 : activeSubscription.frequency;
//             activeSubscription.days = Number(activeSubscription.days);
//             activeSubscription.start_at = moment(user.created_at).format(
//               "DD-MM-YYYY"
//             );
//             activeSubscription.end_at = moment(user.expiry_date).format(
//               "DD-MM-YYYY"
//             );
//           }
//         }
//       }
//     } else if (user.gift_subscription_id) {
//       subscription =
//         await new SubscriptionModel().fetchSubscriptionByGiftSubscriptionId(
//           user.gift_subscription_id
//         );

//       if (subscription) {
//         let subscription_time = CommonUtils.convertToDaysAndMonths(
//           subscription.days
//         );
//         activeSubscription = subscription;

//         activeSubscription.days = Number(subscription_time.days);
//         activeSubscription.frequency =
//           activeSubscription.frequency == "0"
//             ? "FREE TRIAL"
//             : activeSubscription.frequency;

//         let userGift = await new SubscriptionModel().fetchUserRazorpayDetails(
//           user.id
//         );

//         if (userGift) {
//           let days = CommonUtils.convertToDaysAndMonths(subscription.days);

//           let endAt = new Date(moment(userGift.created_at).toString());
//           endAt.setDate(endAt.getDate() + days.days);

//           activeSubscription.start_at = moment(userGift.created_at).format(
//             "DD-MM-YYYY"
//           );
//           activeSubscription.end_at = moment(endAt).format("DD-MM-YYYY");

//           activeSubscription.gifted_by = "";
//           let gifted_by = await new WolooGuestModel().fetchUserByID(
//             userGift.user_id
//           );

//           if (gifted_by) {
//             activeSubscription.gifted_by = gifted_by.name;
//           }
//         }
//       } else {
//         activeSubscription = await new SubscriptionModel().fetchSubscription(
//           0,
//           0,
//           0
//         );

//         var start_at = moment(user.created_at).format("DD-MM-YYYY");

//         var end_at = moment(user.expiry_date).format("DD-MM-YYYY");

//         if (activeSubscription) {
//           activeSubscription.frequency =
//             activeSubscription.frequency == "0"
//               ? "FREE TRIAL"
//               : activeSubscription.frequency;
//           activeSubscription.days = Number(activeSubscription.days);
//           activeSubscription.start_at = start_at;
//           activeSubscription.end_at = end_at;
//         }
//       }
//     } else {
//       activeSubscription = await new SubscriptionModel().fetchSubscription(
//         0,
//         0,
//         0
//       );

//       if (activeSubscription) {
//         activeSubscription.frequency =
//           activeSubscription.frequency == "0"
//             ? "FREE TRIAL"
//             : activeSubscription.frequency;
//         activeSubscription.days = Number(activeSubscription.days);
//         activeSubscription.start_at = moment(user.created_at).format(
//           "DD-MM-YYYY"
//         );
//         activeSubscription.end_at = moment(user.expiry_date).format(
//           "DD-MM-YYYY"
//         );
//       }
//     }

//     let futureUserSubscription =
//       await new WolooGuestModel().fetchUserSubscription(user.id, 2);
//     let futureSubscription = null;
//     if (futureUserSubscription) {
//       if (futureUserSubscription.subscription_id) {
//         let futureSubscriptionPaymentDetails =
//           await new SubscriptionModel().fetchTransactionDetails(
//             futureUserSubscription.payment_id
//           );

//         futureSubscription = await new SubscriptionModel().findSubscription(
//           futureUserSubscription.subscription_id
//         );

//         if (futureSubscription) {
//           let subscription_time = CommonUtils.convertToDaysAndMonths(
//             futureSubscription[0].days
//           );

//           futureSubscription[0].days = Number(subscription_time.days);

//           let futureSubscriptionExpiryDate = moment(expiry_date)
//             .add(subscription_time, "days")
//             .format("DD-MM-YYYY");

//           futureSubscription[0].frequency =
//             futureSubscription[0].frequency == "0"
//               ? "FREE TRIAL"
//               : futureSubscription[0].frequency;

//           futureSubscription[0].start_at = moment(expiry_date)
//             .add(1, "days")
//             .format("DD-MM-YYYY");

//           futureSubscription[0].end_at = futureSubscriptionExpiryDate;
//         }
//       }
//     }

//     let response = {
//       activeSubscription: activeSubscription ? activeSubscription : null,
//       futureSubscription: futureSubscription ? futureSubscription[0] : null,
//       purchase_by: purchase_by,
//     };

//     console.log(response);
//     return response;
//   } catch (e: any) {
//     return Error(e.toString());
//   }
// };

const mySubscription = async (req: any) => {
  //@ts-ignore
  try {
    let userId = req.session.id;

    let user = await new WolooGuestModel().getUserByID(userId);
    if (!user) throw "User not Found";
    let { expiry_date } = user;
    let purchase_by = null;
    let active_end_at;
    let activeSubscription;
    let subscription;

    if (user.subscription_id && !user.voucher_id) {
      //get subscription details
      subscription = await new SubscriptionModel().fetchSubscriptionDetails(
        user.subscription_id
      );

      activeSubscription = await new SubscriptionModel().UserSubscription(
        user.id
      );

      if (activeSubscription.length) {
        activeSubscription = activeSubscription[0];

        let is_cancel =
          activeSubscription.is_expired == 2 ||
          activeSubscription.is_expired == 1
            ? true
            : false;
        let activeSubscriptionPaymentDetails =
          await new SubscriptionModel().fetchTransactionDetail(
            activeSubscription.payment_id
          );
        let subscription_time = CommonUtils.convertToDaysAndMonths(
          subscription.days
        );
        activeSubscription = subscription;
        activeSubscription.frequency =
          activeSubscription.frequency == "0"
            ? "FREE TRIAL"
            : activeSubscription.frequency;

        activeSubscription.days = Number(subscription_time.days);

        purchase_by = activeSubscriptionPaymentDetails
          ? activeSubscriptionPaymentDetails.channel_name
          : null;

        if (
          activeSubscriptionPaymentDetails &&
          activeSubscriptionPaymentDetails.created_at
        ) {
          activeSubscription.start_at = moment(
            activeSubscriptionPaymentDetails.created_at
          ).format("DD-MM-YYYY");
          activeSubscription.end_at = moment(user.expiry_date).format(
            "DD-MM-YYYY"
          );
        }
        activeSubscription.is_cancel = is_cancel;
      } else {
        activeSubscription = await new SubscriptionModel().fetchSubscription(
          0,
          0,
          0
        );

        if (activeSubscription) {
          activeSubscription.frequency =
            activeSubscription.frequency == "0"
              ? "FREE TRIAL"
              : activeSubscription.frequency;
          activeSubscription.days = Number(activeSubscription.days);
          activeSubscription.start_at = moment(user.created_at).format(
            "DD-MM-YYYY"
          );
          activeSubscription.end_at = moment(user.expiry_date).format(
            "DD-MM-YYYY"
          );
        }
      }
    } else if (!user.subscription_id && user.voucher_id) {
      let voucher = await new VoucherModel().fetchByVoucherId(user.voucher_id);

      if (voucher) {
        subscription = await new SubscriptionModel().getSubscription(
          voucher.subscriptions_id
        );

        let corporate = await new CorporateModel().findByCorporateId(
          voucher.corporate_id
        );

        if (subscription) {
          let subscription_time = CommonUtils.convertToDaysAndMonths(
            subscription.days
          );
          activeSubscription = subscription;
          activeSubscription.days = Number(subscription_time.days);
          activeSubscription.frequency =
            activeSubscription.frequency == "0"
              ? "FREE TRIAL"
              : activeSubscription.frequency;

          let userVoucher = await new VoucherModel().fetchUserVoucherCode(
            voucher.id,
            user.id
          );

          if (userVoucher) {
            activeSubscription.start_at = moment(userVoucher.created_at).format(
              "DD-MM-YYYY"
            );
            if (voucher.lifetime_free) {
              activeSubscription.end_at = "-";
            } else {
              activeSubscription.end_at = moment(user.expiry_date).format(
                "DD-MM-YYYY"
              );
            }
          }
          if (corporate) {
            activeSubscription.corporate_name = corporate.name;
          }
        } else {
          activeSubscription = await new SubscriptionModel().fetchSubscription(
            0,
            0,
            0
          );

          if (activeSubscription) {
            activeSubscription.frequency =
              activeSubscription.frequency == "0"
                ? "FREE TRIAL"
                : activeSubscription.frequency;
            activeSubscription.days = Number(activeSubscription.days);
            activeSubscription.start_at = moment(user.created_at).format(
              "DD-MM-YYYY"
            );
            activeSubscription.end_at = moment(user.expiry_date).format(
              "DD-MM-YYYY"
            );
          }
        }
      }
    } else if (!user.subscription_id && !user.voucher_id && user.expiry_date) {
      subscription = await new SubscriptionModel().fetchSubscriptionDetails(1);

      activeSubscription = subscription;

      if (activeSubscription) {
        let is_cancel =
          activeSubscription.is_expired == 2 ||
          activeSubscription.is_expired == 1
            ? true
            : false;

        let subscription_time = CommonUtils.convertToDaysAndMonths(
          subscription.days
        );

        activeSubscription.days = Number(subscription_time.days);

        purchase_by = null;
        activeSubscription.start_at = moment(user.created_at).format(
          "DD-MM-YYYY"
        );
        activeSubscription.end_at = moment(user.expiry_date).format(
          "DD-MM-YYYY"
        );

        activeSubscription.is_cancel = is_cancel;
      }
    }

    let futureUserSubscription =
      await new WolooGuestModel().fetchUserSubscription(user.id, 2);
    const processedFutureSubscriptions = [];
    let latestExpiryDate = moment(user.expiry_date, "DD-MM-YYYY");
    if (futureUserSubscription && futureUserSubscription.length > 0) {
      for (const userSubscription of futureUserSubscription) {
        if (userSubscription.subscription_id) {
          const futureSubscription =
            await new SubscriptionModel().findSubscription(
              userSubscription.subscription_id
            );
          if (futureSubscription && futureSubscription.length > 0) {
            const subscriptionDetails = futureSubscription[0];
            let subscription_time = CommonUtils.convertToDaysAndMonths(
              subscriptionDetails.days
            );
            const startDate = latestExpiryDate
              .clone()
              .add(1, "days")
              .format("DD-MM-YYYY");
            const endDate = latestExpiryDate
              .clone()
              .add(1, "days")
              .add(subscription_time.days, "days")
              .format("DD-MM-YYYY");
            subscriptionDetails.days = Number(subscription_time.days);
            subscriptionDetails.frequency =
              subscriptionDetails.frequency === "0"
                ? "FREE TRIAL"
                : subscriptionDetails.frequency;
            subscriptionDetails.start_at = startDate;
            subscriptionDetails.end_at = endDate;
            latestExpiryDate = moment(endDate, "DD-MM-YYYY");
            processedFutureSubscriptions.push(subscriptionDetails);
          }
        }
      }
    }

    let response = {
      activeSubscription: activeSubscription ? activeSubscription : null,
      futureSubscription: processedFutureSubscriptions
        ? processedFutureSubscriptions
        : null,
      purchase_by: purchase_by,
    };

    return response;
  } catch (e: any) {
    return Error(e.toString());
  }
};

export default {
  createSubscription,
  fetchAllSubscription,
  fetchAllSubscriptionCount,
  fetchSubscriptionById,
  deleteSubscription,
  updateSubscription,
  bulkDeleteSubscription,
  isInsurance,
  fetchSubscriptionPlan,
  isFutureSubscriptionExist,
  initSubscription,
  initSubscriptionByOrder,
  submitSubscriptionPurchase,
  cancelSubscription,
  userSubscriptionStatus,
  mySubscription,
  submitGiftSubscriptionPurchase,
};
