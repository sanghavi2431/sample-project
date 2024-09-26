import { FranchiseModel } from "../Models/Franchise.model";
import moment from "moment";

const getAllFranchise = async (
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
        let franchise = await new FranchiseModel().getAllFranchise(
            pageSize,
            (pageIndex - 1) * pageSize,
            orderQuery,
            query
        );

        if (franchise.length < 1) return Error("details did not match");
        return franchise;

    }
    catch (error: any) {
        return error;

    }
}
const getAllFranchiseCOunt=async( query: any)=>{
    let total = await new FranchiseModel().getAllFranchiseCOunt(query);
    return total[0].count;
  
}

export default{
    getAllFranchise,
    getAllFranchiseCOunt
}