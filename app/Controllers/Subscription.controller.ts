import IController from "../Types/IController";
import SubscriptionService from "../Services/Subscription.service";
import WolooGuestService from "../Services/WolooGuest.service";
import apiResponse from "../utilities/ApiResponse";
import httpStatusCodes from "http-status-codes";
import LOGGER from "../config/LOGGER";
import { WolooGuestModel } from "./../Models/WolooGuest.model";
import { SubscriptionModel } from "../Models/Subscription.model";
import moment from "moment";

import constants from "../Constants";

const fetchAllSubscription: IController = async (req:any, res:any) => {
  try {
    console.log("req.session.id)",req.session)
    let role_id=[9]
    let subscription = await WolooGuestService.getUserDetailBySponser_id(req.session.id)
    let subscriptionIds=subscription.map((sub:any)=>sub.subscription_id)
    console.log("subscriptionIds",subscriptionIds)
    // let woloo_id=host[0].role_id==role_id?host[0].woloo_id:`""`
    // let query = `where uwr.woloo_id=${woloo_id} `;
    let query="";
    if (req.body.query != "") {
      query = ` where ( name like '%${req.body.query}%'  OR description like '%${req.body.query}%' ) `;
    }

    let result = await SubscriptionService.fetchAllSubscription(
      req.body.pageSize,
      req.body.pageIndex,
      req.body.sort,
      query
    );
    let count = await SubscriptionService.fetchAllSubscriptionCount(query);

    if (result instanceof Error) {
      return apiResponse.error(
        res,
        httpStatusCodes.BAD_REQUEST,
        result.message
      );
    } else {
      return apiResponse.result(
        res,
        { data: result, total: count },
        httpStatusCodes.OK
      );
    }
  } catch (error: any) {
    LOGGER.info("Error => ", error);
    return apiResponse.error(res, httpStatusCodes.BAD_REQUEST);
  }
};

const fetchSubscriptionById: IController = async (req, res) => {
  SubscriptionService.fetchSubscriptionById(req.query.id)
    .then((subscription: any) => {
      if (subscription instanceof Error) {
        apiResponse.error(
          res,
          httpStatusCodes.BAD_REQUEST,
          subscription.message
        );
      } else {
        apiResponse.result(res, subscription, httpStatusCodes.OK);
      }
    })
    .catch((err: any) => {
      apiResponse.error(res, httpStatusCodes.BAD_REQUEST);
    });
};

const isInsurance: IController = async (req, res) => {
  SubscriptionService.isInsurance(req.query.id)
    .then((isInsurance: any) => {
      if (isInsurance instanceof Error) {
        apiResponse.error(
          res,
          httpStatusCodes.BAD_REQUEST,
          isInsurance.message
        );
      } else {
        apiResponse.result(res, isInsurance, httpStatusCodes.OK);
      }
    })
    .catch((err: any) => {
      apiResponse.error(res, httpStatusCodes.BAD_REQUEST);
    });
};

const deleteSubscription: IController = async (req, res) => {
  SubscriptionService.deleteSubscription(req.query.id)
    .then((subscription: any) => {
      if (subscription instanceof Error) {
        apiResponse.error(
          res,
          httpStatusCodes.BAD_REQUEST,
          subscription.message
        );
      } else {
        apiResponse.result(res, subscription, httpStatusCodes.OK);
      }
    })
    .catch((err: any) => {
      apiResponse.error(res, httpStatusCodes.BAD_REQUEST, err.message);
    });
};

const createSubscription: IController = async (req, res) => {
  let subscription: any;

  try {
    subscription = await SubscriptionService.createSubscription(req);

    if (subscription instanceof Error) {
      apiResponse.error(res, httpStatusCodes.BAD_REQUEST);
    } else {
      apiResponse.result(res, subscription, httpStatusCodes.CREATED);
    }
  } catch (e: any) {
    // @ts-ignore
    if (e.code === constants.ErrorCodes.DUPLICATE_ENTRY) {
      apiResponse.error(res, httpStatusCodes.BAD_REQUEST);
    } else {
      apiResponse.error(res, httpStatusCodes.BAD_REQUEST, e.message);
    }
    return;
  }
};

const bulkDeleteSubscription: IController = async (req, res) => {
  try {
    if (req.body.id) {
      const result: any = await SubscriptionService.bulkDeleteSubscription(
        req.body.id
      );
      if (result instanceof Error) {
        LOGGER.info("Controller Error : ", result.message);
        apiResponse.error(res, httpStatusCodes.BAD_REQUEST, result.message);
      } else {
        LOGGER.info("DELETED SUCCESSFULL");
        apiResponse.result(res, result, httpStatusCodes.OK);
      }
    } else {
      apiResponse.error(res, httpStatusCodes.BAD_REQUEST, "ID is Required.");
    }
  } catch (error) {
    LOGGER.info("Controller Error : ", error);
    apiResponse.error(res, httpStatusCodes.BAD_REQUEST);
  }
};

const updateSubscription: IController = async (req, res) => {
  let subscription: any;
  try {
    subscription = await SubscriptionService.updateSubscription(req);

    if (subscription instanceof Error) {
      apiResponse.error(res, httpStatusCodes.BAD_REQUEST, subscription.message);
    } else if (subscription.affectedRows == 0) {
      apiResponse.error(res, httpStatusCodes.BAD_REQUEST, "");
    } else {
      apiResponse.result(res, subscription, httpStatusCodes.CREATED);
    }
  } catch (e: any) {
    // @ts-ignore
    if (e.code === constants.ErrorCodes.DUPLICATE_ENTRY) {
      apiResponse.error(res, httpStatusCodes.BAD_REQUEST, "ALREADY_EXISTS ");
    } else {
      apiResponse.error(res, httpStatusCodes.BAD_REQUEST, e.message);
    }
    return;
  }
};

const initSubscription: IController = async (req, res) => {
  let subscription: any;

  try {
    subscription = await SubscriptionService.initSubscription(req);

    if (subscription instanceof Error) {
      apiResponse.error(res, httpStatusCodes.BAD_REQUEST, subscription.message);
    } else if (subscription.affectedRows == 0) {
      apiResponse.error(res, httpStatusCodes.BAD_REQUEST, "");
    } else {
      apiResponse.result(res, subscription, httpStatusCodes.CREATED);
    }
  } catch (e: any) {
    // @ts-ignore
    if (e.code === constants.ErrorCodes.DUPLICATE_ENTRY) {
      apiResponse.error(res, httpStatusCodes.BAD_REQUEST, "ALREADY_EXISTS ");
    } else {
      apiResponse.error(res, httpStatusCodes.BAD_REQUEST, e.message);
    }
    return;
  }
};

const initSubscriptionByOrder: IController = async (req, res) => {
  let subscription: any;

  try {
    subscription = await SubscriptionService.initSubscriptionByOrder(req);

    if (subscription instanceof Error) {
      apiResponse.error(res, httpStatusCodes.BAD_REQUEST, subscription.message);
    } else if (subscription.affectedRows == 0) {
      apiResponse.error(res, httpStatusCodes.BAD_REQUEST, "");
    } else {
      apiResponse.result(res, subscription, httpStatusCodes.CREATED);
    }
  } catch (e: any) {
    // @ts-ignore
    if (e.code === constants.ErrorCodes.DUPLICATE_ENTRY) {
      apiResponse.error(res, httpStatusCodes.BAD_REQUEST, "ALREADY_EXISTS ");
    } else {
      apiResponse.error(res, httpStatusCodes.BAD_REQUEST, e.message);
    }
    return;
  }
};

// const initSubscription: IController = async (req, res) => {
//   let futureSubscription: any;

//   let isFutureSubscriptionExist: any;
//   let userdetails: any;
//   //@ts-ignore
//   let userId = req.session.id;

//   try {
//     userdetails = await WolooGuestService.fetchWolooGuestById(userId);

//     if (userdetails instanceof Error) {
//       apiResponse.error(res, httpStatusCodes.BAD_REQUEST, userdetails.message);
//     }

//     isFutureSubscriptionExist =
//       await SubscriptionService.isFutureSubscriptionExist(userdetails);

//     if (isFutureSubscriptionExist instanceof Error) {
//       apiResponse.error(
//         res,
//         httpStatusCodes.BAD_REQUEST,
//         isFutureSubscriptionExist.message
//       );
//     } else {
//       apiResponse.result(res, futureSubscription, httpStatusCodes.CREATED);
//     }
//   } catch (e: any) {
//     // @ts-ignore
//     if (e.code === constants.ErrorCodes.DUPLICATE_ENTRY) {
//       apiResponse.error(res, httpStatusCodes.BAD_REQUEST, "ALREADY_EXISTS ");
//     } else {
//       apiResponse.error(res, httpStatusCodes.BAD_REQUEST, e.message);
//     }
//     return;
//   }
// };

// const fetchSubscriptionPlans: IController = async (req, res) => {
//   SubscriptionService.fetchSubscriptionPlan()
//     .then((subscription: any) => {
//       if (subscription instanceof Error) {
//         apiResponse.error(
//           res,
//           httpStatusCodes.BAD_REQUEST,
//           subscription.message
//         );
//       } else {
//         apiResponse.result(res, subscription, httpStatusCodes.OK);
//       }
//     })
//     .catch((err: any) => {
//       apiResponse.error(res, httpStatusCodes.BAD_REQUEST);
//     });
// };

const fetchSubscriptionPlans: IController = async (req, res) => {
  let subscription: any;

  try {
    subscription = await SubscriptionService.fetchSubscriptionPlan(req);

    if (subscription instanceof Error) {
      apiResponse.error(res, httpStatusCodes.BAD_REQUEST, subscription.message);
    } else {
      apiResponse.result(res, subscription, httpStatusCodes.CREATED);
    }
  } catch (e: any) {
    // @ts-ignore

    apiResponse.error(res, httpStatusCodes.BAD_REQUEST, e.message);
  }
};

const submitSubscriptionPurchase: IController = async (req, res) => {
  let subscription: any;

  try {
    // @ts-ignore
    let userId = req.session.id;
    let planId = req.body.plan_id;

    let paymentId = req.body.payment_id;
    let paymentSignature = req.body.payment_signature;
    let orderId = req.body.order_id;
    let future = req.body.future;
    let userGiftPoints = req.body.userGiftPoints;
    if (!userGiftPoints) {
      subscription = await SubscriptionService.submitSubscriptionPurchase(
        userId,
        planId,
        paymentId,
        paymentSignature,
        orderId,
        future
      );
    } else {
      subscription = await SubscriptionService.submitGiftSubscriptionPurchase(
        userId,
        planId,
        future
      );
    }

    if (subscription instanceof Error) {
      apiResponse.error(res, httpStatusCodes.BAD_REQUEST, subscription.message);
    } else if (subscription && subscription.affectedRows == 0) {
      apiResponse.error(res, httpStatusCodes.BAD_REQUEST, "");
    } else {
      apiResponse.result(res, subscription, httpStatusCodes.CREATED);
    }
  } catch (e: any) {
    // @ts-ignore
    if (e.code === constants.ErrorCodes.DUPLICATE_ENTRY) {
      apiResponse.error(res, httpStatusCodes.BAD_REQUEST, "ALREADY_EXISTS ");
    } else {
      apiResponse.error(res, httpStatusCodes.BAD_REQUEST, e.message);
    }
    return;
  }
};

const cancelSubscription: IController = async (req, res) => {
  let subscription: any;

  subscription = await SubscriptionService.cancelSubscription(req);

  if (subscription instanceof Error) {
    apiResponse.error(res, httpStatusCodes.BAD_REQUEST, subscription.message);
    return;
  }
  apiResponse.result(res, subscription, httpStatusCodes.CREATED);
};

const userSubscriptionStatus: IController = async (req, res) => {
  let subscription: any;

  subscription = await SubscriptionService.userSubscriptionStatus(req);

  if (subscription instanceof Error) {
    apiResponse.error(res, httpStatusCodes.BAD_REQUEST, subscription.message);
    return;
  }
  apiResponse.result(res, subscription, httpStatusCodes.CREATED);
};

const mySubscription: IController = async (req, res) => {

  let subscription: any;

  subscription = await SubscriptionService.mySubscription(req);

  if (subscription instanceof Error) {
    apiResponse.error(res, httpStatusCodes.BAD_REQUEST, subscription.message);
    return;
  }
  apiResponse.result(res, subscription, httpStatusCodes.CREATED);
};

export default {
  createSubscription,
  fetchAllSubscription,
  fetchSubscriptionById,
  deleteSubscription,
  updateSubscription,
  bulkDeleteSubscription,
  isInsurance,
  initSubscriptionByOrder,
  fetchSubscriptionPlans,
  initSubscription,
  submitSubscriptionPurchase,
  cancelSubscription,
  userSubscriptionStatus,
  mySubscription,
};
