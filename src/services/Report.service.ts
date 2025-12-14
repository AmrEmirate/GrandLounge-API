import { prisma } from "../config/prisma";
import ReportRepositori from "../repositories/report.repository";
import { startOfDay, endOfDay } from "date-fns";

class ReportService {
  private reportRepo: ReportRepositori;

  constructor() {
    this.reportRepo = new ReportRepositori();
  }

  public async getDashboardWidgets(tenantId: string) {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 6);

    const dailySales = await this.reportRepo.getSalesByDay(
      tenantId,
      startDate,
      endDate
    );

    const recentReviews = await prisma.review.findMany({
      where: {
        property: {
          tenantId: tenantId,
        },
      },
      take: 3,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        user: {
          select: {
            fullName: true,
            profilePicture: true,
          },
        },
      },
    });

    return {
      dailySales,
      recentReviews,
    };
  }

  public async getSalesByTenant(tenantId: string, query: any) {
    const groupBy = query.groupBy;
    const sortBy = query.sortBy || "total";

    let startDate;
    let endDate;

    if (query.startDate && query.endDate) {
      startDate = startOfDay(new Date(query.startDate));
      endDate = endOfDay(new Date(query.endDate));
    } else {
      endDate = endOfDay(new Date());
      startDate = startOfDay(
        new Date(new Date().setDate(endDate.getDate() - 6))
      );
    }

    let salesReport;
    switch (groupBy) {
      case "property":
        salesReport = await this.reportRepo.getSalesByProperty(
          tenantId,
          startDate,
          endDate,
          sortBy
        );
        break;
      case "user":
        salesReport = await this.reportRepo.getSalesByUser(
          tenantId,
          startDate,
          endDate,
          sortBy
        );
        break;
      case "day":
        salesReport = await this.reportRepo.getSalesByDay(
          tenantId,
          startDate,
          endDate
        );
        break;
      default:
        salesReport = await this.reportRepo.getAggregateSales(
          tenantId,
          startDate,
          endDate
        );
        break;
    }

    return salesReport;
  }
}

export default new ReportService();
