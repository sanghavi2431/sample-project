import { Joi, Segments } from "celebrate";
export default {
  fetchAllVoucher: {
    [Segments.HEADERS]: Joi.object({
      "x-woloo-token": Joi.string().min(1).required(),
    }).unknown(),
    [Segments.BODY]: Joi.object({
      pageSize: Joi.number().required(),
      pageIndex: Joi.number().required(),
    }).unknown(),
  },

  fetchVoucherUsers: {
    [Segments.HEADERS]: Joi.object({
      "x-woloo-token": Joi.string().min(1).required(),
    }).unknown(),
    [Segments.BODY]: Joi.object({
      pageSize: Joi.number().required(),
      pageIndex: Joi.number().required(),
      id: Joi.number().required(),
    }).unknown(),
  },

  fetchVoucherById: {
    [Segments.QUERY]: {
      id: Joi.number().required(),
    },
    [Segments.HEADERS]: Joi.object({
      "x-woloo-token": Joi.string().min(1).required(),
    }).unknown(),
  },
  deleteVoucher: {
    [Segments.HEADERS]: Joi.object({
      "x-woloo-token": Joi.string().min(1).required(),
    }).unknown(),
    [Segments.QUERY]: {
      id: Joi.number().required(),
    },
  },

  deactivateVoucher: {
    [Segments.BODY]: {
      voucher_id: Joi.number().min(1).required(),
      user_id: Joi.number().min(1).required(),
    },
  },

  createVoucher: {
    [Segments.BODY]: {
      corporate_id: Joi.number().min(1).required(),
      expiry: Joi.string().required(),
      value: Joi.number().min(0).required(),
      lifetime_free: Joi.number().required(),
      type_of_organization: Joi.string().min(1).required(),
      type_of_voucher: Joi.string().min(1).required(),
      days: Joi.number().required(),
      discount_percentage: Joi.number().required(),
      subscriptions_id: Joi.number().required(),
      number_of_uses: Joi.number().min(1).max(1000).required(),
    },
    [Segments.HEADERS]: Joi.object({
      "x-woloo-token": Joi.string().min(1).required(),
    }).unknown(),
  },

  noOfUsesVoucher: {
    [Segments.HEADERS]: Joi.object({
      "x-woloo-token": Joi.string().min(1).required(),
    }).unknown(),
    [Segments.QUERY]: {
      id: Joi.number().required(),
    },
  },

  getVoucherUser: {
    [Segments.HEADERS]: Joi.object({
      "x-woloo-token": Joi.string().min(1).required(),
    }).unknown(),
    [Segments.QUERY]: {
      id: Joi.number().required(),
    },
  },

  voucherApply: {
    [Segments.HEADERS]: Joi.object({
      "x-woloo-token": Joi.string().min(1).required(),
    }).unknown(),
    [Segments.BODY]: {
      voucher: Joi.string().required(),
      forceApply: Joi.boolean(),
    },
  },

  fetchCorporateForVoucherDetails: {
    [Segments.HEADERS]: Joi.object({
      "x-woloo-token": Joi.string().min(1).required(),
    }).unknown(),
  },

  getPriceByID: {
    [Segments.HEADERS]: Joi.object({
      "x-woloo-token": Joi.string().min(1).required(),
    }).unknown(),
    [Segments.QUERY]: {
      id: Joi.number().required(),
    },
  },
  bulkDeleteVoucher: {
    [Segments.HEADERS]: Joi.object({
      "x-woloo-token": Joi.string().min(1).required(),
    }).unknown(),
    [Segments.BODY]: {
      id: Joi.array().min(1).required(),
    },
  },

  // bulkDeleteVoucher: {
  //   [Segments.HEADERS]: Joi.object({
  //     "x-woloo-token": Joi.string().min(1).required(),
  //   }).unknown(),
  //   [Segments.BODY]: {
  //     id: Joi.array().min(1).required(),
  //   },
  // },

  fetchSubscriptionForVoucherDetails: {
    [Segments.HEADERS]: Joi.object({
      "x-woloo-token": Joi.string().min(1).required(),
    }).unknown(),
  },
};
