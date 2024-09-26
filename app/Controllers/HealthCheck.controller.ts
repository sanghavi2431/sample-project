import httpStatusCodes from "http-status-codes";
import IController from "../Types/IController";
import apiResponse from "../utilities/ApiResponse";
import HealthCheckService from "../Services/HealthCheck.service";

const healthCheck: IController = async (req, res) => {
  try {
    let dbStatus = await HealthCheckService.healthCheck();
    if (dbStatus instanceof Error) {
      apiResponse.error(res, httpStatusCodes.BAD_REQUEST);
    } else {
      apiResponse.result(
        res, {}, httpStatusCodes.OK
      );
    }
  } catch (e: any) {
    // @ts-ignore
    apiResponse.error(res, httpStatusCodes.BAD_REQUEST, e.message);
    return;
  }
};

export default {
  healthCheck
}
