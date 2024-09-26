import express from "express";
const router = express.Router();
import { celebrate } from "celebrate";
import WolooHostController from "../../Controllers/WolooHost.controller";
import WolooHostSchema from "../../Constants/Schema/WolooHost.schema";

router.post("/create", WolooHostController.createWolooHost);

router.post("/addWoloo", WolooHostController.addWolooHost);

router.post(
  "/all",
  celebrate(WolooHostSchema.fetchWolooHost),
  WolooHostController.fetchWolooHost
);

router.get(
  "/byId",
  celebrate(WolooHostSchema.fetchWolooHostById),
  WolooHostController.fetchWolooHostById
);

router.put(
  "/",
  celebrate(WolooHostSchema.updateWolooHost),
  WolooHostController.updateWolooHost
);

router.put(
  "/delete",
  celebrate(WolooHostSchema.deleteWolooHostById),
  WolooHostController.deleteWolooHostById
);

router.post("/nearBy", WolooHostController.fetchNearBy);

router.post("/bulkUpload", WolooHostController.bulkUploadWoloos);

// Gift Subscription
router.post("/addCoins", WolooHostController.addCoins);
router.post("/addCoinsWebhook", WolooHostController.addCoinsWebhook); // Removed order_paid event from razorpay webhook

router.post(
  "/nearByWolooAndOfferCount",
  WolooHostController.getNearByWolooAndOfferCount
);
router.post("/ownerHistory", WolooHostController.ownerHistory);

router.post("/woloo_engagements", WolooHostController.wolooLike);
router.get("/wolooEngagementCount", WolooHostController.wolooEngagementCount);
router.get("/user_coins", WolooHostController.userCoins);
router.post("/submitReview", WolooHostController.submitReview);
router.get("/wolooRewardHistory", WolooHostController.wolooRewardHistory);
router.post("/recommendWoloo", WolooHostController.recommendWoloo);
router.post("/userRecommendWoloo", WolooHostController.userRecommendWoloo);
router.post("/nearByWolooAndOfferCount", WolooHostController.getNearByWolooAndOfferCount)
router.post("/devicePayload", WolooHostController.devicePayload);
router.post("/enroute", WolooHostController.enroute);
router.get("/getLikeStatus", WolooHostController.getLikestatus);

export default router;
