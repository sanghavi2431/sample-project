import express from "express";
import offerController from "../../Controllers/Offer.controller";
import * as fileValidationMiddleware from "../../Middlewares/File.Middleware";
import upload from "../../utilities/Storage.Util";
const router = express.Router();

router.post("/createOffer",
  upload.single("image"),
  fileValidationMiddleware.validateSingleFile("image", true, ['image/jpg', 'image/jpeg', 'image/png']),
  offerController.create
);
router.put("/deleteOfferById", offerController.deleteOffer);

router.put("/updateOffer",
  upload.single("image"),
  fileValidationMiddleware.validateSingleFile("image", true, ['image/jpg', 'image/jpeg', 'image/png']),
  offerController.updateOffer
);

router.post("/getAllOffer", offerController.getAllOffer)
router.get("/getOfferById",
  offerController.getOfferById);



export default router;
