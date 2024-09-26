import express from "express";
import WolooGuestController from "../../Controllers/WolooGuest.controller";
import { celebrate } from "celebrate";
import WolooGuestSchema from "../../Constants/Schema/WolooGuest.schema";

const router = express.Router();
router.post("/create", WolooGuestController.createWolooGuest);

router.put(
  "/delete",
  celebrate(WolooGuestSchema.deleteWolooGuestById),
  WolooGuestController.deleteWolooGuestById
);
router.post(
  '/createClient',
  celebrate(WolooGuestSchema.createClient),
  WolooGuestController.createClient,
);

router.post(
  '/adminCreateClient',
  celebrate(WolooGuestSchema.adminCreateClient),
  WolooGuestController.adminCreateClient,
);

router.get(
  "/byId",
  celebrate(WolooGuestSchema.fetchWolooGuestById),
  WolooGuestController.fetchWolooGuestById
);

router.get(
  "/profile",
  celebrate(WolooGuestSchema.fetchWolooGuestProfile),
  WolooGuestController.fetchWolooGuestProfile
);

router.post(
  "/all",
  celebrate(WolooGuestSchema.fetchAllWolooGuest),
  WolooGuestController.fetchAllWolooGuest
);

router.post("/sendOTP", WolooGuestController.sendOTP);
router.post("/sendOTPForHost", WolooGuestController.sendOTPForHost);

router.post("/updateDeviceToken", WolooGuestController.updateDeviceToken);
router.post("/verifyOTP", WolooGuestController.verifyOTP);
router.post("/verifyOTPForHost", WolooGuestController.verifyOTPForHost);


router.put(
  "/",
  celebrate(WolooGuestSchema.updateWolooGuest),
  WolooGuestController.updateWolooGuest
);
router.post("/appConfig", WolooGuestController.getAppConfig);
router.put(
  "/bulkdelete",
  celebrate(WolooGuestSchema.deleteWolooGuestByMultiId),
  WolooGuestController.deleteWolooGuestByMultiId
);

//TODO Need to move it to admin
router.post("/login", WolooGuestController.login);

//TODO Need to move it to admin
// router.post("/login", WolooHostController.login);

router.get("/wolooNavigationReward", WolooGuestController.navigationReward);

router.get(
  "/profileStatus",
  celebrate(WolooGuestSchema.profileStatus),
  WolooGuestController.profileStatus
);

router.get(
  "/coinHistory",
  // celebrate(WolooGuestSchema.fetchAllWolooGuest),
  WolooGuestController.coinHistory
);

router.post("/userWoloooRating", WolooGuestController.fetchAllUserWolooRating);
router.post(
  "/thirstReminder",
  celebrate(WolooGuestSchema.thirstReminder),
  WolooGuestController.thirstReminder
);

router.post(
  "/periodtracker",
  celebrate(WolooGuestSchema.periodTracker),
  WolooGuestController.periodtracker
);

router.get(
  "/viewperiodtracker",
  celebrate(WolooGuestSchema.viewperiodtracker),
  WolooGuestController.viewperiodtracker
);

router.post("/getUsersReport", WolooGuestController.getUsersReport);

router.post(
  "/gift-voucher",
  // celebrate(WolooGuestSchema.fetchAllWolooGuest),
  WolooGuestController.giftVoucher
);

router.post(
  "/reportSubscription",
  // celebrate(WolooGuestSchema.fetchAllWolooGuest),
  WolooGuestController.userReportSubscription
);

router.post(
  "/owner-wise-history",
  // celebrate(WolooGuestSchema.ownerWiseHistory),
  WolooGuestController.ownerWiseHistory
);

router.post("/export", WolooGuestController.exportXl);

router.post("/customerHistory", WolooGuestController.customerHistory);

router.get("/pointsSource", WolooGuestController.getPointsSource);

router.get("/usersList", WolooGuestController.getUsers);

router.post("/userVoucherUsage", WolooGuestController.getUserVoucherUsage);

router.get("/corporateList", WolooGuestController.getCorporate);
router.get("/getReviewOptions", WolooGuestController.getReviewOptions);
router.post("/getReviewList", WolooGuestController.getReviewList);
router.get(
  "/getPendingReviewStatus",
  WolooGuestController.getPendingReviewStatus
);
router.get("/wahcertificate", WolooGuestController.wahcertificate);
router.post("/reverseGeocoding", WolooGuestController.reverseGeocoding);
router.post("/invite",
  // celebrate(WolooGuestSchema.invite),
  WolooGuestController.invite);

router.get("/invite/web_invite_page", WolooGuestController.web_invite_page);
router.post("/registration", WolooGuestController.registration);

router.get("/corporateList", WolooGuestController.getCorporate);

router.get("/myOffers", WolooGuestController.myOffers);
router.get("/redeemOffer", WolooGuestController.redeemOffer);

router.get("/getGiftPlan", WolooGuestController.getGiftPlan);

router.post("/sendGiftSubscription",
  celebrate(WolooGuestSchema.sendGiftSubscription),
  WolooGuestController.sendGiftSubscription);

router.get("/scanWoloo", WolooGuestController.scanWoloo)

router.post("/getUserOffer",
  celebrate(WolooGuestSchema.getUserOffer),
  WolooGuestController.getUserOffer)

router.get(
  "/fetchUserOfferByID",
  celebrate(WolooGuestSchema.fetchUserOfferByID),
  WolooGuestController.fetchUserOfferByID
);
router.post(
  "/addUserOffer",
  celebrate(WolooGuestSchema.addUserOffer),
  WolooGuestController.addUserOffer
);

router.put(
  "/updateUserOffer",
  celebrate(WolooGuestSchema.updateUserOffer),
  WolooGuestController.updateUserOffer
);

router.put(
  "/deleteUserOfferById",
  celebrate(WolooGuestSchema.deleteUserOfferById),
  WolooGuestController.deleteUserOfferById
);
router.get(
  "/getOffer",
  WolooGuestController.getOffer
);
router.get(
  "/getRoles",
  WolooGuestController.getRoles
);
router.get(
  "/getUserDetailByUser_id",
  WolooGuestController.getUserDetailByUser_id
);

router.post(
  "/userLog",
  WolooGuestController.userLog
);

router.post(
  "/forgetPassword",
  WolooGuestController.forgetPassword
);


router.post(
  "/resetPassword",
  WolooGuestController.resetPassword
);
export default router;
