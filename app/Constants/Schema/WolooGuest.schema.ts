import { Joi, Segments } from "celebrate";
export default {
  fetchWolooGuestById: {
    [Segments.QUERY]: Joi.object({
      id: Joi.number().required().min(1),
    }).unknown(),
    [Segments.HEADERS]: Joi.object({
      "x-woloo-token": Joi.string().min(1).required(),
    }).unknown(),
  },

  updateWolooGuest: {
    [Segments.HEADERS]: Joi.object({
      "x-woloo-token": Joi.string().min(1).required(),
    }).unknown(),
  },

  
  createClient: {
    [Segments.BODY]: Joi.object({
      name: Joi.string().optional(),
      email: Joi.string().required(),
      mobile: Joi.string().optional()
    }).unknown(),
    
  },

  adminCreateClient: {
    [Segments.BODY]: Joi.object({
      name: Joi.string().optional(),
      email: Joi.string().required(),
      mobile: Joi.string().optional()
    }).unknown(),
    [Segments.HEADERS]: Joi.object({
      "x-woloo-token": Joi.string().min(1).required(),
    }).unknown(),
  },
  viewperiodtracker: {
    [Segments.HEADERS]: Joi.object({
      "x-woloo-token": Joi.string().min(1).required(),
    }).unknown(),
  },

  deleteWolooGuestById: {
    [Segments.QUERY]: Joi.object({
      id: Joi.number().required().min(1).message("Please enter ID"),
    }).unknown(),
    [Segments.HEADERS]: Joi.object({
      "x-woloo-token": Joi.string().min(1).required(),
    }).unknown(),
  },

  deleteWolooGuestByMultiId: {
    [Segments.BODY]: Joi.object({
      id: Joi.array(),
    }).unknown(),
  },

  fetchAllWolooGuest: {
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

  fetchWolooGuestProfile: {
    [Segments.HEADERS]: Joi.object({
      "x-woloo-token": Joi.string().min(1).required(),
    }).unknown(),
  },

  sendGiftSubscription: {
    [Segments.BODY]: Joi.object({
      user_id: Joi.number().required(),
      sender: Joi.string(),
      mobiles: Joi.array().items(Joi.number()).required(),
      message: Joi.string(),
    }).unknown(),
    [Segments.HEADERS]: Joi.object({
      "x-woloo-token": Joi.string().min(1).required(),
    }).unknown(),
  },

  profileStatus: {
    [Segments.QUERY]: Joi.object({
      user_id: Joi.number().required().min(1),
    }).unknown(),
  },

  thirstReminder: {
    [Segments.BODY]: Joi.object({
      is_thirst_reminder: Joi.number().required(),
      thirst_reminder_hours: Joi.number().required(),
    }).unknown(),
  },

  periodTracker: {
    [Segments.BODY]: Joi.object({
      period_date: Joi.string().required(),
      cycle_length: Joi.number().required(),
      period_length: Joi.number().required(),
    }).unknown(),
  },

  getUserOffer: {
    [Segments.BODY]: Joi.object({
      pageSize: Joi.number().required(),
      pageIndex: Joi.number().required(),
      query: Joi.string().min(0),
      sort: Joi.object().required(),
    }).unknown(),
    [Segments.HEADERS]: Joi.object({
      "x-woloo-token": Joi.string().min(1).required(),
    }).unknown(),
  },

  fetchUserOfferByID: {
    [Segments.QUERY]: Joi.object({
      id: Joi.number().required().min(1),
    }).unknown(),
    [Segments.HEADERS]: Joi.object({
      "x-woloo-token": Joi.string().min(1).required(),
    }).unknown(),
  },

  addUserOffer: {
    [Segments.BODY]: Joi.object({
      mobile: Joi.number().required(),
      offer_id: Joi.number().required(),
      expiry_date: Joi.string().min(0).required(),
    }).unknown(),
    [Segments.HEADERS]: Joi.object({
      "x-woloo-token": Joi.string().min(1).required(),
    }).unknown(),
  },

  updateUserOffer: {
    [Segments.BODY]: Joi.object({
      id: Joi.number().required(),
      mobile: Joi.number().required(),
      offer_id: Joi.number().required(),
      expiry_date: Joi.string().min(0).required(),
      status: Joi.number().required(),
    }).unknown(),
    [Segments.HEADERS]: Joi.object({
      "x-woloo-token": Joi.string().min(1).required(),
    }).unknown(),
  },

  deleteUserOfferById: {
    [Segments.QUERY]: Joi.object({
      id: Joi.number().required().min(1),
    }).unknown(),
    [Segments.HEADERS]: Joi.object({
      "x-woloo-token": Joi.string().min(1).required(),
    }).unknown(),
  },
  // invite: {
  //   [Segments.BODY]: Joi.object({
  //     mobile_numbers: Joi.array().items(Joi.string().length(10)).required()
  //   }).unknown(),
  //   [Segments.HEADERS]: Joi.object({
  //     "x-woloo-token": Joi.string().min(1).required(),
  //   }).unknown(),
  // }
};
