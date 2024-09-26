import express from "express";
import AuthController from "../../Controllers/Auth.controller";
const router = express.Router();

router.post('/auth',AuthController.clientAuthController);

export default router;
