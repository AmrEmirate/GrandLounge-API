import { prisma } from "../config/prisma";
import { PrismaClient, BookingStatus } from "../generated/prisma";

type PrismaTransactionClient = Omit<PrismaClient, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'>;

export default class ConfirmPaymentRepository {
    private prismaClient: PrismaTransactionClient;

    constructor(prismaClient: PrismaTransactionClient = prisma) {
        this.prismaClient = prismaClient;
    }

    async findBookingByInvoice(invoiceNumber: string) {
        return this.prismaClient.booking.findFirst({
            where: { invoiceNumber },
            include: { property: true },
        });
    }

    async updateBookingStatus(bookingId: string, status: BookingStatus) {
        return this.prismaClient.booking.update({
            where: { id: bookingId },
            data: { status },
            include: { property: true, user: true },
        });
    }

    async clearPaymentProof(bookingId: string) {
        return this.prismaClient.booking.update({
            where: { id: bookingId },
            data: { paymentProof: null },
        });
    }
}
