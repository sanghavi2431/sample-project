import httpStatusCodes from "http-status-codes";
import IController from "../Types/IController";
import apiResponse from "../utilities/ApiResponse";
import CorporateService from "../Services/Corporate.service";
import constants from "../Constants";
import LOGGER from "../config/LOGGER";

const addCorporate: IController = async (req, res) => {
  let corporate;
  try {
    corporate = await CorporateService.addCorporate(req.body);
    if (corporate instanceof Error) {
      apiResponse.error(res, httpStatusCodes.BAD_REQUEST, corporate.message);
      return;
    } else {
      apiResponse.result(
        res,
        {
          corporate,
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

const getCorporates: IController = async (req, res) => {
  try {
    let query = " ";
    if (req.body.query != "") {
      query = ` WHERE ( name like '%${req.body.query}%' OR email like '%${req.body.query}%' OR contact_name like '%${req.body.query}%' OR mobile like '%${req.body.query}%' ) `;
    }
    let result = await CorporateService.getAllCorporate(
      req.body.pageSize,
      req.body.pageIndex,
      req.body.sort,
      query
    );
    let count = await CorporateService.getAllCorporateCount(query);
    
    
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

const deleteCorporatesById: IController = async (req, res) => {
  try {
    if (req.query.id) {
      const result: any = await CorporateService.deleteCorporatesById(
        Number(req.query.id)
      );
      if (result instanceof Error) {
        LOGGER.info("Controller Error : ", result.message);
        apiResponse.error(res, httpStatusCodes.BAD_REQUEST, result.message);
      } else {
        LOGGER.info("DELETED SUCCESSFULL");
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

const fetchCorporatesById: IController = async (req, res) => {
  CorporateService.fetchCorporatesById(req.query.id)
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

const deleteCorporatesByMultiId: IController = async (req, res) => {
  try {
    if (req.body.id) {
      const result: any = await CorporateService.deleteCorporatesByMultiId(
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

const updateCorporate: IController = async (req, res) => {
  let corporate: any;
  try {
    corporate = await CorporateService.updateCorporate(req);

    if (corporate instanceof Error) {
      apiResponse.error(res, httpStatusCodes.BAD_REQUEST, corporate.message);
    } else {
      apiResponse.result(res, corporate, httpStatusCodes.CREATED);
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
  addCorporate,
  getCorporates,
  deleteCorporatesById,
  fetchCorporatesById,
  deleteCorporatesByMultiId,
  updateCorporate,
};
