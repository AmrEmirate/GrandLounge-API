import ReportRepositori from "../repositories/Report.repositori";
import ApiError from "../utils/apiError";

const reportRepo = new ReportRepositori();

export const getSalesByTenant = async (
    tenantId: number,
    query: any
) => {
    const startDate = query.startDate ? new Date(query.startDate) : undefined;
    const endDate = query.endDate ? new Date(query.endDate) : undefined;
    
    const groupBy = query.groupBy;

    let salesReport;

    switch (groupBy) {
        case 'property':
            salesReport = await reportRepo.getSalesByProperty(tenantId, startDate, endDate);
            break;
        case 'user':
            salesReport = await reportRepo.getSalesByUser(tenantId, startDate, endDate);
            break;
        case 'transaction':
            salesReport = await reportRepo.getAggregateSales(tenantId, startDate, endDate);
            break;
    }

    return salesReport
}