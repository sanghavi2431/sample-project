import IController from "../Types/IController";
import apiResponse from "../utilities/ApiResponse";
import { ApiResponseWithMessage } from "../utilities/ApiResponse";
import httpStatusCodes from "http-status-codes";
import LOGGER from "../config/LOGGER";
import AuthService from "../Services/Auth.service";

const clientAuthController: IController = async (req: any, res) => {
    try {
        const { mobile, svocid } = req.body;
        const { client_id, client_secret } = req.headers;
        console.log(client_id, client_secret)
        const results: any = await AuthService.clientAuthService(mobile, svocid, client_id, client_secret);
        return ApiResponseWithMessage.result(res, results, httpStatusCodes.OK, "User Login Success");
    } catch (error: any) {
        LOGGER.info("Error => ", error);
        return apiResponse.error(res, httpStatusCodes.BAD_REQUEST,error.message);
    }
};

export default {
    clientAuthController
};
