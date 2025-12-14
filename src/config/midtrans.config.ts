import midtransClient from "midtrans-client";
import dotenv from "dotenv";

dotenv.config();

export const snap = new midtransClient.Snap({
  isProduction: process.env.MIDTRANS_IS_PRODUCTION === "true",
  serverKey: process.env.MIDTRANS_SERVER_KEY || "SB-Mid-server-TEST",
  clientKey: process.env.MIDTRANS_CLIENT_KEY || "SB-Mid-client-TEST",
});

export const coreApi = new midtransClient.CoreApi({
  isProduction: process.env.MIDTRANS_IS_PRODUCTION === "true",
  serverKey: process.env.MIDTRANS_SERVER_KEY || "SB-Mid-server-TEST",
  clientKey: process.env.MIDTRANS_CLIENT_KEY || "SB-Mid-client-TEST",
});
