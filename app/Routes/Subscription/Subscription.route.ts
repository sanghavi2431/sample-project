import express from "express";
import SubscriptionController from "../../Controllers/Subscription.controller";
import { celebrate } from "celebrate";
import SubscriptionSchema from "../../Constants/Schema/Subscription.schema";

const router = express.Router();

router.post("/create", SubscriptionController.createSubscription);

router.put(
  "/delete",
  celebrate(SubscriptionSchema.deleteSubscription),
  SubscriptionController.deleteSubscription
);

router.get(
  "/is_insurance",
  celebrate(SubscriptionSchema.isInsurance),
  SubscriptionController.isInsurance
);

router.get(
  "/",
  celebrate(SubscriptionSchema.fetchSubscriptionById),
  SubscriptionController.fetchSubscriptionById
);

router.post(
  "/all",
  celebrate(SubscriptionSchema.fetchAllSubscription),
  SubscriptionController.fetchAllSubscription
);

router.put(
  "/",
  celebrate(SubscriptionSchema.updateSubscription),
  SubscriptionController.updateSubscription
);

router.put(
  "/bulkdelete",
  celebrate(SubscriptionSchema.bulkDeleteSubscription),
  SubscriptionController.bulkDeleteSubscription
);

// router.put(
//   "/initSubscriptionByOrder",
//   SubscriptionController.initSubscriptionByOrder
// );

router.post(
  "/initSubscription",
  celebrate(SubscriptionSchema.initSubscription),
  SubscriptionController.initSubscription
);

router.post(
  "/initSubscriptionByOrder",
  celebrate(SubscriptionSchema.initSubscriptionByOrder),
  SubscriptionController.initSubscriptionByOrder
);

router.get(
  "/getPlan",
  SubscriptionController.fetchSubscriptionPlans

);

router.post(
  "/submitSubscriptionPurchase",
  celebrate(SubscriptionSchema.submitSubscriptionPurchase),
  SubscriptionController.submitSubscriptionPurchase
);

router.post(
  "/cancelSubscription",
  celebrate(SubscriptionSchema.cancelSubscription),
  SubscriptionController.cancelSubscription
);

router.get(
  "/userSubscriptionStatus",
  SubscriptionController.userSubscriptionStatus
);

router.get(
  "/mySubscription",
  SubscriptionController.mySubscription
);

export default router;
