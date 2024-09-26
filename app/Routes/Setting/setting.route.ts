import express from "express";
const router = express.Router();
import { celebrate } from "celebrate";
import settingController from "../../Controllers/Setting.controller";

router.get(
  "/getSetting",
  settingController.getSetting
);
router.post(
  "/addNew",
  settingController.addNew
);
router.put(
  "/",
  settingController.updateSetting
);
router.put(
  "/deleteSetting",
  settingController.deleteSetting
)

export default router;
