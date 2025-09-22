"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startReminderScheduler = void 0;
const node_cron_1 = __importDefault(require("node-cron"));
const OrderReminder_service_1 = require("../services/OrderReminder.service");
const startReminderScheduler = () => {
    node_cron_1.default.schedule("0 8 * * *", () => __awaiter(void 0, void 0, void 0, function* () {
        console.log("Running H-1 check-in reminders...");
        try {
            yield (0, OrderReminder_service_1.sendDailyReminders)();
        }
        catch (error) {
            console.error("Error sending daily reminders:", error);
        }
    }));
};
exports.startReminderScheduler = startReminderScheduler;
