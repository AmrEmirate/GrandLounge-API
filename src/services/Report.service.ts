// src/services/Report.service.ts
import ReportRepositori from "../repositories/Report.repositori";

const reportRepo = new ReportRepositori();

export const getSalesByTenant = async (tenantId: number, query: any) => {
    const startDate = query.startDate ? new Date(query.startDate) : undefined;
    const endDate = query.endDate ? new Date(query.endDate) : undefined;
    const groupBy = query.groupBy;
    const sortBy = query.sortBy || "total"; 

    let salesReport;

    switch (groupBy) {
        case "property":
            salesReport = await reportRepo.getSalesByProperty(tenantId, startDate, endDate, sortBy);
            break;
        case "user":
            salesReport = await reportRepo.getSalesByUser(tenantId, startDate, endDate, sortBy);
            break;
        case "transaction":
            salesReport = await reportRepo.getAggregateSales(tenantId, startDate, endDate);
            break;
    }

    return salesReport;
};
