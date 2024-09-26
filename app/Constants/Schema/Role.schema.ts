import { Joi, Segments } from "celebrate";
export default {
  addRole: {
    [Segments.BODY]: Joi.object({
      name: Joi.string().min(1).required(),
      display_name: Joi.string().min(1).required(),
      rolesAccess: Joi.string().required()
    }).unknown(),
   },

  getRole: {
    [Segments.HEADERS]: Joi.object({
      "x-woloo-token": Joi.string().min(1).required(),
    }).unknown(),
    [Segments.BODY]: Joi.object({
      pageSize: Joi.number().required(),
      pageIndex: Joi.number().required(),
    }).unknown(),
  },

  deleteRole: {
    [Segments.HEADERS]: Joi.object({
      "x-woloo-token": Joi.string().min(1).required(),
    }).unknown(),
    [Segments.QUERY]: {
      id: Joi.number().required(),
    },
  },

  fetchRoleById: {
    [Segments.QUERY]: {
      id: Joi.number().required(),
    },
    [Segments.HEADERS]: Joi.object({
      "x-woloo-token": Joi.string().min(1).required(),
    }).unknown(),
  },

  updateRole: {
    [Segments.BODY]: Joi.object({
      id: Joi.number().required(),
      name: Joi.string().min(1).required(),
      display_name: Joi.string().min(1).required(),
      rolesAccess: Joi.string().required()
    }).unknown(),
    [Segments.HEADERS]: Joi.object({
      "x-woloo-token": Joi.string().min(1).required(),
    }).unknown(),

  },
};
