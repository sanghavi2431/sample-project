import { celebrate } from "celebrate"
import express from "express"
import FranchiseSchema from "../../Constants/Schema/Franchise.schema"
const router = express.Router()
import FranchiseController from "../../Controllers/Franchise.controller"

router.post(
    "/all",
    celebrate(FranchiseSchema.fetchAllFranchies),
    FranchiseController.getAllFranchise
)

export default router