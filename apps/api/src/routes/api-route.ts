import { trackVessels, updatedVesselInformation } from "../controller/api-controller";

const express = require('express');

const router = express.Router();

router.post('/track', trackVessels)
router.post('/updated-vessel-information', updatedVesselInformation)

export { router as apiRoute }