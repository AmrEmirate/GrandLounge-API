import { User as PrismaUser, Tenant as PrismaTenant } from '../generated/prisma';


declare global {
  namespace Express {
    export interface User {
      id: string; 
      role: string; 
    }

    export interface Request {
      user?: User; 
    }
  }
}