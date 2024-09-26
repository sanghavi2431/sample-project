import offerService from "../Services/Offer.service";
import IController from "../Types/IController";
import ApiResponse from "../utilities/ApiResponse";
import httpStatusCodes from "http-status-codes";
import { uploadFileUsingMulter } from "../utilities/S3Bucket";
import moment from "moment";
import config from "../config";
import common from "../Constants/common";
import WolooGuestService from "../Services/WolooGuest.service";



let { OK, BAD_REQUEST } = httpStatusCodes;

const create: IController = async (req: any, res) => {
  try {
    if (req.file) {
      const imageName = moment().unix() + "_" + req.file.originalname;
      let name: string = "Images/" + "offers" + "/" + imageName;
      req.body.image = await uploadFileUsingMulter(req.file, name);
    }
    let result = await offerService.create(req.body);
    if (!result.insertId) throw "Error occure while creating offer!";
    return ApiResponse.result(res, { message: "Offer created !" }, OK);
  } catch (e: any) {
    console.log(e);
    return ApiResponse.error(res, BAD_REQUEST, e);
  }
};

const deleteOffer: IController = async (req, res) => {
  try {
    let result: any = await offerService.deleteOffer(req);
    if (!result.affectedRows) throw "Offer not found !";
    return ApiResponse.result(res, { message: "Offer deleted !" }, OK);
  } catch (e: any) {
    return ApiResponse.error(res, BAD_REQUEST, e);
  }
};

const getOfferById: IController = async (req, res) => {
  try {
    let result = null;
    if (req.query.id) {
      result = await offerService.getOfferByID(req.query.id);
      if (!result.length) throw "Offer not found !"
      result[0].base_url = config.s3imagebaseurl
      return ApiResponse.result(res, result, OK);
    }
  } catch (e: any) {
    return ApiResponse.error(res, BAD_REQUEST, e);
  }
};


const getAllOffer: IController = async (req:any, res:any) => {
  try {
    let query = " ";
    let {  id: user_id,role_id } = req.session;
    let allowedRoles = common.rbac.role_id.host_id == role_id;
    let host = await WolooGuestService.getUserDetailByUser_id(user_id)
     query = allowedRoles ? `where woloo_id=${host[0].woloo_id} ` : `where true `;
    if (req.body.query != "") {
      query = ` and ( title like '%${req.body.query}%')`;
    }

    let result = await offerService.getAllOffer(
      req.body.pageSize,
      req.body.pageIndex,
      req.body.sort,
      query
    );
    let count = await offerService.getAllOfferCount(query);
    if (result instanceof Error) {
      return ApiResponse.error(
        res,
        httpStatusCodes.BAD_REQUEST,
        result.message
      );
    } else {
      return ApiResponse.result(
        res,
        { data: result, total: count },
        httpStatusCodes.OK
      );
    }
  } catch (error: any) {
    return ApiResponse.error(res, httpStatusCodes.BAD_REQUEST);
  }
};

const updateOffer: IController = async (req, res) => {
  try {
    if (!req.body.id) throw "Id is required!";
    let id = req.body.id;
    delete req.body.id;
    let isOfferExist = await offerService.getOfferByID(id);
    if (!isOfferExist.length) throw "Offer not found!";
    if (req.file) {
      const imageName = moment().unix() + "_" + req.file.originalname;
      let name: string = "Images/" + "offers" + "/" + imageName;
      req.body.image = await uploadFileUsingMulter(req.file, name);
    }
    let result = await offerService.updateOffer(req.body, id);
    if (!result.affectedRows) throw "Error occure while updating offer!";
    return ApiResponse.result(res, { message: "Offer updated!" }, OK);
  } catch (e: any) {
    return ApiResponse.error(res, BAD_REQUEST, e);
  }
};

export default {
  create,
  deleteOffer,
  updateOffer,
  getOfferById,
  getAllOffer
};
