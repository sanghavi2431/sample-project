import { Router } from "express";
import wolooHostRoute from "./WolooHost/WolooHost.route";
import wolooGuestRoute from "./WolooGuest/WolooGuest.route";
import corporateRoute from "./Corporate/Corporate.route.";
import subscriptionRoute from "./Subscription/Subscription.route";
import voucherRoute from "./Voucher/Voucher.route";
import healthCheck from "./HealthCheck/index";
import settingRoute from "./Setting/setting.route";
import transactionRoute from "./Transaction/Transaction.route";
import franchiseRoute from "./Franchise/Franchise.route";
import blogRoute from "./Blog/Blog.route";
import client from "./Auth/Client.route";
import roles from "./Roles/Roles.route.";
import offer from "./Offer/Offer.route";


const router = Router();

router.use("/wolooGuest", wolooGuestRoute);
router.use("/wolooHost", wolooHostRoute);
router.use("/corporate", corporateRoute);
router.use("/subscription", subscriptionRoute);
router.use("/voucher", voucherRoute);
router.use("/healthCheck", healthCheck);
router.use("/setting", settingRoute);
router.use("/transaction", transactionRoute);
router.use("/franchise",franchiseRoute)
router.use("/blog",blogRoute);
router.use("/client",client);
router.use("/roles",roles);
router.use("/offer",offer);


export default router;
