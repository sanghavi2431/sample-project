import FranchiseService from "../Services/Franchise.service";
import httpStatusCodes from "http-status-codes";
import IController from "../Types/IController";
import apiResponse from "../utilities/ApiResponse";
import constants from "../Constants";
import LOGGER from "../config/LOGGER";

const getAllFranchise: IController=async (req,res)=>{
    try{
        let query = "WHERE w.is_franchise=1 ";
    if (req.body.query != "") {
      query = ` WHERE w.is_franchise=1 AND ( w.code like '%${req.body.query}%' OR w.name like '%${req.body.query}%' OR w.title like '%${req.body.query}%' OR w.status like '%${req.body.query}%' OR w.address like '%${req.body.query}%' OR w.pincode like '%${req.body.query}%' )  `;
    }
    let result = await FranchiseService.getAllFranchise(
      req.body.pageSize,
      req.body.pageIndex,
      req.body.sort,
      query
    ); 
    let count = await FranchiseService.getAllFranchiseCOunt(query);

    if (result instanceof Error) {
        return apiResponse.error(
          res,
          httpStatusCodes.BAD_REQUEST,
          result.message
        );
      } else {
        return apiResponse.result(
          res,
          { data: result , total :count},
          httpStatusCodes.OK
        );
      }
    }
    catch (error: any) {
        LOGGER.info("Error => ", error);
        return apiResponse.error(res, httpStatusCodes.BAD_REQUEST);
      }   
}
export default{
    getAllFranchise
}