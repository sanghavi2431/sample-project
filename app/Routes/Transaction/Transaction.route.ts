import { celebrate } from "celebrate";
import express from "express"
import TransactionSchema from "../../Constants/Schema/Transaction.schema";
const router = express.Router();
import TransactionController from "../../Controllers/Transaction.controller";

router.post(
    "/",
    celebrate(TransactionSchema.fetchAllTransaction),
    TransactionController.getTransactionDetails
)
router.get(
    "/getTransactionById",
    celebrate(TransactionSchema.fetchTransactionByID),
    TransactionController.getTransactionDetailsById
)
export default router