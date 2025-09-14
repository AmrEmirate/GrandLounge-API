// src/services/Report.service.ts
import ReportRepositori from "../repositories/Report.repositori";

const reportRepo = new ReportRepositori();

export const getSalesByTenant = async (tenantId: string, query: any) => {
    const endDate = query.to ? new Date(query.to) : new Date();
    const startDate = query.from ? new Date(query.from) : new Date(new Date().setDate(endDate.getDate() - 6));
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
        case "day":
            salesReport = await reportRepo.getSalesByDay(tenantId, startDate, endDate,);
            break;
        default:
            salesReport = await reportRepo.getAggregateSales(tenantId, startDate, endDate);
            break;
    }

    return salesReport;
};
