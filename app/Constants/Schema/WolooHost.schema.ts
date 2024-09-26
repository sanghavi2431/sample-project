import { Joi, Segments } from "celebrate";
export default {
  fetchWolooHost: {
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


  submitReview: {
    [Segments.BODY]: Joi.object({
      woloo_id: Joi.number().optional(),
      rating: Joi.number().optional(),
      rating_option: Joi.array().min(1).optional(),
    }).unknown(),
  },

  deleteWolooHostById: {
    [Segments.QUERY]: Joi.object({
      id: Joi.number().required().min(1).message("Please enter ID"),
    }).unknown(),
  },

  fetchWolooHostById: {
    [Segments.HEADERS]: Joi.object({
      "x-woloo-token": Joi.string().min(1).required(),
    }).unknown(),
    [Segments.QUERY]: Joi.object({
      id: Joi.number().required().min(1).message("Please enter ID"),
    }).unknown(),
  },

  updateWolooHost: {
    [Segments.HEADERS]: Joi.object({
      "x-woloo-token": Joi.string().min(1).required(),
    }).unknown(),
  },
};
