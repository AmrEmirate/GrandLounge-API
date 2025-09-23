import { Request, Response, NextFunction } from "express";
import { getAggregatedPropertyReport, getCalenderReport } from "../services/CalenderReport.service";

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