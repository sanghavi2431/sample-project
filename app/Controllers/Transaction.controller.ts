import TransactionService from "../Services/Transaction.service";
import IController from "../Types/IController";
import httpStatusCodes from "http-status-codes";
import apiResponse from "../utilities/ApiResponse";
import LOGGER from "../config/LOGGER";

const getTransactionDetails: IController = async (req, res) => {
  try {
    let result;
    let query = "";
    let count;
    let filterData = req.body.filterType;
    let fromDate = "";
    let toDate = "";
    let filterQuery = "";

    if (req.body.query != "") {
      query = `WHERE (tr.transaction_id LIKE '%${req.body.query}%' OR tr.plan_id LIKE '%${req.body.query}%' OR tr.plan_type LIKE '%${req.body.query}%' OR us.name LIKE '%${req.body.query}%' OR us.mobile LIKE '%${req.body.query}%'OR tr.created_at LIKE '%${req.body.query}%'OR tr.transaction_amount LIKE '%${req.body.query}%') `;
    } else {
      query = `WHERE true `;
    }

    if (filterData.length) {
      for (let i = 0; i < filterData.length; i++) {
        if (filterData[i].type == "date") {
          fromDate = filterData[i].value[0];
          toDate = filterData[i].value[1];
          filterQuery = `AND (tr.${filterData[i].column} BETWEEN "${fromDate}:00:00:00" AND "${toDate}:23:59:59") `;
          query += filterQuery;
        } else if (filterData[i].column == "status") {
          if (filterData[i].value == "1") {
            let filterQuery = `AND (tr.charging_status ="2" and tr.wallet_txn_id IS NOT NULL)  `;
            query += filterQuery;
          } else if (filterData[i].value == "0") {
            let filterQuery = `AND (tr.charging_status ="1" or tr.charging_status ="0" or ( tr.charging_status ="2" and tr.wallet_txn_id IS NULL))`;
            query += filterQuery;
          }
        } else {
          let filterQuery = `AND  ${filterData[i].column} = "${filterData[i].value}"`;
          query += filterQuery;
        }
      }
    }

    result = await TransactionService.getTransactionDetails(
      req.body.pageSize,
      req.body.pageIndex,
      req.body.sort,
      query
    );

    count = await TransactionService.getAllTransactionDetailsCount(query);

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
const getTransactionDetailsById: IController = async (req, res) => {
  try {
    let result = await TransactionService.getTransactionDetailsById(
      req.query.Id
    );

    if (result instanceof Error) {
      return apiResponse.error(
        res,
        httpStatusCodes.BAD_REQUEST,
        result.message
      );
    } else {
      return apiResponse.result(res, result, httpStatusCodes.OK);
    }
  } catch (error: any) {
    LOGGER.info("Error => ", error);
    return apiResponse.error(res, httpStatusCodes.BAD_REQUEST);
  }
};
export default {
  getTransactionDetails,
  getTransactionDetailsById,
};
