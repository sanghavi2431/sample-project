import { Transactions } from "../Models/Transactions";

const getTransactionDetails = async (
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
      orderQuery = "ORDER BY id DESC";
    }

    let transaction = await new Transactions().getTransactionDetails(
      pageSize,
      (pageIndex - 1) * pageSize,
      orderQuery,
      query
    );

    if (transaction.length < 1) return Error("details did not match");
    return transaction;
  } catch (error: any) {
    return error;
  }
};
const getTransactionDetailsById = async (id:any) => {
  try {
      let transaction = await new Transactions().getTransactionDetailsById(id)
      if (transaction.length < 1) return Error("Invalid Id");
      return transaction[0];
  }
  catch (error: any) {
      return error;
    }
    
}
const getAllTransactionDetailsCount = async (query: any) => {
  let total = await new Transactions().getAllTransactionDetailsCount(query);

  return total[0].count;
};
export default {
  getTransactionDetails,
  getAllTransactionDetailsCount,
  getTransactionDetailsById
};
