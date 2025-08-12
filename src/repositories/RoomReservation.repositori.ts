import { prisma } from "../config/prisma";
import bcrypt from "bcrypt"
import { Prisma } from "../generated/prisma/client";
import crypto from "crypto";

export default class roomReservationRepositori {
    async checkRoomAvailability(roomId: number, newStartDate: Date, newEndDate: Date) {
        const existingTransactions = await prisma.transaction.findMany({
            where: {
                roomId,
                status: { in: ["DIKONFIRMASI", "MENUNGGU_KONFIRMASI"] },
                AND: [
                    { endDate: { lte: newStartDate } },
                    { startDate: { gte: newStartDate } }
                ]
            }
        });
        return existingTransactions.length === 0;
    }

    async createTransaction(data: Prisma.TransactionCreateInput) {
        return prisma.transaction.create({ data });
    }

    async findRoomById(id: number) {
        return prisma.room.findUnique({ where: { id } });
    }

    async findOrCreateAccount(userData: { email: string; name: string; password?: string }) {
        const hashedPassword = await bcrypt.hash(userData.password || crypto.randomBytes(8).toString("hex"), 10);
        return prisma.account.upsert({
            where: { email: userData.email },
            update: { name: userData.name },
            create: {
                email: userData.email,
                name: userData.name,
                password: hashedPassword
            }
        });
    }

    async findTransactionByAccountId(accountId: string) {
        return prisma.transaction.findMany({
            where: { accountId },
            include: {
                room: true,
            }
        })
    }

    async findTransactionById(transactionId: string) {
        return prisma.transaction.findUnique({
            where: { id: transactionId },
            include: {
                room: {
                    include: {
                        property: true,
                    }
                },
                account: true
            }
        })
    }

    async updateTransaction(transactionId: string, data: Prisma.TransactionUpdateInput) {
        return prisma.transaction.update({
            where: { id: transactionId },
            data,
        });
    }

    
}

