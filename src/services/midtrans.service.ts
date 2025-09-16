import midtransClient from "midtrans-client";
import { Booking, User } from "../generated/prisma";

const midtransServerKey = process.env.MIDTRANS_SERVER_KEY;
const midtransClientKey = process.env.MIDTRANS_CLIENT_KEY;

if (!midtransServerKey || !midtransClientKey) {
  throw new Error("MIDTRANS_SERVER_KEY or MIDTRANS_CLIENT_KEY is not defined in .env file");
}

const snap = new midtransClient.Snap({
    isProduction: false,
    serverKey: midtransServerKey,
    clientKey: midtransClientKey,
});

interface BookingWithUser extends Booking {
    user: User;
}

export const createMidtransTransaction = async (booking: BookingWithUser) => {
    const parameter = {
        transaction_details: {
            order_id: booking.invoiceNumber,
            gross_amount: booking.totalPrice,
        },
        credit_card: {
            secure: true,
        },
        customer_details: {
            first_name: booking.user.fullName,
             email: booking.user.email,
        },
    };


    try {
        console.log("Mengirim parameter ke Midtrans:", JSON.stringify(parameter, null, 2));
        const transaction = await snap.createTransaction(parameter);

        return transaction;
    } catch (error) {
        console.error("Error dari Midtrans:", error);
        throw new Error('Gagal membuat transaksi Midtrans.');
    }
}