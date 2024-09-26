import IController from "../Types/IController";
import BlogService from "../Services/Blog.service";
import apiResponse from "../utilities/ApiResponse";
import { ApiResponseWithMessage } from "../utilities/ApiResponse";
import httpStatusCodes from "http-status-codes";
import LOGGER from "../config/LOGGER";
// const path = require('path')

const getBlogsForUserByCategory: IController = async (req: any, res) => {
  // const host = request().getSchemeAndHttpHost();
  const url = req._parsedUrl;
  const fullPath = req.headers.host + url.pathname;


  let result;
  try {
    result = await BlogService.getBlogsForUserByCategory(
      req.session.id,
      req.body.category,
      url.path,
      req.body.page
    );
    //if(Object.keys(result).length === 0) result=[]
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

const getUserSavedCategories: IController = async (req: any, res) => {
  let result: any;
  try {
    let userId = req.session.id;
    result = await BlogService.getUserSavedCategories(userId);
    if (result instanceof Error) {
      return ApiResponseWithMessage.error(
        res,
        httpStatusCodes.BAD_REQUEST,
        result.message
      );
    } else {
      if (!result.length) {
        return ApiResponseWithMessage.result(res, result, httpStatusCodes.OK, "No data found");
      }
      return ApiResponseWithMessage.result(res, result, httpStatusCodes.OK, "user_saved_categories");
    }
  } catch (error: any) {
    LOGGER.info("Error => ", error);
    return apiResponse.error(res, httpStatusCodes.BAD_REQUEST);
  }
};
const getBlogs: IController = async (req: any, res) => {
  let result;
  try {
    let query = "where status=1 ";

    result = await BlogService.getBlogs(
      req.body.pageSize,
      req.body.pageIndex,
      req.body.sort,
      query
    );
    let count = await BlogService.getBlogsCount(query);
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
const getBlogsbyID: IController = async (req: any, res) => {
  let result;
  try {
    result = await BlogService.getBlogsbyID(req.body.blog_id);
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
const getCategories: IController = async (req: any, res) => {
  let result;
  try {
    result = await BlogService.getCategories(req);
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
const getCategoriesbyId: IController = async (req: any, res) => {
  let result;
  try {
    result = await BlogService.getCategoriesbyId(req.query.id);
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
const getSubCategoriesbyId: IController = async (req: any, res) => {
  let result;
  try {
    result = await BlogService.getSubCategoriesbyId(req.query.id);
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
const getBlogs_byId: IController = async (req: any, res) => {
  let result;
  try {
    result = await BlogService.getBlogs_byId(req.query.id);
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
const insert_blog_category: IController = async (req: any, res) => {
  let result: any;
  try {
    result = await BlogService.insertBlogCategory(req);
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
const insert_blog_Subcategory: IController = async (req: any, res) => {
  let result: any;
  try {
    result = await BlogService.insert_blog_Subcategory(req);
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
const deleteBlogCategorybyId: IController = async (req: any, res) => {
  let result: any;
  try {
    result = await BlogService.deleteBlogCategorybyId(req);
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
const deleteBlogSubCategorybyId: IController = async (req: any, res) => {
  let result: any;
  try {
    result = await BlogService.deleteBlogSubCategorybyId(req);
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
const deleteBlogbyId: IController = async (req: any, res) => {
  let result: any;
  try {
    result = await BlogService.deleteBlogbyId(req);
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
const updateBlogCategory: IController = async (req: any, res) => {
  let result: any;
  try {
    result = await BlogService.updateBlogCategory(req);
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
const updateBlogSubCategory: IController = async (req: any, res) => {
  let result: any;
  try {
    result = await BlogService.updateBlogSubCategory(req);
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
const update_Blog: IController = async (req: any, res) => {
  let result: any;
  try {
    result = await BlogService.update_Blog(req);
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
const create_Blog: IController = async (req: any, res) => {
  let result: any;
  try {
    result = await BlogService.create_Blog(req);
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
const blogReadPoint: IController = async (req: any, res) => {
  let result;
  try {
    result = await BlogService.blogReadPoint(req.session.id, req.query.blog_id);
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
    return apiResponse.error(
      res,
      httpStatusCodes.BAD_REQUEST,
      "Something went wrong !"
    );
  }
};
const ctaLikes: IController = async (req: any, res) => {
  let result: any;
  try {
    result = await BlogService.ctaLikes(req);
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
    return apiResponse.error(
      res,
      httpStatusCodes.BAD_REQUEST,
      "Something went wrong !"
    );
  }
};

const ctaFavourite: IController = async (req: any, res) => {
  let result;
  try {
    result = await BlogService.ctaFavourite(req);
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
    return apiResponse.error(
      res,
      httpStatusCodes.BAD_REQUEST,
      "Something went wrong !"
    );
  }
};


const saveUserCategory: IController = async (req: any, res) => {
  let result: any;
  try {
    result = await BlogService.saveUserCategory(req);
    if (result instanceof Error) {
      return ApiResponseWithMessage.error(
        res,
        httpStatusCodes.BAD_REQUEST,
        result.message
      );
    } else {
      return ApiResponseWithMessage.result(res, result, httpStatusCodes.OK, "success");
    }
  } catch (error: any) {
    LOGGER.info("Error => ", error);
    return apiResponse.error(
      res,
      httpStatusCodes.BAD_REQUEST,
      "Something went wrong !"
    );
  }
};
const ctaBlogRead: IController = async (req: any, res) => {
  let result;
  try {
    result = await BlogService.ctaBlogRead(req);
    if (result instanceof Error) {
      return ApiResponseWithMessage.error(
        res,
        httpStatusCodes.BAD_REQUEST,
        result.message
      );
    } else {
      return ApiResponseWithMessage.result(res, result, httpStatusCodes.OK, "success");
    }
  } catch (error: any) {
    LOGGER.info("Error => ", error);
    return apiResponse.error(
      res,
      httpStatusCodes.BAD_REQUEST,
      "Something went wrong !"
    );
  }
};

const ecomCoinTotal: IController = async (req: any, res) => {
  let result: any;
  try {
    result = await BlogService.ecomCoinTotal(req.session.id);
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

const ecomCoinUpdate: IController = async (req: any, res) => {
  let result: any;
  let userId = req.session.id;
  let type = req.body.type;
  let coins = req.body.coins;
  let orderid = req.body.orderid;
  try {
    result = await BlogService.ecomCoinUpdate(userId, type, coins, orderid);
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
    return apiResponse.error(res, httpStatusCodes.BAD_REQUEST, error.message);
  }
};

const ecomTransactionFail: IController = async (req: any, res) => {
  let result: any;
  let userId = req.session.id;
  let transactionId = req.query.transaction_id;

  try {
    result = await BlogService.ecomTransactionFail(userId, transactionId);

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
    return apiResponse.error(res, httpStatusCodes.BAD_REQUEST, error.message);
  }
};
const getAllCategories: IController = async (req: any, res) => {
  let result;
  try {
    let query = " ";
    if (req.body.query != "") {
      query = ` WHERE ( category_name like '%${req.body.query}%' OR created_at like '%${req.body.query}%' ) `;
    }
    result = await BlogService.getAllCategories(
      req.body.pageSize,
      req.body.pageIndex,
      req.body.sort,
      query,
      req.body.isAll
    );
    let count = await BlogService.getAllCategoriesCount(query, req.body.isAll);

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
const getAllSubCategories: IController = async (req: any, res) => {
  let result;
  try {
    let query = " ";
    if (req.body.query != "") {
      query = ` WHERE ( bc.category_name like '%${req.body.query}%' OR bsc.sub_category like '%${req.body.query}%' OR bsc.created_at like '%${req.body.query}%' ) `;
    }
    result = await BlogService.getAllSubCategories(
      req.body.pageSize,
      req.body.pageIndex,
      req.body.sort,
      query,
      req.body.isAll,
      req.body.id
    );
    let count = await BlogService.getAllSubCategoriesCount(query, req.body.isAll);

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

export default {
  getUserSavedCategories,
  getBlogs,
  getBlogsbyID,
  getCategories,
  blogReadPoint,
  getBlogsForUserByCategory,
  ecomCoinTotal,
  ecomCoinUpdate,
  ecomTransactionFail,
  ctaLikes,
  getAllCategories,
  getAllSubCategories,
  ctaFavourite,
  ctaBlogRead,
  saveUserCategory,
  getCategoriesbyId,
  insert_blog_category,
  deleteBlogCategorybyId,
  updateBlogCategory,
  getSubCategoriesbyId,
  insert_blog_Subcategory,
  deleteBlogSubCategorybyId,
  updateBlogSubCategory,
  update_Blog,
  deleteBlogbyId,
  getBlogs_byId,
  create_Blog
};
