import { OfferModel } from "./../Models/Offer.model";
import { WolooHostModel } from "./../Models/WolooHost.model";
import config from "../config";


const offerModel = new OfferModel();
const wolooHostModel = new WolooHostModel();

const create = async (req: any) => {
  try {
    let wolooCode = req.woloo_code
    delete req.woloo_code
    let getWolooId = await wolooHostModel.getWolooId(wolooCode)
    if (getWolooId.length) {
      req.woloo_id = getWolooId[0].id
    }
    req.status = 1
    var result = await offerModel.createOffer(req);
    return result;
  } catch (e: any) {
    throw e;
  }
};

const deleteOffer = async (req: any) => {
  try {
    var result = await offerModel.deleteOffer(req.query.id);
    return result;
  } catch (e: any) {
    throw e;
  }
};
const getOfferByID = async (id: any) => {
  try {
    var result = await offerModel.getOfferByID(id);
    return result;
  } catch (e: any) {
    throw e;
  }
};
const updateOffer = async (data: any, id: any) => {
  try {
    let wolooCode = data.woloo_code
    delete data.woloo_code
    let getWolooId = await wolooHostModel.getWolooId(wolooCode)
    if (getWolooId.length) {
      data.woloo_id = getWolooId[0].id
    }
    var result = await offerModel.updateOffer(data, id);
    return result;
  } catch (e: any) {
    throw e;
  }
};

const getAllOffer = async (
  pageSize: any,
  pageIndex: any,
  sort: any,
  query: string
) => {
  try {
    let orderQuery: string;
    if (sort.key != "") {
      orderQuery = " ORDER BY " + sort.key + " " + sort.order + " ";
    } else {
      orderQuery = " ORDER BY id DESC";
    }

    let offer = await offerModel.getAllOffer(
      pageSize,
      (pageIndex - 1) * pageSize,
      orderQuery,
      query
    );

    if (offer.length < 1) return Error("details did not match");

    for (let obj of offer) {
      (obj.status =
        obj.status == "1"
          ? { label: "ACTIVE", value: 1 }
          : { label: "INACTIVE", value: 0 });
      obj.base_url = config.s3imagebaseurl
    }

    return offer;
  } catch (error: any) {
    return error;
  }
};

const getAllOfferCount = async (query: any) => {
  let total = await offerModel.getAllOfferCount(query);
  return total[0].count;
};

export default {
  create,
  deleteOffer,
  updateOffer,
  getOfferByID,
  getAllOffer,
  getAllOfferCount
};