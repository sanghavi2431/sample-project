import express from "express";
const router = express.Router();
import { celebrate } from "celebrate";

import RoleSchema from "../../Constants/Schema/Role.schema";

import roleController from "../../Controllers/Role.controller";

router.post(
  "/",
  celebrate(RoleSchema.addRole),
  roleController.addRole
);

router.post(
  "/all",
  celebrate(RoleSchema.getRole),
  roleController.getRole
);

router.get(
  "/",
  celebrate(RoleSchema.fetchRoleById),
  roleController.fetchRoleById
);

router.put(
  "/",
  celebrate(RoleSchema.updateRole),
  roleController.updateRole
);

router.put(
  "/delete",
  celebrate(RoleSchema.deleteRole),
  roleController.deleteRoleById
);

export default router;
