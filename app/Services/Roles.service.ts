import { AnyAaaaRecord, AnyMxRecord } from "dns";
import _, { cloneDeep } from "lodash";
import { RoleModel } from "../Models/Roles.model";

const addRole = async (data: any) => {
  try {
    let role:any = await new RoleModel().addRole(data);
    console.log("role",role)
    if (!role.affectedRows) throw new Error("operation  failed");
    return { Response: "ROLE SUCCESSFULLY CREATED ! " };
  } catch (error:any) {
    console.log("Error While Adding role",error)
    return new Error(error)
  }
};

const getAllRoles = async (
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

    let roles:any = await new RoleModel().getAllRoles(
      pageSize,
      (pageIndex - 1) * pageSize,
      orderQuery,
      query
    );

    if (roles.length < 1) return Error("details did not match");

    return roles;
  } catch (error: any) {
    return error;
  }
};

const deleteRoleById = async (id: any) => {

  let role:any = await new RoleModel().deleteRoleById(id);
  if (!role.affectedRows) return new Error("Record Not Found");
  console.log("role",role.affectedRows)
  return { Response: "ROLE DELETED SUCCESSFULLY" };
};

const getAllRoleCount = async (query: any) => {
  let total:any = await new RoleModel().getAllRolesCount(query);

  return total[0].count;
};

const fetchRoleById = async (id: any) => {
  let role:any = await new RoleModel().fetchRolesById(id);
  if (role.length < 1) return Error("Record Not Found  !");

  return role[0];
};

const updateRole = async (req: any) => {
  try {
    // @ts-ignore
    let role:any = await new RoleModel().updateRole(
      req.body,
      req.body.id
    );

    if (role.affectedRows == 0)
      return Error("Record Not Found for given ID !");

    return { Response: "ROLE SUCCESSFULLY UPDATED !" };
  } catch (e:any) {
    return new Error(e)
  }
};

export default {
  addRole,
  getAllRoles,
  deleteRoleById,
  getAllRoleCount,
  fetchRoleById,
  updateRole,
};
