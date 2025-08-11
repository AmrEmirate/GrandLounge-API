export interface Review {
    id: number;
    transactionId: string;
    propertyId: number;
    accountId: string;
    comment: string;
    tenantReply?: string;
    createdAt: Date;
    updatedAt: Date;
    rating?: number;
}
