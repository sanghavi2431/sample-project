import express from 'express';
import HealthCheckController from '../../Controllers/HealthCheck.controller';

const router = express.Router();
router.get("/", HealthCheckController.healthCheck);

export default router;
