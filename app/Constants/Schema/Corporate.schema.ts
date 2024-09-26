import { Joi, Segments } from "celebrate";
export default {
  addCorporate: {
    [Segments.BODY]: Joi.object({
      name: Joi.string().min(1).required(),
      contact_name: Joi.string().required(),
      email: Joi.string().email().required(),

      mobile: Joi.number()
        .integer()
        .min(10 ** 9)
        .max(10 ** 10 - 1)
        .required()
        .messages({
          "number.min": "Mobile number should be 10 digit.",
          "number.max": "Mobile number should be 10 digit",
        }),

      address: Joi.string().required(),

      city: Joi.string().min(1).max(32).required(),
      type: Joi.string().min(1).max(32).required(),
      status: Joi.number(),
    }).unknown(),
   },

  getCorporates: {
    [Segments.HEADERS]: Joi.object({
      "x-woloo-token": Joi.string().min(1).required(),
    }).unknown(),
    [Segments.BODY]: Joi.object({
      pageSize: Joi.number().required(),
      pageIndex: Joi.number().required(),
    }).unknown(),
  },

  deleteCorporates: {
    [Segments.HEADERS]: Joi.object({
      "x-woloo-token": Joi.string().min(1).required(),
    }).unknown(),
    [Segments.QUERY]: {
      id: Joi.number().required(),
    },
  },

  fetchCorporatesById: {
    [Segments.QUERY]: {
      id: Joi.number().required(),
    },
    [Segments.HEADERS]: Joi.object({
      "x-woloo-token": Joi.string().min(1).required(),
    }).unknown(),
  },

  deleteCorporatesByMultiId: {
    [Segments.BODY]: Joi.object({
      id: Joi.array(),
    }).unknown(),

    [Segments.HEADERS]: Joi.object({
      "x-woloo-token": Joi.string().min(1).required(),
    }).unknown(),
  },

  updateCorporate: {
    [Segments.BODY]: Joi.object({
      id: Joi.number().required(),
      name: Joi.string().min(1).required(),
      contact_name: Joi.string().required(),
      email: Joi.string().email().required(),

      mobile: Joi.number()
        .integer()
        .min(10 ** 9)
        .max(10 ** 10 - 1)
        .required()
        .messages({
          "number.min": "Mobile number should be 10 digit.",
          "number.max": "Mobile number should be 10 digit",
        }),

      address: Joi.string().required(),

      city: Joi.string().min(1).max(32).required(),
      type: Joi.string().min(1).max(32).required(),
      status: Joi.number(),
    }).unknown(),
    [Segments.HEADERS]: Joi.object({
      "x-woloo-token": Joi.string().min(1).required(),
    }).unknown(),

  },
};
