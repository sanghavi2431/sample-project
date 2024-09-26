import express from "express";
import VoucherController from "../../Controllers/Voucher.controller";
import { celebrate } from "celebrate";
import VoucherSchema from "../../Constants/Schema/Voucher.schema";

const router = express.Router();

router.post(
  "/all",
  celebrate(VoucherSchema.fetchAllVoucher),
  VoucherController.fetchAllVoucher
);

router.get(
  "/",
  celebrate(VoucherSchema.fetchVoucherById),
  VoucherController.fetchVoucherById
);

router.put(
  "/delete",
  celebrate(VoucherSchema.deleteVoucher),
  VoucherController.deleteVoucher
);

router.get(
  "/users",
  celebrate(VoucherSchema.getVoucherUser),
  VoucherController.getVoucherUser
);

router.post(
  "/create",
  // celebrate(VoucherSchema.createVoucher),
  VoucherController.createVoucher
);

router.get("/webhook", VoucherController.webhookVoucher);

router.post(
  "/apply",
  celebrate(VoucherSchema.voucherApply),
  VoucherController.voucherApply
);

router.get(
  "/corporateVoucher",
  celebrate(VoucherSchema.fetchCorporateForVoucherDetails),
  VoucherController.fetchCorporateForVoucherDetails
);

router.get(
  "/subscriptionVoucher",
  celebrate(VoucherSchema.fetchSubscriptionForVoucherDetails),
  VoucherController.fetchSubscriptionForVoucherDetails
);

router.get(
  "/getPriceByID",
  celebrate(VoucherSchema.getPriceByID),
  VoucherController.getPriceByID
);

router.put(
  "/bulkdelete",
  celebrate(VoucherSchema.bulkDeleteVoucher),
  VoucherController.bulkDeleteVoucher
);

router.put(
  "/deactivate_voucher",
  celebrate(VoucherSchema.deactivateVoucher),
  VoucherController.deactivateVoucher
);

router.put(
  "/update_no_of_uses",
  //celebrate(VoucherSchema.deactivateVoucher),
  VoucherController.updateNoOfUses
);

router.post(
  "/no_of_users",

  celebrate(VoucherSchema.fetchVoucherUsers),
  VoucherController.fetchVoucherUsers
);

router.post("/po_upload", VoucherController.PoUpload);

router.post("/download", VoucherController.downloadVoucher);

router.get(
  "/UserGiftPopUp",
  VoucherController.UserGiftPopUp
);

export default router;
