import { Joi, Segments } from "celebrate";
export default {
  fetchAllBlogs: {
    [Segments.BODY]: Joi.object({
      pageSize: Joi.number().required(),
      pageIndex: Joi.number().required(),
      query: Joi.string().min(0),
      sort: Joi.object(),
    }).unknown(),
    [Segments.HEADERS]: Joi.object({
      "x-woloo-token": Joi.string().min(1).required(),
    }).unknown(),
  },
  fetchAllCategory: {
    [Segments.BODY]: Joi.object({
      pageSize: Joi.number().required(),
      pageIndex: Joi.number().required(),
      query: Joi.string().min(0),
      sort: Joi.object(),
    }).unknown(),
    [Segments.HEADERS]: Joi.object({
      "x-woloo-token": Joi.string().min(1).required(),
    }).unknown(),
  },

  ecomCoinUpdate: {
    [Segments.BODY]: Joi.object({
      type: Joi.string().required(),
      coins: Joi.string().required(),
      orderid: Joi.required()

    }).unknown(),
    [Segments.HEADERS]: Joi.object({
      "x-woloo-token": Joi.string().min(1).required(),
    }).unknown(),

  },

  ecomTransactionFail: {
    [Segments.BODY]: Joi.object({
      transaction_id: Joi.number().required(),
      type: Joi.string().required(),
    }).unknown(),
    [Segments.HEADERS]: Joi.object({
      "x-woloo-token": Joi.string().min(1).required(),
    }).unknown(),

  }
}  