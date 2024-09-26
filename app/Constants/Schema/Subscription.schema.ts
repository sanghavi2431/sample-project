import { Joi, Segments } from "celebrate";
export default {
  fetchAllSubscription: {
    [Segments.HEADERS]: Joi.object({
      "x-woloo-token": Joi.string().min(1).required(),
    }).unknown(),
    [Segments.BODY]: Joi.object({
      pageSize: Joi.number().required(),
      pageIndex: Joi.number().required(),
    }).unknown(),
  },

  deleteSubscription: {
    [Segments.HEADERS]: Joi.object({
      "x-woloo-token": Joi.string().min(1).required(),
    }).unknown(),
    [Segments.QUERY]: {
      id: Joi.number().required(),
    },
  },

  bulkDeleteSubscription: {
    [Segments.HEADERS]: Joi.object({
      "x-woloo-token": Joi.string().min(1).required(),
    }).unknown(),
    [Segments.BODY]: Joi.object({
      id: Joi.array().items(Joi.number().required()),
    }).unknown(),
  },
  fetchSubscriptionById: {
    [Segments.QUERY]: {
      id: Joi.number().required(),
    },
    [Segments.HEADERS]: Joi.object({
      "x-woloo-token": Joi.string().min(1).required(),
    }).unknown(),
  },

  isInsurance: {
    [Segments.QUERY]: {
      id: Joi.number().required(),
    },
    [Segments.HEADERS]: Joi.object({
      "x-woloo-token": Joi.string().min(1).required(),
    }).unknown(),
  },

  initSubscription: {
    [Segments.BODY]: Joi.object({
      id: Joi.number().required(),
      plan_id: Joi.string().required(),
      future: Joi.number().required(),
    }).unknown(),

    [Segments.HEADERS]: Joi.object({
      "x-woloo-token": Joi.string().min(1).required(),
    }).unknown(),
  },

  initSubscriptionByOrder: {
    [Segments.BODY]: Joi.object({
      id: Joi.number().required(),
      plan_id: Joi.string().required(),
    }).unknown(),

    [Segments.HEADERS]: Joi.object({
      "x-woloo-token": Joi.string().min(1).required(),
    }).unknown(),
  },

  submitSubscriptionPurchase: {
    [Segments.BODY]: Joi.object({
      plan_id: Joi.string().required(),
      payment_id: Joi.string().optional(),
      order_id: Joi.string().optional(),
    }).unknown(),

    [Segments.HEADERS]: Joi.object({
      "x-woloo-token": Joi.string().min(1).required(),
    }).unknown(),
  },

  cancelSubscription: {
    [Segments.BODY]: Joi.object({
      cancel_reason: Joi.string().required(),
      remark: Joi.string(),
    }).unknown(),

    [Segments.HEADERS]: Joi.object({
      "x-woloo-token": Joi.string().min(1).required(),
    }).unknown(),
  },

  updateSubscription: {
    [Segments.HEADERS]: Joi.object({
      "x-woloo-token": Joi.string().min(1).required(),
    }).unknown(),
  },
};
