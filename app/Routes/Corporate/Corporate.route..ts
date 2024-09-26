import express from "express";
const router = express.Router();
import { celebrate } from "celebrate";

import CorporateSchema from "../../Constants/Schema/Corporate.schema";

import corporateController from "../../Controllers/Corporate.controller";

router.post(
  "/",
  celebrate(CorporateSchema.addCorporate),
  corporateController.addCorporate
);

router.post(
  "/all",
  celebrate(CorporateSchema.getCorporates),
  corporateController.getCorporates
);

router.get(
  "/",
  celebrate(CorporateSchema.fetchCorporatesById),
  corporateController.fetchCorporatesById
);

router.put(
  "/",
  celebrate(CorporateSchema.updateCorporate),
  corporateController.updateCorporate
);

router.put(
  "/delete",
  celebrate(CorporateSchema.deleteCorporates),
  corporateController.deleteCorporatesById
);

router.put(
  "/deleteAll",
  celebrate(CorporateSchema.deleteCorporatesByMultiId),
  corporateController.deleteCorporatesByMultiId
);

export default router;
