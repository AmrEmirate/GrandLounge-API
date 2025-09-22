"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const roomAvailability_controller_1 = require("../controllers/roomAvailability.controller");
const router = (0, express_1.Router)({ mergeParams: true });
router.post('/', roomAvailability_controller_1.RoomAvailabilityController.update);
exports.default = router;
