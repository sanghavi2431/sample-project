import httpStatusCodes from "http-status-codes";
import IController from "../Types/IController";
import apiResponse from "../utilities/ApiResponse";
import RoleService from "../Services/Roles.service";
import constants from "../Constants";
import LOGGER from "../config/LOGGER";
import { ApiResponseWithMessage } from "../utilities/ApiResponse";

const addRole: IController = async (req, res) => {
  let role;
  try {
    console.log("req",req.body)
    role = await RoleService.addRole(req.body);
    if (role instanceof Error) {
      apiResponse.error(res, httpStatusCodes.BAD_REQUEST, role.message);
      return;
    } else {
      apiResponse.result(
        res,
        {
          role,
        },
        httpStatusCodes.CREATED
      );
    }
  } catch (e) {
    // @ts-ignore
    if (e.code === constants.ErrorCodes.DUPLICATE_ENTRY) {
      apiResponse.error(res, httpStatusCodes.BAD_REQUEST);
      return;
    }
  }
};

const getRole: IController = async (req, res) => {
  try {
    let query = " ";
    if (req.body.query != "") {
      query = ` WHERE ( name like '%${req.body.query}%' OR display_name like '%${req.body.query}%'  ) `;
    }
    let result = await RoleService.getAllRoles(
      req.body.pageSize,
      req.body.pageIndex,
      req.body.sort,
      query
    );
    let count = await RoleService.getAllRoleCount(query);
    
    
    if (result instanceof Error) {
      return ApiResponseWithMessage.error(
        res,
        httpStatusCodes.BAD_REQUEST,
        result.message
      );
    } else {
      return ApiResponseWithMessage.result(
        res,
        { data: result, total: count },
        httpStatusCodes.OK,
        "success"
      );
    }
  } catch (error: any) {
    LOGGER.info("Error => ", error);
    return apiResponse.error(res, httpStatusCodes.BAD_REQUEST);
  }
};

const deleteRoleById: IController = async (req, res) => {
  try {
    if (req.query.id) {
      const result: any = await RoleService.deleteRoleById(
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
  } catch (error:any) {
    LOGGER.info("Controller Error : ", error);
    apiResponse.error(res, httpStatusCodes.BAD_REQUEST,error.message);
  }
};

const fetchRoleById: IController = async (req, res) => {
  RoleService.fetchRoleById(req.query.id)
    .then((corporate: any) => {
      if (corporate instanceof Error) {
        apiResponse.error(res, httpStatusCodes.BAD_REQUEST, corporate.message);
      } else {
        apiResponse.result(res, corporate, httpStatusCodes.OK);
      }
    })
    .catch((err: any) => {
      apiResponse.error(res, httpStatusCodes.BAD_REQUEST);
    });
};

const updateRole: IController = async (req, res) => {
  let role: any;
  try {
    role = await RoleService.updateRole(req);

    if (role instanceof Error) {
      apiResponse.error(res, httpStatusCodes.BAD_REQUEST, role.message);
    } else {
      apiResponse.result(res, role, httpStatusCodes.CREATED);
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

export default {
  addRole,
  getRole,
  deleteRoleById,
  fetchRoleById,
  updateRole,
};
