import { Joi, Segments } from "celebrate";
export default {
fetchAllFranchies: {
    [Segments.BODY]: Joi.object({
      pageSize: Joi.number().required(),
      pageIndex: Joi.number().required(),
      query: Joi.string().min(0),
      sort: Joi.object(),
    }).unknown(),
    [Segments.HEADERS]: Joi.object({
      "x-woloo-token": Joi.string().min(1).required(),
    }).unknown(),
  }
}