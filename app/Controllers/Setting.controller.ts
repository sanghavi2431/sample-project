import httpStatusCodes from "http-status-codes";
import IController from "../Types/IController";
import apiResponse from "../utilities/ApiResponse";
import SettingService from "../Services/Setting.service";
import constants from "../Constants";
import LOGGER from "../config/LOGGER";

const getSetting: IController = async (req, res) => {
  try {
    let result = await SettingService.getSetting();
    if (result instanceof Error) {
      return apiResponse.error(
        res,
        httpStatusCodes.BAD_REQUEST,
        result.message
      );
    } else {
      return apiResponse.result(
        res,
        result,
        httpStatusCodes.OK
      );
    }
  } catch (error: any) {
    LOGGER.info("Error => ", error);
    return apiResponse.error(res, httpStatusCodes.BAD_REQUEST);
  }
};
const addNew: IController = async (req, res) => {
  let setting
  try {
    setting = await SettingService.addNew(req.body)
    if (setting instanceof Error) {
      apiResponse.error(res, httpStatusCodes.BAD_REQUEST, setting.message);
      return;
    } else {
      apiResponse.result(
        res,
        setting,
        httpStatusCodes.CREATED
      );
    }
  }
  catch (e) {
    // @ts-ignore
    if (e.code === constants.ErrorCodes.DUPLICATE_ENTRY) {
      apiResponse.error(res, httpStatusCodes.BAD_REQUEST);
      return;
    }
  }
}
const updateSetting: IController = async (req, res) => {
  let setting
  try {
    setting = await SettingService.updateSetting(req)
    if (setting instanceof Error) {
      apiResponse.error(res, httpStatusCodes.BAD_REQUEST, setting.message);
      return;
    } else {
      apiResponse.result(
        res,
        setting,
        httpStatusCodes.CREATED
      );
    }
  }
  catch (e) {
    // @ts-ignore
    if (e.code === constants.ErrorCodes.DUPLICATE_ENTRY) {
      apiResponse.error(res, httpStatusCodes.BAD_REQUEST);
      return;
    }
  }
}
const deleteSetting: IController = async (req, res) => {
  let setting
  try {
    setting = await SettingService.deleteSetting(req.query.id)
    if (setting instanceof Error) {
      apiResponse.error(res, httpStatusCodes.BAD_REQUEST, setting.message);
      return;
    } else {
      apiResponse.result(
        res,
        setting,
        httpStatusCodes.CREATED
      );
    }
  }
  catch (e) {
    // @ts-ignore
    if (e.code === constants.ErrorCodes.DUPLICATE_ENTRY) {
      apiResponse.error(res, httpStatusCodes.BAD_REQUEST);
      return;
    }
  }
}



export default {
  getSetting,
  addNew,
  updateSetting,
  deleteSetting
};
