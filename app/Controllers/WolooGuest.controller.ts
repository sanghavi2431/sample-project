
import IController from "../Types/IController";
import WolooGuestService from "../Services/WolooGuest.service";
import apiResponse from "../utilities/ApiResponse";
import { ApiResponseWithMessage } from "../utilities/ApiResponse";
import httpStatusCodes from "http-status-codes";
import LOGGER from "../config/LOGGER";
import constants from "../Constants";
import * as path from "path";
import { exportXlFile, writeFileXLSX } from "../utilities/XLSXUtility";
import { uploadBuffer, uploadLocalFile } from "../utilities/S3Bucket";
import WolooHostService from "../Services/WolooHost.service";
import RazorpayUtils from "../utilities/Razorpay";
import config from "../config";
import common from "../Constants/common";
import VoucherService from "../Services/Voucher.service";
import VoucherController from "./Voucher.controller";
import moment from "moment";
import fs from 'fs';
import { RedisClient } from "../utilities/redisClient";
import { SettingModel } from "./../Models/Setting.model";



const sendOTP: IController = async (req: any, res: any) => {
  try {
    const mobileNumber: number = req.body.mobileNumber;
    const referral_code = req.body.referral_code;
    const woloo_id = req.body.woloo_id;
    const wolooGuest: any = await WolooGuestService.createGuestOTP(
      mobileNumber,
      referral_code,
      woloo_id
    );

    if (wolooGuest instanceof Error) {
      LOGGER.info("Controller Error : ", wolooGuest.message);
      apiResponse.error(res, httpStatusCodes.BAD_REQUEST, wolooGuest.message);
    } else {
      apiResponse.result(res, wolooGuest, httpStatusCodes.OK);
    }
  } catch (err) {
    LOGGER.info("Controller Error : ", err);
    apiResponse.error(res, httpStatusCodes.BAD_REQUEST);
  }
};

const sendOTPForHost: IController = async (req: any, res: any) => {
  try {
    const mobileNumber: number = req.body.mobileNumber;
    const wolooGuest: any = await WolooGuestService.createOTPForHost(
      mobileNumber);

    if (wolooGuest instanceof Error) {
      LOGGER.info("Controller Error : ", wolooGuest.message);
      apiResponse.error(res, httpStatusCodes.BAD_REQUEST, wolooGuest.message);
    } else {
      apiResponse.result(res, wolooGuest, httpStatusCodes.OK);
    }
  } catch (err) {
    LOGGER.info("Controller Error : ", err);
    apiResponse.error(res, httpStatusCodes.BAD_REQUEST);
  }
};
const updateDeviceToken: IController = async (req: any, res: any) => {
  try {
    const updateDeviceToken: any = await WolooGuestService.updateDeviceToken(req);
    if (updateDeviceToken instanceof Error) {
      LOGGER.info("Controller Error : ", updateDeviceToken.message);
      apiResponse.error(res, httpStatusCodes.BAD_REQUEST, updateDeviceToken.message);
    } else {
      apiResponse.result(res, updateDeviceToken, httpStatusCodes.OK);
    }
  } catch (err) {
    LOGGER.info("Controller Error : ", err);
    apiResponse.error(res, httpStatusCodes.BAD_REQUEST);
  }
};

const verifyOTP: IController = async (req, res) => {
  try {
    const result: any = await WolooGuestService.verifyGuestOTP(req.body);
    if (result instanceof Error) {
      LOGGER.info("Controller Error : ", result.message);
      apiResponse.error(res, httpStatusCodes.BAD_REQUEST, result.message);
    } else {
      LOGGER.info("LOGIN SUCCESSFULL");
      apiResponse.result(res, result, httpStatusCodes.OK);
    }
  } catch (error) {
    LOGGER.info("Controller Error : ", error);
    apiResponse.error(res, httpStatusCodes.BAD_REQUEST);
  }
};

const verifyOTPForHost: IController = async (req, res) => {
  try {
    const result: any = await WolooGuestService.verifyHostOTP(req.body);
    if (result instanceof Error) {
      LOGGER.info("Controller Error : ", result.message);
      apiResponse.error(res, httpStatusCodes.BAD_REQUEST, result.message);
    } else {
      LOGGER.info("LOGIN SUCCESSFULL");
      apiResponse.result(res, result[0], httpStatusCodes.OK);
    }
  } catch (error) {
    LOGGER.info("Controller Error : ", error);
    apiResponse.error(res, httpStatusCodes.BAD_REQUEST);
  }
};


const fetchAllWolooGuest: IController = async (req, res) => {
  try {
    let query = " ";
    if (req.body.query != "") {
      query = ` WHERE ( name like '%${req.body.query}%' OR email like '%${req.body.query}%' OR mobile like '%${req.body.query}%' OR city like '%${req.body.query}%' ) `;
    }
    let result = await WolooGuestService.fetchAllWolooGuest(
      req.body.pageSize,
      req.body.pageIndex,
      req.body.sort,
      query
    );
    let count = await WolooGuestService.fetchWolooGuestCount(query);

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

const fetchWolooGuestById: IController = async (req, res) => {
  WolooGuestService.fetchWolooGuestById(req.query.id)
    .then((user: any) => {
      if (user instanceof Error) {
        apiResponse.error(res, httpStatusCodes.BAD_REQUEST, user.message);
      } else {
        apiResponse.result(res, user, httpStatusCodes.OK);
      }
    })
    .catch((err: any) => {
      apiResponse.error(res, httpStatusCodes.BAD_REQUEST);
    });
};

const deleteWolooGuestById: IController = async (req, res) => {
  WolooGuestService.deleteWolooGuestById(req.query.id)
    .then((woloo: any) => {
      if (woloo instanceof Error) {
        apiResponse.error(res, httpStatusCodes.BAD_REQUEST, woloo.message);
      } else {
        apiResponse.result(res, woloo, httpStatusCodes.OK);
      }
    })
    .catch((err: any) => {
      apiResponse.error(res, httpStatusCodes.BAD_REQUEST);
    });
};

const getAppConfig: IController = async (req: any, res) => {
  try {
    const locale = req.body.locale;
    
    const result = await WolooGuestService.appConfigGet(
      locale.packageName,
      locale.platform
    );

    apiResponse.result(res, result, httpStatusCodes.ACCEPTED);
  } catch (error: any) {
    apiResponse.error(res, httpStatusCodes.BAD_REQUEST, "" + error);
  }
};
const deleteWolooGuestByMultiId: IController = async (req, res) => {
  try {
    if (req.body.id) {
      const result: any = await WolooGuestService.deleteWolooGuestByMultiId(
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

const createWolooGuest: IController = async (req, res) => {
  let wolooUser: any;
  try {
    wolooUser = await WolooGuestService.createWolooGuest(req);
    if (wolooUser instanceof Error) {
      apiResponse.error(res, httpStatusCodes.BAD_REQUEST);
    } else {
      apiResponse.result(res, wolooUser, httpStatusCodes.CREATED);
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

const updateWolooGuest: IController = async (req, res) => {
  let user: any;
  try {
    user = await WolooGuestService.updateWolooGuest(req);
    if (user instanceof Error) {
      apiResponse.error(res, httpStatusCodes.BAD_REQUEST, user.message);
    } else {
      apiResponse.result(
        res,
        user.userData,
        { "message": user.message }),
        httpStatusCodes.CREATED
    }
  } catch (e: any) {
    // @ts-ignore
    if (e.code === constants.ErrorCodes.DUPLICATE_ENTRY) {
      apiResponse.error(res, httpStatusCodes.BAD_REQUEST, "");
    } else {
      apiResponse.error(res, httpStatusCodes.BAD_REQUEST, e.message);
    }
    return;
  }
};

const login: IController = async (req, res) => {
  WolooGuestService.login(req.body)
    .then((user) => {
      if (user instanceof Error) {
        apiResponse.error(
          res,
          // response.send('Incorrect Username and/or Password!');
          httpStatusCodes.BAD_REQUEST,
          "Incorrect Username or Password!"
        );
      } else {
        // response.redirect('/home');
        apiResponse.result(res, user[0], httpStatusCodes.OK);
      }
    })
    .catch((err) => {
      apiResponse.error(
        res,
        httpStatusCodes.BAD_REQUEST
        //locale.INVALID_CREDENTIALS,
      );
    });
};

const fetchWolooGuestProfile: IController = async (req, res) => {
  //@ts-ignore
  const id = req.session.id
  WolooGuestService.fetchWolooGuestProfile(id)
    .then((profile: any) => {
      if (profile instanceof Error) {
        apiResponse.error(res, httpStatusCodes.BAD_REQUEST, profile.message);
      } else {
        apiResponse.result(res, profile, httpStatusCodes.OK);
      }
    })
    .catch((err: any) => {
      apiResponse.error(res, httpStatusCodes.BAD_REQUEST);
    });
};

const navigationReward: IController = async (req, res) => {
  try {
    const wolooId = req.query.wolooId;
    //@ts-ignore
    const userId = req.session.id;
    // const userId = req.body.userId;
    const navigationRewardService =
      await WolooGuestService.navigationRewardService(wolooId, userId);

    if (navigationRewardService instanceof Error) {
      apiResponse.error(
        res,
        httpStatusCodes.BAD_REQUEST,
        navigationRewardService.message
      );
    } else {
      apiResponse.result(
        res,
        { message: navigationRewardService },
        httpStatusCodes.CREATED
      );
    }
  } catch (error: any) {
    apiResponse.error(res, httpStatusCodes.BAD_REQUEST, error.message);
  }
};

const profileStatus: IController = async (req, res) => {
  try {
    let profileStatus = await WolooGuestService.profileStatusService(
      Number(req.query.user_id)
    );
    if (profileStatus instanceof Error) {
      apiResponse.error(
        res,
        httpStatusCodes.BAD_REQUEST,
        profileStatus.message
      );
    } else {
      apiResponse.result(res, profileStatus, httpStatusCodes.CREATED);
    }
  } catch (error: any) {
    apiResponse.error(res, httpStatusCodes.BAD_REQUEST, error.message);
  }
};
const coinHistory: IController = async (req: any, res: any) => {
  let user_id: any = req.session.id;
  let limit: number = Number(config.listPerPage);
  try {
    let { getHistory, historyCount } = await WolooGuestService.coinHistory(
      user_id,
      limit,
      req.query.pageIndex
    );
    let lastpage = Math.ceil(historyCount / limit);
    if (getHistory instanceof Error) {
      apiResponse.error(res, httpStatusCodes.BAD_REQUEST, getHistory.message);
    } else {
      apiResponse.result(
        res,
        { total_count: historyCount, last_page: lastpage, history_count: getHistory?.length, history: getHistory },
        httpStatusCodes.CREATED
      );
    }
  } catch (error: any) {
    apiResponse.error(res, httpStatusCodes.BAD_REQUEST, error.message);
  }
};
const thirstReminder: IController = async (req: any, res: any) => {
  let user_id: any = req.session.id;
  let message = "";
  try {
    let data = await WolooGuestService.thirstReminder(
      user_id,
      req.body.is_thirst_reminder,
      req.body.thirst_reminder_hours
    );
    if (data instanceof Error) {
      apiResponse.error(res, httpStatusCodes.BAD_REQUEST, data.message);
    } else {
      Object.keys(data).length
        ? (message = "THIRST REMINDER SUCCESSFULLY ADDED ! ")
        : (message = "USER ID NOT FOUND ! ");
      ApiResponseWithMessage.result(
        res,
        data,
        httpStatusCodes.CREATED,
        message
      );
    }
  } catch (error: any) {
    apiResponse.error(res, httpStatusCodes.BAD_REQUEST, error.message);
  }
};
const periodtracker: IController = async (req: any, res: any) => {
  let user_id: any = req.session.id;
  try {
    let data = await WolooGuestService.periodtracker(req, user_id);

    let message = "";
    if (data instanceof Error) {
      apiResponse.error(res, httpStatusCodes.BAD_REQUEST, data.message);
    } else {
      Object.keys(data).length
        ? (message = "Period tracker detail ")
        : (message = "User period tracker data not exist ");
      ApiResponseWithMessage.result(
        res,
        data,
        httpStatusCodes.CREATED,
        message
      );
    }
  } catch (error: any) {
    apiResponse.error(res, httpStatusCodes.BAD_REQUEST, error.message);
  }
};

const viewperiodtracker: IController = async (req: any, res: any) => {
  let user_id: any = req.session.id;
  try {
    let periodtrackerprofile = await WolooGuestService.PeriodTrackerByID(
      user_id
    );

    let message = "";
    if (periodtrackerprofile instanceof Error) {
      apiResponse.error(
        res,
        httpStatusCodes.BAD_REQUEST,
        periodtrackerprofile.message
      );
    } else {
      Object.keys(periodtrackerprofile).length
        ? (message = "Period tracker detail ")
        : (message = "User period tracker data not exist ");
      ApiResponseWithMessage.result(
        res,
        periodtrackerprofile,
        httpStatusCodes.CREATED,
        message
      );
    }
  } catch (error: any) {
    apiResponse.error(res, httpStatusCodes.BAD_REQUEST, error.message);
  }
};

const fetchAllUserWolooRating: IController = async (req: any, res: any) => {
  try {
    let { id: user_id, role_id } = req.session;
    let allowedRoles = common.rbac.role_id.host_id == role_id
    let host = await WolooGuestService.getUserDetailByUser_id(user_id);
    let query = allowedRoles ? `where uwr.woloo_id=${host[0].woloo_id} ` : `where true `;
    if (req.body.query != "") {
      query += `AND ( us.name LIKE '%${req.body.query}%' OR w.name LIKE '%${req.body.query}%' OR uwr.review_description LIKE '%${req.body.query}%' OR uwr.rating LIKE '%${req.body.query}%' )`;
    }
    let result = await WolooGuestService.fetchAllUserWolooRating(
      req.body.pageSize,
      req.body.pageIndex,
      req.body.sort,
      query
    );
    let count = await WolooGuestService.fetchAllUserWolooRatingCount(query);
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

const getUsersReport: IController = async (req, res) => {
  try {
    let result;
    let query = "";
    let count;

    query = userReportQuery(req);

    result = await WolooGuestService.getUsersReport(
      req.body.pageSize,
      req.body.pageIndex,
      req.body.sort,
      query,
      true
    );

    count = await WolooGuestService.getUsersReportCount(query);

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

const giftVoucher: IController = async (req, res) => {
  try {
    let result;
    let query = "";
    let count;
    let filterData = req.body.filterType;
    let fromDate = "";
    let toDate = "";
    let filterQuery = "";

    if (req.body.query != "") {
      query = `WHERE (code LIKE '%${req.body.query}%') `;
    } else {
      query = `WHERE true `;
    }

    if (filterData.length) {
      for (let i = 0; i < filterData.length; i++) {
        if (filterData[i].type == "date") {
          fromDate = filterData[i].value[0];
          toDate = filterData[i].value[1];
          filterQuery = `AND v.${filterData[i].column} BETWEEN "${fromDate}" AND "${toDate}:23:59:59" `;
          query += filterQuery;
        } else if (filterData[i].column == "status") {
          if (filterData[i].value == "1") {
            let filterQuery = `AND expiry_date >= CURRENT_DATE() `;
            query += filterQuery;
          } else if (filterData[i].value == "0") {
            let filterQuery = `AND expiry_date < CURRENT_DATE() `;
            query += filterQuery;
          }
        } else {
          let filterQuery = `AND ${filterData[i].column} = "${filterData[i].value}"`;
          query += filterQuery;
        }
      }
    }

    result = await WolooGuestService.giftVoucher(
      req.body.pageSize,
      req.body.pageIndex,
      req.body.sort,
      query
    );

    count = await WolooGuestService.giftVoucherCount(query);

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

function userSubscriptionQuery(req: any): Object {
  try {
    let query = "";

    let filterData = req.body.filterType;
    let isVoucherFilter = "";

    let fromDate = "";
    let toDate = "";
    let filterQuery = "";

    if (req.body.query != "") {
      query = `WHERE (u.name LIKE '%${req.body.query}%' OR u.email LIKE '%${req.body.query}%' OR u.ref_code LIKE '%${req.body.query}%' OR u.mobile LIKE '%${req.body.query}%' ) `;
    } else {
      query = `WHERE true `;
    }

    let flag = true;

    if (filterData.length) {
      for (let i = 0; i < filterData.length; i++) {
        if (filterData[i].type == "date") {
          fromDate = filterData[i].value[0];
          toDate = filterData[i].value[1];

          filterQuery = `AND ( u.${filterData[i].column} BETWEEN "${fromDate}:00:00:00" AND "${toDate}:23:59:59" )`;
          query += filterQuery;
        } else if (filterData[i].column == "status") {
          if (filterData[i].value == "1") {
            let filterQuery = `AND u.expiry_date >= CURRENT_DATE() `;
            query += filterQuery;
          } else if (filterData[i].value == "0") {
            let filterQuery = `AND u.expiry_date < CURRENT_DATE() `;
            query += filterQuery;
          }
        } else if (filterData[i].column == "subscription") {
          if (filterData[i].value == "1" || filterData[i].value == "") {
            isVoucherFilter = "subscription";
            let filterQuery = ` AND u.subscription_id IS NOT NULL`;
            query += filterQuery;
          } else if (filterData[i].value == "0") {
            flag = false;
            isVoucherFilter = "voucher";
            let filterQuery = ` AND  u.voucher_id IS NOT NULL  `;
            query += filterQuery;
          }
        } else {
          if (!flag) {
            let filterQuery = ` AND vc.${filterData[i].column} = "${filterData[i].value}"`;
            query += filterQuery;
          }
        }
      }
    }

    return {
      query: query,
      isVoucherFilter: isVoucherFilter,
    };
  } catch (e: any) {
    return e.toString();
  }
}

function userReportQuery(req: any): any {
  try {
    let query = "";
    let filterData = req.body.filterType;
    let fromDate = "";
    let toDate = "";
    let filterQuery = "";
    let { id: user_id, role_id } = req.session;
    let allowedRoles = common.rbac.role_id.host_id == role_id

    if (req.body.query != "") {
      query = `WHERE (u.name LIKE '%${req.body.query}%' OR u.email LIKE '%${req.body.query}%' OR u.ref_code LIKE '%${req.body.query}%' OR u.mobile LIKE '%${req.body.query}%' ) `;
    } else {
      query = `WHERE true `;
    }
    if (allowedRoles) {
      query += ` and u.sponsor_id = ${user_id}`
    }

    if (filterData.length) {
      for (let i = 0; i < filterData.length; i++) {
        if (filterData[i].type == "date") {
          fromDate = filterData[i].value[0];
          toDate = filterData[i].value[1];
          filterQuery = `AND ( u.${filterData[i].column} BETWEEN "${fromDate}:00:00:00" AND "${toDate}:23:59:59" )`;
          query += filterQuery;
        } else if (filterData[i].column == "status") {
          if (filterData[i].value == "1") {
            let filterQuery = `AND u.expiry_date >= CURRENT_DATE() `;
            query += filterQuery;
          } else if (filterData[i].value == "0") {
            let filterQuery = `AND u.expiry_date < CURRENT_DATE() `;
            query += filterQuery;
          }
        } else if (filterData[i].column == "type") {
          if (filterData[i].value == "free") {
            let filterQuery = `AND (u.subscription_id IS NULL AND u.voucher_id IS NULL AND u.expiry_date IS NOT NULL)`;
            query += filterQuery;
          } else if (filterData[i].value == "subscription") {
            let filterQuery = `AND (u.subscription_id IS NOT NULL AND u.expiry_date IS NOT NULL)`;
            query += filterQuery;
          } else if (filterData[i].value == "voucher") {
            let filterQuery = `AND (u.voucher_id IS NOT NULL AND u.expiry_date IS NOT NULL)`;
            query += filterQuery;
          }
        } else if (filterData[i].value) {
          let filterQuery = `AND ${filterData[i].column} = "${filterData[i].value}"`;
          query += filterQuery;
        }
      }
    }

    return query;
  } catch (e: any) {
    return e.toString();
  }
}

function ownerWiseHistorytQuery(req: any): any {
  try {
    let query = "";
    let filterData = req.body.filterType;

    if (req.body.query != "") {
      query = ` AND (u.name LIKE '%${req.body.query}%' OR u.email LIKE '%${req.body.query}%' ) `;
    }
    if (filterData.length) {
      for (let i = 0; i < filterData.length; i++) {
        if (filterData[i].value != "") {
          let filterQuery = `AND u.${filterData[i].column} = "${filterData[i].value}"`;
          query += filterQuery;
        }
      }
    }

    return query;
  } catch (e: any) {
    return e.toString();
  }
}

const userReportSubscription: IController = async (req, res) => {
  try {
    let result;
    let query;
    let count;

    let isVoucherFilter = "subscription";

    let data: any = userSubscriptionQuery(req);

    if (data.isVoucherFilter == "subscription") {
      result = await WolooGuestService.userReportSubscription(
        req.body.pageSize,
        req.body.pageIndex,
        req.body.sort,
        data.query,
        true
      );

      count = await WolooGuestService.userReportSubscriptionCount(data.query);
    }

    if (data.isVoucherFilter == "voucher") {
      result = await WolooGuestService.userReportVoucher(
        req.body.pageSize,
        req.body.pageIndex,
        req.body.sort,
        data.query,
        true
      );

      count = await WolooGuestService.userReportVoucherCount(data.query);
    }

    if (result instanceof Error) {
      return apiResponse.error(
        res,
        httpStatusCodes.BAD_REQUEST,
        result.message
      );
    } else {
      return apiResponse.result(
        res,
        { isVoucherFilter: isVoucherFilter, data: result, total: count },
        httpStatusCodes.OK
      );
    }
  } catch (error: any) {
    LOGGER.info("Error => ", error);
    return apiResponse.error(res, httpStatusCodes.BAD_REQUEST);
  }
};

const ownerWiseHistory: IController = async (req, res) => {
  try {
    let result;
    let query = "";
    let count;

    query = ownerWiseHistorytQuery(req);

    result = await WolooGuestService.ownerWiseHistory(
      req.body.pageSize,
      req.body.pageIndex,
      req.body.sort,
      true,
      query
    );

    count = await WolooGuestService.ownerWiseHistoryCount(query);

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

let customerHistoryQuery = (req: any) => {
  let query = "";
  let { id: user_id, role_id } = req.session;
  let allowedRoles = common.rbac.role_id.host_id == role_id
  let filterData = req.body.filterType;
  let all_users = 0;
  let fromDate = "";
  let toDate = "";
  if (allowedRoles) {
    query += ` where w.user_id = ${user_id}`
  }
  if (req.body.query != "") {
    if (query.length) {
      query = ` and  ( us.name like '%${req.body.query}%' OR us.mobile like '%${req.body.query}%')`;
    }
    else {
      query = ` where  ( us.name like '%${req.body.query}%' OR us.mobile like '%${req.body.query}%')`;
    }
    all_users = 1;
  } else {
    all_users = 0;
  }

  if (filterData.length) {
    for (let i = 0; i < filterData.length; i++) {
      if (filterData[i].type == "date") {
        let filterQuery;
        if (query !== "") {
          fromDate = filterData[i].value[0];
          toDate = filterData[i].value[1];
          filterQuery = ` AND ( w.${filterData[i].column} BETWEEN "${fromDate}:00:00:00" AND "${toDate}:23:59:59" )`;
        } else {
          fromDate = filterData[i].value[0];
          toDate = filterData[i].value[1];
          filterQuery = `where ( w.${filterData[i].column} BETWEEN "${fromDate}:00:00:00" AND "${toDate}:23:59:59" )`;
        }
        query += filterQuery;
      } else if (filterData[i].column == "pincode") {
        let filterQuery;

        if (query != "") {
          filterQuery = ` AND us.${filterData[i].column} = "${filterData[i].value}"`;
        } else {
          filterQuery = `where us.${filterData[i].column} = "${filterData[i].value}"`;
        }
        query += filterQuery;
      } else {
        let filterQuery;

        if (query != "") {
          filterQuery = ` AND w.${filterData[i].column} = "${filterData[i].value}"`;
        } else {
          filterQuery = `where w.${filterData[i].column} = "${filterData[i].value}"`;
        }
        query += filterQuery;
      }
    }
  }

  return { query: query, all_users: all_users };
};
const customerHistory: IController = async (req: any, res) => {
  try {
    let data = customerHistoryQuery(req);
    let query = data.query;
    // console.log("query.....>", query)
    let count = 0;
    let all_users = data.all_users;
    let { role_id } = req.session;
    // console.log("role_id: ", role_id);
    
    const result = await WolooGuestService.customerHistory(
      req.body.pageSize,
      req.body.pageIndex,
      req.body.sort,
      query,
      all_users,
      true,
      role_id
    );
    
    count = await WolooGuestService.customerHistoryCount(query);

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
const getPointsSource: IController = async (req, res) => {
  try {
    const pointsSourceList = await WolooGuestService.getPointsSource(
      req.query.is_gift
    );
    if (pointsSourceList instanceof Error) {
      return apiResponse.error(
        res,
        httpStatusCodes.BAD_REQUEST,
        pointsSourceList.message
      );
    } else {
      return apiResponse.result(
        res,
        { data: pointsSourceList },
        httpStatusCodes.OK
      );
    }
  } catch (error: any) {
    LOGGER.info("Error => ", error);
    return apiResponse.error(res, httpStatusCodes.BAD_REQUEST);
  }
};

const getUsers: IController = async (req, res) => {
  try {
    const UsersList = await WolooGuestService.getUsers();
    if (UsersList instanceof Error) {
      return apiResponse.error(
        res,
        httpStatusCodes.BAD_REQUEST,
        UsersList.message
      );
    } else {
      return apiResponse.result(res, { data: UsersList }, httpStatusCodes.OK);
    }
  } catch (error: any) {
    LOGGER.info("Error => ", error);
    return apiResponse.error(res, httpStatusCodes.BAD_REQUEST);
  }
};

const getCorporate: IController = async (req, res) => {
  try {
    const CorporateList = await WolooGuestService.getCorporate();
    if (CorporateList instanceof Error) {
      return apiResponse.error(
        res,
        httpStatusCodes.BAD_REQUEST,
        CorporateList.message
      );
    } else {
      return apiResponse.result(
        res,
        { data: CorporateList },
        httpStatusCodes.OK
      );
    }
  } catch (error: any) {
    LOGGER.info("Error => ", error);
    return apiResponse.error(res, httpStatusCodes.BAD_REQUEST);
  }
};

const myOffers: IController = async (req, res) => {
  try {
    //@ts-ignore
    let userId = req.session.id
    const myOffers = await WolooGuestService.myOffers(userId);
    if (myOffers instanceof Error) {
      return apiResponse.error(
        res,
        httpStatusCodes.BAD_REQUEST,
        myOffers.message
      );
    } else {
      return apiResponse.result(res,
        myOffers,
        { "message": "" },
        httpStatusCodes.OK);
    }
  } catch (error: any) {
    LOGGER.info("Error => ", error);
    return apiResponse.error(res, httpStatusCodes.BAD_REQUEST);
  }
};




const redeemOffer: IController = async (req, res) => {
  try {
    //@ts-ignore
    let userId = req.session.id
    let offerId: any = req.query.offer_id

    const redeemOffer = await WolooGuestService.redeemOffer(
      userId,
      offerId
    );
    if (redeemOffer instanceof Error) {
      return apiResponse.error(
        res,
        httpStatusCodes.BAD_REQUEST,
        redeemOffer.message
      );
    } else {
      return apiResponse.result(
        res,
        { message: redeemOffer },
        httpStatusCodes.OK
      );
    }
  } catch (error: any) {
    LOGGER.info("Error => ", error);
    return apiResponse.error(res, httpStatusCodes.BAD_REQUEST);
  }
};

const getGiftPlan: IController = async (req, res) => {
  try {
    const getGiftPlan: any = await WolooGuestService.getGiftPlan(
      req.body.user_id,
      req.body.offer_id
    );
    if (redeemOffer instanceof Error) {
      return apiResponse.error(
        res,
        httpStatusCodes.BAD_REQUEST,
        getGiftPlan.message
      );
    } else {
      return apiResponse.result(
        res,
        { message: getGiftPlan },
        httpStatusCodes.OK
      );
    }
  } catch (error: any) {
    LOGGER.info("Error => ", error);
    return apiResponse.error(res, httpStatusCodes.BAD_REQUEST);
  }
};

const sendGiftSubscription: IController = async (req, res) => {
  try {
    var errMobiles: string[] = [];

    // check if mobile has a subscription
    for (const mobile of req.body.mobiles) {
      var sender = await WolooGuestService.fetchWolooGuestByMobileNo(mobile);
      if (sender) {
        if (
          (sender.subscription_id ||
            sender.voucher_id ||
            sender.gift_subscription_id) &&
          new Date() < sender.expiry_date
        ) {
          errMobiles.push(mobile.toString());
        }
      }
    }

    if (errMobiles.length > 0) {
      return apiResponse.error(
        res,
        httpStatusCodes.BAD_REQUEST,
        errMobiles.join(",") +
        " mobile number already have existing subscription"
      );
    }

    var giftSubscriptionId = await WolooGuestService.getGiftSubscriptionId();

    var subscription = await WolooGuestService.findSubscriptionBySubId(
      giftSubscriptionId
    );

    if (!subscription) {
      return apiResponse.error(
        res,
        httpStatusCodes.BAD_REQUEST,
        "Gift subscription not found"
      );
    }

    if (req.body.user_id) {
      var response = await RazorpayUtils.createOrder(
        Math.round(subscription.price_with_gst * req.body.mobiles.length * 100)
      );

      if (response.status == "created") {
        if (response.id) {
          for (const mobile of req.body.mobiles) {
            var sender = await WolooGuestService.fetchWolooGuestByMobileNo(
              mobile
            );

            if (!sender) {
              const chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
              let res1 = "..";

              for (let i = 0; i < 10; i++) {
                const randomIndex = Math.floor(Math.random() * chars.length);

                res1 += chars[randomIndex];
              }

              var freeTrialPeriodDays =
                await WolooGuestService.getFreeTrialPeriodDays();
              const currentDate = moment();
              const expiryDate = currentDate.add(
                freeTrialPeriodDays.value,
                "days"
              );
              const formattedExpiryDate = expiryDate.format("YYYY-MM-DD");

              var data = {
                mobile: mobile,
                password: "",
                expiry_date: formattedExpiryDate,
                ref_code: res1,
                is_first_session: 1,
              };

              var user = await WolooGuestService.createUser(data);

              if (user.insertId) {
                var getRegistartionPoint = await new SettingModel().getRegistartionPoint();

                var walletData = {
                  user_id: user.insertId,
                  transaction_type: "CR",
                  remarks: "Registration Point",
                  value: getRegistartionPoint[0].value,
                  type: "Registration Point",
                };
  var wallet = await WolooGuestService.createWallet(walletData);
              }

              var rzpData = {
                user_id: req.body.user_id,
                sender_id: user.id,
                subscription_id: giftSubscriptionId,
                message: req.body.message,
                order_id: response.id,
                coins: subscription.price_with_gst,
                status: 0,
                initial_razopay_response: response,
                created_at: new Date(),
                updated_at: new Date(),
              };

              var rzpResponse = await WolooGuestService.createRZP(rzpData);

              return apiResponse.result(
                res,
                { message: response.id },
                httpStatusCodes.OK
              );
            }
            apiResponse.result(
              res,
              { order_id: response.id },
              httpStatusCodes.OK
            );
          }
        } else {
          apiResponse.error(
            res,
            httpStatusCodes.BAD_REQUEST,
            "Something went wrong"
          );
        }
      } else {
        apiResponse.error(
          res,
          httpStatusCodes.BAD_REQUEST,
          "Something went wrong"
        );
      }
    } else {
      return apiResponse.error(
        res,
        httpStatusCodes.BAD_REQUEST,
        "User not found"
      );
    }

    return apiResponse.result(
      res,
      { message: sendGiftSubscription },
      httpStatusCodes.OK
    );
  } catch (error: any) {
    LOGGER.info("Error => ", error);
    return apiResponse.error(
      res,
      httpStatusCodes.BAD_REQUEST,
      "Something went wrong"
    );
  }
};

const exportXl: IController = async (req: any, res) => {
  try {
    let report = req.body.report;
    if (report == "subscription") {
      try {
        let result;

        let data: any = userSubscriptionQuery(req);

        result = await WolooGuestService.userReportSubscription(
          req.body.pageSize,
          req.body.pageIndex,
          req.body.sort,
          data.query,
          false
        );
        if (data.isVoucherFilter == "voucher") {
          result = await WolooGuestService.userReportVoucher(
            req.body.pageSize,
            req.body.pageIndex,
            req.body.sort,
            data.query,
            false
          );
        }

        if (result instanceof Error) {
          return apiResponse.error(
            res,
            httpStatusCodes.BAD_REQUEST,
            result.message
          );
        }

        const filePath: any = await writeFileXLSX(result);

        const key = path.parse(filePath);

        const uploadPath = common.report.UPLOAD_PATH + key.base;


        const uploadstatus = await uploadLocalFile(
          filePath,
          uploadPath,
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        );

        apiResponse.result(
          res,
          {
            Message: "Excel sheet generated",
            uploadPath: config.s3imagebaseurl + uploadPath,
          },
          httpStatusCodes.OK
        );
      } catch (error: any) {
        LOGGER.info("Error => ", error);
        return res.status(httpStatusCodes.BAD_REQUEST).send(error);
      }
    }

    if (report == "userReport") {
      try {
        let result;

        let query: any = userReportQuery(req);

        result = await WolooGuestService.getUsersReport(
          req.body.pageSize,
          req.body.pageIndex,
          req.body.sort,
          query,
          false
        );

        if (result instanceof Error) {
          return apiResponse.error(
            res,
            httpStatusCodes.BAD_REQUEST,
            result.message
          );
        }


        const filePath: any = await writeFileXLSX(result);

        const key = path.parse(filePath);

        const uploadPath = common.report.UPLOAD_PATH + key.base;

        const uploadstatus = await uploadLocalFile(
          filePath,
          uploadPath,
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        );

        apiResponse.result(
          res,
          {
            Message: "Excel sheet generated",
            uploadPath: config.s3imagebaseurl + uploadPath,
          },
          httpStatusCodes.OK
        );
      } catch (error: any) {
        LOGGER.info("Error => ", error);
        return apiResponse.error(res, httpStatusCodes.BAD_REQUEST);
      }
    }

    if (report == "ownerWiseHistory") {
      try {
        let result;

        let query: any = ownerWiseHistorytQuery(req);

        result = await WolooGuestService.ownerWiseHistory(
          req.body.pageSize,
          req.body.pageIndex,
          req.body.sort,
          false,
          query
        );

        if (result instanceof Error) {
          return apiResponse.error(
            res,
            httpStatusCodes.BAD_REQUEST,
            result.message
          );
        }
        const filePath: any = await writeFileXLSX(result);
        const key = path.parse(filePath);

        const uploadPath = common.report.UPLOAD_PATH + key.base;

        const uploadstatus = await uploadLocalFile(
          filePath,
          uploadPath,
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        );

        apiResponse.result(
          res,
          {
            Message: "Excel sheet generated",
            uploadPath: config.s3imagebaseurl + uploadPath,
          },
          httpStatusCodes.OK
        );
      } catch (error: any) {
        LOGGER.info("Error => ", error);
        return apiResponse.error(res, httpStatusCodes.BAD_REQUEST);
      }
    }

    if (report == "ownerHistory") {
      try {
        let result;
        let query = "";
        let { id: user_id, role_id } = req.session;
        let allowedRoles = common.rbac.role_id.host_id == role_id
        if (!allowedRoles) {
          query += ` where users.id = ${user_id}`
        }
        // var query: string = generateHistoryQuery(req);

        result = await WolooHostService.ownerHistory(
          req.body.pageIndex,
          req.body.pageSize,
          req.body.sort,
          false,
          query
        );

        if (result instanceof Error) {
          return apiResponse.error(
            res,
            httpStatusCodes.BAD_REQUEST,
            result.message
          );
        }

        const filePath: any = await writeFileXLSX(result);

        const key = path.parse(filePath);

        const uploadPath = common.report.UPLOAD_PATH + key.base;

        const uploadstatus = await uploadLocalFile(
          filePath,
          uploadPath,
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        );

        apiResponse.result(
          res,
          {
            Message: "Excel sheet generated",
            uploadPath: config.s3imagebaseurl + uploadPath,
          },
          httpStatusCodes.OK
        );
      } catch (error: any) {
        LOGGER.info("Error => ", error);
        return apiResponse.error(res, httpStatusCodes.BAD_REQUEST);
      }
    }

    if (report == "customerHistory") {
      try {
        let result;

        const data = customerHistoryQuery(req);
        const query = data.query;
        const count = 0;
        const all_users = data.all_users;
        const { role_id } = req.session;

        result = await WolooGuestService.customerHistory(
          req.body.pageSize,
          req.body.pageIndex,
          req.body.sort,
          query,
          all_users,
          false,
          role_id
        );

        if (result instanceof Error) {
          return apiResponse.error(
            res,
            httpStatusCodes.BAD_REQUEST,
            result.message
          );
        }

        const filePath: any = await writeFileXLSX(result);

        const key = path.parse(filePath);
        // // console.log(key);
        const uploadPath = common.report.UPLOAD_PATH + key.base;

        const uploadstatus = await uploadLocalFile(
          filePath,
          uploadPath,
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        );

        apiResponse.result(
          res,
          {
            Message: "Excel sheet generated",
            uploadPath: config.s3imagebaseurl + uploadPath,
          },
          httpStatusCodes.OK
        );
      } catch (error: any) {
        LOGGER.info("Error => ", error);
        return apiResponse.error(res, httpStatusCodes.BAD_REQUEST);
      }
    }

    if (report == "voucher") {
      try {


        let query = VoucherController.fetchAllVoucherQuery(req);

        let result = await VoucherService.fetchAllVoucher(
          req.body.pageSize,
          req.body.pageIndex,
          req.body.sort,
          query,
          false
        );


        if (result instanceof Error) {
          return apiResponse.error(
            res,
            httpStatusCodes.BAD_REQUEST,
            result.message
          );
        }

        result = result.map((value: any) => {
          value.type_of_organization = value.type_of_organization.label;
          value.type_of_voucher = value.type_of_voucher.label;
          value.lifetime_free = value.lifetime_free.label;
          value.status = value.status.label;
          value.payment_mode = value.payment_mode.label;
          value.is_email = value.is_email.label;
          return value;
        });

        const filePath: any = await writeFileXLSX(result);
        console.log("filepath......", filePath)
        const key = path.parse(filePath);
        // // console.log(key);
        const uploadPath = common.report.UPLOAD_PATH + key.base;

        const uploadstatus = await uploadLocalFile(
          filePath,
          uploadPath,
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        );

        //  console.log("uploadstatus...",uploadstatus)

        apiResponse.result(
          res,
          {
            Message: "Excel sheet generated",
            uploadPath: config.s3imagebaseurl + uploadPath,
          },
          httpStatusCodes.OK
        );
      } catch (error) {
        LOGGER.info("Error => ", error);
        return apiResponse.error(res, httpStatusCodes.BAD_REQUEST, "Error occure while uploading Excel");
      }
    }

    if (report == "userVoucherUsage") {
      try {
        let data: any = voucherUserQuery(req);

        let result = await WolooGuestService.getUserVoucherUsage(
          req.body.pageSize,
          req.body.pageIndex,
          req.body.sort,
          data,
          false
        );

        if (result instanceof Error) {
          return apiResponse.error(
            res,
            httpStatusCodes.BAD_REQUEST,
            result.message
          );
        }

        const filePath: any = await writeFileXLSX(result);

        const key = path.parse(filePath);
        // // console.log(key);
        const uploadPath = common.report.UPLOAD_PATH + key.base;

        const uploadstatus = await uploadLocalFile(
          filePath,
          uploadPath,
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        );

        apiResponse.result(
          res,
          {
            Message: "Excel sheet generated",
            uploadPath: config.s3imagebaseurl + uploadPath,
          },
          httpStatusCodes.OK
        );
      } catch (error) {
        LOGGER.info("Error => ", error);
        return apiResponse.error(res, httpStatusCodes.BAD_REQUEST);
      }
    }
  } catch (error: any) {
    LOGGER.info("Error => ", error);
    return apiResponse.error(res, httpStatusCodes.BAD_REQUEST);
  }
};

function generateHistoryQuery(req: any): string {
  let query = " where users.role_id=9 ";
  let filterData = req.body.filterType;

  if (filterData.length) {
    for (let i = 0; i < filterData.length; i++) {
      let filterQuery = `AND ${filterData[i].column} = "${filterData[i].value}"`;
      query += filterQuery;
    }
  }
  return query;
}
function voucherUserQuery(req: any): any {
  try {
    let voucher_code_id = req.body.voucher_code_id;
    let query = `where uvc.voucher_code_id = ${voucher_code_id}`;
    let filterData = req.body.filterType;
    let fromDate = "";
    let toDate = "";
    let filterQuery = "";

    if (filterData.length) {
      for (let i = 0; i < filterData.length; i++) {
        if (filterData[i].type == "date") {
          fromDate = filterData[i].value[0];
          toDate = filterData[i].value[1];
          filterQuery = ` and ( uvc.${filterData[i].column} BETWEEN "${fromDate}:00:00:00" AND "${toDate}:23:59:59" )`;
          query += filterQuery;
        }
      }
    }

    return query;
  } catch (e: any) {
    return e.toString();
  }
}
const getUserVoucherUsage: IController = async (req, res) => {
  try {
    let result;
    let count;

    let data: any = voucherUserQuery(req);
    result = await WolooGuestService.getUserVoucherUsage(
      req.body.pageSize,
      req.body.pageIndex,
      req.body.sort,
      data,
      true
    );

    count = await WolooGuestService.getUserVoucherUsageTotal(data);

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

const getReviewOptions: IController = async (req, res) => {
  let result;
  try {
    result = await WolooGuestService.getReviewOptions();

    if (result instanceof Error) {
      return ApiResponseWithMessage.error(
        res,
        httpStatusCodes.BAD_REQUEST,
        result.message
      );
    } else {
      return ApiResponseWithMessage.result(
        res,
        result,
        httpStatusCodes.OK,
        "success"
      );
    }
  } catch (error: any) {
    LOGGER.info("Error => ", error);
    return apiResponse.error(res, httpStatusCodes.BAD_REQUEST);
  }
};

const getReviewList: IController = async (req, res) => {
  let pageSize = 20;
  try {
    let result = await WolooGuestService.getReviewList(pageSize, req.body.pageNumber, req.body.woloo_id);
    result = result.map((r: any) => {
      r.user_details = JSON.parse(r.user_details)
      r.user_details.avatar = (!r.user_details.avatar) ? "default.png" : r.user_details.avatar;
      return r;
    })
    const count = await WolooGuestService.getReviewListCount(req.body.woloo_id);
    const reviewCount = result.length;

    if (result instanceof Error) {
      return ApiResponseWithMessage.error(
        res,
        httpStatusCodes.BAD_REQUEST,
        result.message
      );
    } else {
      return ApiResponseWithMessage.result(
        res,
        {
          total_review_count: count,
          review_count: reviewCount,
          review: result,
        },
        httpStatusCodes.OK,
        "success"
      );
    }
  } catch (error: any) {
    LOGGER.info("Error => ", error);
    return apiResponse.error(res, httpStatusCodes.BAD_REQUEST, error.message);
  }
};
const getPendingReviewStatus: IController = async (req: any, res) => {
  let result;
  let user_id: any = req.session.id;
  try {
    result = await WolooGuestService.getPendingReviewStatus(user_id);
    if (result instanceof Error) {
      return ApiResponseWithMessage.error(
        res,
        httpStatusCodes.BAD_REQUEST,
        result.message
      );
    } else {
      return ApiResponseWithMessage.result(
        res,
        result[0],
        httpStatusCodes.OK,
        "success"
      );
    }
  } catch (error: any) {
    LOGGER.info("Error => ", error);
    return apiResponse.error(res, httpStatusCodes.BAD_REQUEST);
  }
};
const wahcertificate: IController = async (req: any, res) => {
  let result;
  try {

    let userId = req.session.id
    result = await WolooGuestService.wahcertificate(req.query.woloo_id, userId);
    if (result instanceof Error) {
      return ApiResponseWithMessage.error(
        res,
        httpStatusCodes.BAD_REQUEST,
        result.message
      );
    } else {
      return ApiResponseWithMessage.result(
        res,
        result,
        httpStatusCodes.OK,
        "Woloo found"
      );
    }
  } catch (error: any) {
    LOGGER.info("Error => ", error);
    return apiResponse.error(res, httpStatusCodes.BAD_REQUEST);
  }
};

const reverseGeocoding: IController = async (req: any, res) => {
  let result: any;
  try {
    result = await WolooGuestService.reverseGeocoding(
      req.body.lat,
      req.body.lng
    );
    if (result instanceof Error) {
      return ApiResponseWithMessage.error(
        res,
        httpStatusCodes.BAD_REQUEST,
        result.message
      );
    } else {
      return ApiResponseWithMessage.result(res, result, httpStatusCodes.OK, "");
    }
  } catch (error: any) {
    LOGGER.info("Error => ", error);
    return apiResponse.error(res, httpStatusCodes.BAD_REQUEST);
  }
};

const invite: IController = async (req: any, res) => {
  let result: any;
  try {
    result = await WolooGuestService.invite(req);
    if (result instanceof Error) {
      return ApiResponseWithMessage.error(
        res,
        httpStatusCodes.BAD_REQUEST,
        result.message
      );
    } else {
      return ApiResponseWithMessage.result(res, result, httpStatusCodes.OK, "");
    }
  } catch (error: any) {
    LOGGER.info("Error => ", error);
    return apiResponse.error(res, httpStatusCodes.BAD_REQUEST);
  }
};
const web_invite_page: IController = async (req: any, res) => {
  let result: any;
  try {
    result = await WolooGuestService.web_invite_page(req);
    if (result instanceof Error) {
      return ApiResponseWithMessage.error(
        res,
        httpStatusCodes.BAD_REQUEST,
        result.message
      );
    } else {
      res.render("invite", result);
    }
  } catch (error: any) {
    LOGGER.info("Error => ", error);
    return apiResponse.error(res, httpStatusCodes.BAD_REQUEST);
  }
};
const registration: IController = async (req: any, res) => {
  let result: any;
  try {
    result = await WolooGuestService.registration(req);
    if (result instanceof Error) {
      return ApiResponseWithMessage.error(
        res,
        httpStatusCodes.BAD_REQUEST,
        result.message
      );
    } else {
      return ApiResponseWithMessage.result(res, result, httpStatusCodes.OK, "");
    }
  } catch (error: any) {
    LOGGER.info("Error => ", error);
    return apiResponse.error(res, httpStatusCodes.BAD_REQUEST);
  }
};
const scanWoloo: IController = async (req: any, res) => {
  let result: any;
  try {
    result = await WolooGuestService.scanWoloo(req);
    if (result instanceof Error) {
      return ApiResponseWithMessage.error(
        res,
        httpStatusCodes.BAD_REQUEST,
        result.message
      );
    } else {
      return ApiResponseWithMessage.result(res, result, httpStatusCodes.OK, "");
    }
  } catch (error: any) {
    LOGGER.info("Error => ", error);
    return apiResponse.error(res, httpStatusCodes.BAD_REQUEST);
  }
};
const getUserOffer: IController = async (req: any, res) => {
  try {
    let { id: user_id, role_id } = req.session;
    let hostAllowed = common.rbac.role_id.host_id == role_id
    let query = "where Date(uo.expiry_date) >= current_date() ";
    if (req.body.query != "") {
      query += ` and ( us.mobile like '%${req.body.query}%' OR of.title like '%${req.body.query}%' OR uo.expiry_date like '%${req.body.query}%'  ) `;
    }
    if (hostAllowed) {
      query += `and of.woloo_id = (SELECT woloo_id FROM users where id = ${user_id})`
    }
    let result = await WolooGuestService.getUserOffer(
      req.body.pageSize,
      req.body.pageIndex,
      req.body.sort,
      query
    );
    let count = await WolooGuestService.getUserOfferCount(query);

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
const addUserOffer: IController = async (req, res) => {
  let userOffer;
  try {
    userOffer = await WolooGuestService.addUserOffer(req.body);
    if (userOffer instanceof Error) {
      apiResponse.error(res, httpStatusCodes.BAD_REQUEST, userOffer.message);
      return;
    } else {
      apiResponse.result(
        res,
        {
          data: userOffer,
        },
        httpStatusCodes.CREATED
      );
    }
  } catch (e) {
    // @ts-ignore
    LOGGER.info("Error => ", error);
    return apiResponse.error(res, httpStatusCodes.BAD_REQUEST);
  }
};
const deleteUserOfferById: IController = async (req, res) => {
  try {
    if (req.query.id) {
      const result: any = await WolooGuestService.deleteUserOfferById(
        Number(req.query.id)
      );
      if (result instanceof Error) {
        LOGGER.info("Controller Error : ", result.message);
        apiResponse.error(res, httpStatusCodes.BAD_REQUEST, result.message);
      } else {
        LOGGER.info("DELETED SUCCESSFULLY");
        apiResponse.result(res, result, httpStatusCodes.OK);
      }
    } else {
      apiResponse.error(res, httpStatusCodes.BAD_REQUEST, "Please enter ID");
    }
  } catch (error: any) {
    LOGGER.info("Controller Error : ", error);
    apiResponse.error(res, httpStatusCodes.BAD_REQUEST, error.message);
  }
};

const fetchUserOfferByID: IController = async (req, res) => {
  try {
    const result: any = await WolooGuestService.fetchUserOfferByID(
      req.query.id
    );
    if (result instanceof Error) {
      LOGGER.info("Controller Error : ", result.message);
      apiResponse.error(res, httpStatusCodes.BAD_REQUEST, result.message);
    } else {
      apiResponse.result(res, result, httpStatusCodes.OK);
    }
  } catch (error: any) {
    apiResponse.error(res, httpStatusCodes.BAD_REQUEST, error.message);
  }
};
const updateUserOffer: IController = async (req, res) => {
  let userOffer: any;
  try {
    userOffer = await WolooGuestService.updateUserOffer(req);

    if (userOffer instanceof Error) {
      apiResponse.error(res, httpStatusCodes.BAD_REQUEST, userOffer.message);
    } else {
      apiResponse.result(res, userOffer, httpStatusCodes.CREATED);
    }
  } catch (e) {
    // @ts-ignore
    LOGGER.info("Error => ", error);
    return apiResponse.error(res, httpStatusCodes.BAD_REQUEST);
  }
};
const getOffer: IController = async (req, res) => {
  let userOffer: any;
  try {
    userOffer = await WolooGuestService.getOffer();

    if (userOffer instanceof Error) {
      apiResponse.error(res, httpStatusCodes.BAD_REQUEST, userOffer.message);
    } else {
      apiResponse.result(res, userOffer, httpStatusCodes.CREATED);
    }
  } catch (e: any) {
    // @ts-ignore
    if (e.code === constants.ErrorCodes.DUPLICATE_ENTRY) {
      apiResponse.error(res, httpStatusCodes.BAD_REQUEST, "");
    } else {
      apiResponse.error(res, httpStatusCodes.BAD_REQUEST, e.message);
    }
    return;
  }
};
const getRoles: IController = async (req, res) => {
  let userOffer: any;
  try {
    userOffer = await WolooGuestService.getRoles();

    if (userOffer instanceof Error) {
      apiResponse.error(res, httpStatusCodes.BAD_REQUEST, userOffer.message);
    } else {
      apiResponse.result(res, userOffer, httpStatusCodes.CREATED);
    }
  } catch (e: any) {
    // @ts-ignore
    if (e.code === constants.ErrorCodes.DUPLICATE_ENTRY) {
      apiResponse.error(res, httpStatusCodes.BAD_REQUEST, "");
    } else {
      apiResponse.error(res, httpStatusCodes.BAD_REQUEST, e.message);
    }
    return;
  }
};
const getUserDetailByUser_id: IController = async (req, res) => {
  let woloo: any;
  try {
    woloo = await WolooGuestService.getUserDetailByUser_id(req.query.user_id);

    if (woloo instanceof Error) {
      apiResponse.error(res, httpStatusCodes.BAD_REQUEST, woloo.message);
    } else {
      apiResponse.result(res, woloo, httpStatusCodes.CREATED);
    }
  } catch (e: any) {
    // @ts-ignore
    if (e.code === constants.ErrorCodes.DUPLICATE_ENTRY) {
      apiResponse.error(res, httpStatusCodes.BAD_REQUEST, "");
    } else {
      apiResponse.error(res, httpStatusCodes.BAD_REQUEST, e.message);
    }
    return;
  }
};


const userLog: IController = async (req, res) => {
  let userLog: any;
  //@ts-ignore
  try {
    userLog = await WolooGuestService.userLog(req);
    if (userLog instanceof Error) {
      apiResponse.error(res, httpStatusCodes.BAD_REQUEST, userLog.message);
    } else {
      const folderPath = __dirname + '/public/logs';
      const currDate = new Date();  // Replace with the actual folder path
      const filePath = path.join(folderPath, 'logs_' + currDate.getDate() + '_' + currDate.getMonth() + '_' + currDate.getFullYear());

      if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, { recursive: true });
      }

      fs.writeFileSync(filePath, JSON.stringify(req.body));
      apiResponse.result(res, userLog, httpStatusCodes.CREATED);
    }
  } catch (e: any) {
    apiResponse.error(res, httpStatusCodes.BAD_REQUEST, e.message);
  }
};

const createClient: IController = async (req: any, res: any) => {
  try {
    let results: any = await WolooGuestService.createClient(req.body)
    if (results instanceof Error) {
      console.log("error", results)
      apiResponse.error(res, httpStatusCodes.BAD_REQUEST, results.message);
    } else {
      apiResponse.result(res, results, httpStatusCodes.CREATED);
    }
  }
  catch (e: any) {
    console.log("controller ->", e)
    apiResponse.error(res, httpStatusCodes.BAD_REQUEST, e.message);
  }
}

const adminCreateClient: IController = async (req: any, res: any) => {
  try {
    let role = req.session.role_id
    let results: any = await WolooGuestService.adminCreateClient(req.body, role)
    if (results instanceof Error) {
      console.log("error", results)
      apiResponse.error(res, httpStatusCodes.BAD_REQUEST, results.message);
    } else {
      apiResponse.result(res, results, httpStatusCodes.CREATED);
    }
  }
  catch (e: any) {
    console.log("controller ->", e)
    apiResponse.error(res, httpStatusCodes.BAD_REQUEST, e.message);
  }
}


const forgetPassword: IController = async (req, res) => {
  const { email } = req.body;

  try {
    const resetToken = await WolooGuestService.generateResetToken(email);
    apiResponse.result(res, { message: 'Check your email for the reset link.' }, httpStatusCodes.CREATED);

  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const resetPassword: IController = async (req, res) => {
  const { email, oldPassword, newPassword } = req.body;
  try {
    let getDummyPassword = await RedisClient.getInstance().getEx(email, 300);
    if (!getDummyPassword || getDummyPassword != oldPassword) {
      return res.status(401).json({ error: 'Invalid old password' });
    }
    await WolooGuestService.resetPassword(email, newPassword);
    apiResponse.result(res, { message: 'Password reset successfully' }, httpStatusCodes.CREATED);

  } catch (error: any) {
    console.error('Error resetting password:', error);
    apiResponse.error(res, httpStatusCodes.BAD_REQUEST, error.message);

  }
};



export default {
  sendOTP,
  sendOTPForHost,
  verifyOTP,
  createWolooGuest,
  fetchAllWolooGuest,
  fetchWolooGuestById,
  deleteWolooGuestById,
  updateWolooGuest,
  getAppConfig,
  login,
  deleteWolooGuestByMultiId,
  fetchWolooGuestProfile,
  navigationReward,
  profileStatus,
  coinHistory,
  fetchAllUserWolooRating,
  thirstReminder,
  periodtracker,
  viewperiodtracker,
  getUsersReport,
  giftVoucher,
  userReportSubscription,
  ownerWiseHistory,
  exportXl,
  customerHistory,
  getPointsSource,
  getUsers,
  getUserVoucherUsage,
  getCorporate,
  getReviewOptions,
  getReviewList,
  getPendingReviewStatus,
  wahcertificate,
  reverseGeocoding,
  invite,
  web_invite_page,
  registration,
  myOffers,
  redeemOffer,
  getGiftPlan,
  sendGiftSubscription,
  scanWoloo,
  getUserOffer,
  updateUserOffer,
  fetchUserOfferByID,
  deleteUserOfferById,
  addUserOffer,
  getOffer,
  getRoles,
  getUserDetailByUser_id,
  userLog,
  updateDeviceToken,
  createClient,
  adminCreateClient,
  forgetPassword,
  resetPassword,
  verifyOTPForHost
};
