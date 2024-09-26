import { Transactions } from "./../Models/Transactions";

const Razorpay = require("razorpay");
import config from "../config";

const getinstance = () => {
  const instance = new Razorpay({
    key_id: config.razorpay.key,
    key_secret: config.razorpay.secret,
  });
  return instance;
};

const createPaymentLink = async (
  amount: number,
  customer: any,
  callback_url: any,
  callback_method: any,
  description: any
) => {
  const instance = getinstance();
  const response = await instance.paymentLink.create({
    amount: amount,
    currency: "INR",
    accept_partial: false,
    // first_min_partial_amount: amount,
    description: description,
    customer: {
      name: customer.name,
      email: customer.email,
      contact: customer.mobile,
    },
    notify: {
      sms: true,
      email: true,
    },
    reminder_enable: true,
    callback_url: callback_url,
    callback_method: callback_method,
  });
  return response;
};

const createSubscription = async (
  period: any,
  interval: number,
  name: any,
  amount: number,
  description: any
) => {
  interval = interval ? interval : 1;
  const instance = getinstance();
  console.log({
    period: period,
    interval: interval,
    item: {
      name: name,
      amount: amount,
      currency: "INR",
      description: description,
    },
  });
  const result = instance.plans.create({
    period: period,
    interval: interval,
    item: {
      name: name,
      amount: amount,
      currency: "INR",
      description: description,
    },
  });
  return result;
};

const createUserSubscription = async (data: any) => {
  try {
    const createSubscription = await getinstance().subscriptions.create(data);

    return createSubscription;
  } catch (e) {
    return e;
  }
};

const canceSubscription = async () => {};

const createOrder = async (amount: number) => {
  const instance = getinstance();

  const result = await instance.orders.create({
    amount: amount,
    currency: "INR",
    payment_capture: 1,
  });

  return result;
};

const createSubscriptionOrder = async (data: any) => {
  try {
    const instance = getinstance();

    const result = await instance.orders.create(data);

    return result;
  } catch (e) {
    return e;
  }
};

const getTransactionId = async (
  TXN_PREFIX: any,
  WOLOO: any,
  txnKeyOptions: any
) => {
  let transactionId = TXN_PREFIX + WOLOO + txnKeyOptions + Date.now();
  return transactionId;
};

const fetchOrderDetails = async (subscriptionId: any) => {
  try {
    const instance = getinstance();

    const result = await instance.orders.fetch(subscriptionId);

    return result;
  } catch (e) {
    console.log("e", e);
    return e;
  }
};

const fetchPaymentDetails = async (paymentId: any) => {
  try {
    const instance = getinstance();

    const result = await instance.payments.fetch(paymentId);

    return result;
  } catch (e) {
    console.log("e", e);
    return e;
  }
};

const cancelSubscription = async (userOrderId: any) => {
  try {
    const instance = getinstance();

    const result = await instance.subscriptions.cancel(userOrderId);

    return result;
  } catch (e) {
    return e;
  }
};

export default {
  createPaymentLink,
  createSubscription,
  createOrder,
  createUserSubscription,
  getTransactionId,
  createSubscriptionOrder,
  fetchOrderDetails,
  fetchPaymentDetails,
  cancelSubscription,
};
