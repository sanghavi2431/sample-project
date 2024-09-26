import httpStatusCodes from "http-status-codes";
import IController from "../Types/IController";
import apiResponse from "../utilities/ApiResponse";
import VoucherService from "../Services/Voucher.service";
import LOGGER from "../config/LOGGER";
import common from "../utilities/common";
import formidable from "formidable";
import { readFile } from "../utilities/XLSXUtility";
import path from "path";
import constantCommon from "../Constants/common";


const createVoucher: IController = async (req, res) => {
  const form = new formidable.IncomingForm();
  const uploadFolder = path.join(__dirname, 'public', 'files');
  
  //@ts-ignore
  form.uploadDir = uploadFolder;
  form.parse(req, async (err: any, fields: any, files: any) => {
    try {
      let data: any = { ...fields };
      let isCreateLinks = true;
      
      if (files && files.mobileNumbers) {
        // dont create link
        isCreateLinks = false;
        const fileName = files.mobileNumbers.newFilename;
        // read file create User
        const sheetData = await readFile(uploadFolder + "/" + fileName);
        const mobileNumbers = sheetData.map((o: any) => o.mobile_no);
        data.mobileNumbers = [...mobileNumbers];
      }
      data.code = common.voucherGenerator(25);
      data.forceApply = fields.forceApply == 1 ? true : false;
      const result: any = await VoucherService.createVoucherService(
        req,
        data,
        isCreateLinks
      );
      apiResponse.result(res, result, httpStatusCodes.CREATED);
    } catch (error: any) {
      LOGGER.info("error", error);
      apiResponse.error(res, httpStatusCodes.BAD_REQUEST, error.message);
    }
  });
};

const webhookVoucher: IController = async (req, res) => {
  try {
    const result = await VoucherService.voucherWebhook(req.query);
    // apiResponse.result(res, result, httpStatusCodes.CREATED);
    if (result.sendEmail == 1) {
      res.render("voucherDownload", {
        corporateName: result.corporate,
        downloadLink: "",
        sendEmail: true,
      });
    } else {
      res.render("voucherDownload", {
        corporateName: result.corporate,
        downloadLink: result.downloadLink,
        sendEmail: false,
      });
    }
  } catch (error) {
    LOGGER.info("error", error);
    apiResponse.error(res, httpStatusCodes.BAD_REQUEST);
  }
};

const voucherApply: IController = async (req, res) => {
  try {
    const { voucher, forceApply } = req.body;

    const result:any = await VoucherService.voucherApply(
      voucher,
      //@ts-ignore
      req.session.id,
      forceApply
    );
    apiResponse.result(res, result, httpStatusCodes.CREATED);
  } catch (error: any) {
    LOGGER.info("error", error);
    apiResponse.error(res, httpStatusCodes.BAD_REQUEST, error.message);
  }
};

const verifyVoucher: IController = async (req, res) => {
  try {
    const shortCode = req.body.shortCode;
    const result = await VoucherService.voucherVerify(shortCode);
    apiResponse.result(res, result, httpStatusCodes.CREATED);
  } catch (error) {
    LOGGER.info("error", error);
    apiResponse.error(res, httpStatusCodes.BAD_REQUEST);
  }
};

const fetchAllVoucherQuery = (req: any) => {
  let query = " ";
  let fromDate = "";
  let toDate = "";
  let filterQuery = "";
  if (req.body.query != "") {
    query = "";
  }
  let {id:user_id,role_id} = req.session;
  let allowedRoles=(constantCommon.rbac.role_id.corporate_admin==role_id)
  let filterData = req.body.filterType;

  if(allowedRoles){
    query+=` where v.corporate_id=(select corporate_id from users where id = ${user_id}) `
  }
else{
  query=`where true `
}

  if (filterData.length) {
    for (let i = 0; i < filterData.length; i++) {
      if (filterData[i].type == "date") {
        fromDate = filterData[i].value[0];
        toDate = filterData[i].value[1];

        filterQuery = ` and v.${filterData[i].column} BETWEEN "${fromDate}:00:00:00" AND "${toDate}:23:59:59" `;

        query += filterQuery;
      } else {
        let filterQuery = `AND ${filterData[i].column} = "${filterData[i].value}"`;
        query += filterQuery;
      }
    }
  }

  return query;
};

const fetchAllVoucher: IController = async (req, res) => {
  try {
    let query = fetchAllVoucherQuery(req);
console.log("query",query)
    let voucher = await VoucherService.fetchAllVoucher(
      req.body.pageSize,
      req.body.pageIndex,
      req.body.sort,
      query,
      true
    );
    let count = await VoucherService.fetchAllVoucherCount(query);

    if (voucher instanceof Error) {
      return apiResponse.error(
        res,
        httpStatusCodes.BAD_REQUEST,
        voucher.message
      );
    } else {
      return apiResponse.result(
        res,
        { data: voucher, total: count },
        httpStatusCodes.OK
      );
    }
  } catch (error: any) {
    LOGGER.info("Error => ", error);
    return apiResponse.error(res, httpStatusCodes.BAD_REQUEST);
  }
};

const fetchVoucherById: IController = async (req, res) => {
  VoucherService.fetchVoucherById(req.query.id)

    .then((voucher: any) => {
      if (voucher instanceof Error) {
        apiResponse.error(res, httpStatusCodes.BAD_REQUEST, voucher.message);
      } else {
        apiResponse.result(res, voucher, httpStatusCodes.OK);
      }
    })
    .catch((err: any) => {
      apiResponse.error(res, httpStatusCodes.BAD_REQUEST);
    });
};

const deleteVoucher: IController = async (req, res) => {
  VoucherService.deleteVoucher(req.query.id)
    .then((voucher: any) => {
      if (voucher instanceof Error) {
        apiResponse.error(res, httpStatusCodes.BAD_REQUEST, voucher.message);
      } else {
        apiResponse.result(res, voucher, httpStatusCodes.OK);
      }
    })
    .catch((err: any) => {
      apiResponse.error(res, httpStatusCodes.BAD_REQUEST);
    });
};

//

const fetchCorporateForVoucherDetails: IController = async (req, res) => {
  VoucherService.fetchCorporateForVoucherDetails(req.query.id)
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

const fetchSubscriptionForVoucherDetails: IController = async (req, res) => {
  VoucherService.fetchSubscriptionForVoucherDetails()
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

const getPriceByID: IController = async (req, res) => {
  VoucherService.getPriceByID(req.query.id)
    .then((price: any) => {
      if (price instanceof Error) {
        apiResponse.error(res, httpStatusCodes.BAD_REQUEST, price.message);
      } else {
        apiResponse.result(res, price, httpStatusCodes.OK);
      }
    })
    .catch((err: any) => {
      apiResponse.error(res, httpStatusCodes.BAD_REQUEST);
    });
};

const updateNoOfUses: IController = async (req, res) => {
  VoucherService.updateNoOfUses(req.body.id, req.body.number_of_uses)
    .then((voucher: any) => {
      if (voucher instanceof Error) {
        apiResponse.error(res, httpStatusCodes.BAD_REQUEST, voucher.message);
      } else {
        apiResponse.result(res, voucher, httpStatusCodes.OK);
      }
    })
    .catch((err: any) => {
      apiResponse.error(res, httpStatusCodes.BAD_REQUEST);
    });
};

const bulkDeleteVoucher: IController = async (req, res) => {
  try {
    if (req.body.id) {
      const result: any = await VoucherService.bulkDeleteVoucher(req.body.id);

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

const deactivateVoucher: IController = async (req, res) => {
  try {
    if (req.body.voucher_id || req.body.user_id) {
      const deactivateVoucherUser: any =
        await VoucherService.deactivateVoucherUser(
          req.body.user_id,
          req.body.voucher_id
        );
      const deactivateVoucher: any = await VoucherService.deactivateVoucher(
        req.body.voucher_id
      );

      if (deactivateVoucherUser instanceof Error) {
        LOGGER.info("Controller Error : ", deactivateVoucherUser.message);
        apiResponse.error(
          res,
          httpStatusCodes.BAD_REQUEST,
          deactivateVoucherUser.message
        );
      }
      if (deactivateVoucher instanceof Error) {
        LOGGER.info("Controller Error : ", deactivateVoucher.message);
        apiResponse.error(
          res,
          httpStatusCodes.BAD_REQUEST,
          deactivateVoucher.message
        );
      } else {
        LOGGER.info(" DEACTIVATE SUCCESSFULLY");
        apiResponse.result(res, deactivateVoucherUser, httpStatusCodes.OK);
      }
    } else {
      apiResponse.error(
        res,
        httpStatusCodes.BAD_REQUEST,
        "voucher ID Required."
      );
    }
  } catch (error) {
    LOGGER.info("Controller Error : ", error);
    apiResponse.error(res, httpStatusCodes.BAD_REQUEST);
  }
};

const getVoucherUser: IController = async (req, res) => {
  VoucherService.getVoucherUser(req.query.id)
    .then((voucher: any) => {
      if (voucher instanceof Error) {
        apiResponse.error(res, httpStatusCodes.BAD_REQUEST, voucher.message);
      } else {
        apiResponse.result(res, voucher, httpStatusCodes.OK);
      }
    })
    .catch((err: any) => {
      apiResponse.error(res, httpStatusCodes.BAD_REQUEST);
    });
};

const fetchVoucherUsers: IController = async (req, res) => {
  try {
    let query = " ";
    if (req.body.query != "") {
      query = ` WHERE ( name like '%${req.body.query}% ' ) `;
    }
    let voucher = await VoucherService.fetchVoucherUsers(
      req.body.id,
      req.body.pageSize,
      req.body.pageIndex,
      req.body.sort,
      query
    );

    let count = await VoucherService.fetchVoucherUsersCount(req.body.id);

    if (voucher instanceof Error) {
      return apiResponse.error(
        res,
        httpStatusCodes.BAD_REQUEST,
        voucher.message
      );
    } else {
      return apiResponse.result(
        res,
        { data: voucher, total: count },
        httpStatusCodes.OK
      );
    }
  } catch (error: any) {
    LOGGER.info("Error => ", error);
    return apiResponse.error(res, httpStatusCodes.BAD_REQUEST);
  }
};

const PoUpload: IController = async (req, res) => {
  let Paidvoucher: any;
  try {
    Paidvoucher = await VoucherService.PoUpload(req);

    if (Paidvoucher instanceof Error) {
      apiResponse.error(res, httpStatusCodes.BAD_REQUEST, Paidvoucher.message);
    } else {
      apiResponse.result(res, Paidvoucher, httpStatusCodes.CREATED);
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

const downloadVoucher: IController = async (req, res) => {
  try {
    const voucherId = req.body.voucherId;
    const result = await VoucherService.voucherDownload(voucherId);
    apiResponse.result(res, result, httpStatusCodes.ACCEPTED);
  } catch (error: any) {
    apiResponse.error(res, httpStatusCodes.BAD_REQUEST, error.message);
  }
};

const UserGiftPopUp: IController = async (req, res) => {
  //@ts-ignore
  VoucherService.UserGiftPopUp(req.query.id, req.session.id)
    .then((userGift: any) => {
      if (userGift instanceof Error) {
        apiResponse.error(res, httpStatusCodes.BAD_REQUEST, userGift.message);
      } else {
        userGift.showPopUp = 1;
        apiResponse.result(res, userGift, httpStatusCodes.OK);
      }
    })
    .catch((err: any) => {
      apiResponse.error(res, httpStatusCodes.BAD_REQUEST);
    });
};

export default {
  createVoucher,
  webhookVoucher,
  verifyVoucher,
  voucherApply,
  fetchAllVoucher,
  fetchVoucherById,
  deleteVoucher,
  getVoucherUser,
  fetchCorporateForVoucherDetails,
  fetchSubscriptionForVoucherDetails,
  getPriceByID,
  bulkDeleteVoucher,
  fetchVoucherUsers,
  PoUpload,
  downloadVoucher,
  deactivateVoucher,
  updateNoOfUses,
  UserGiftPopUp,
  fetchAllVoucherQuery
};
