import { Request, Response, NextFunction } from "express";
import { queryAuditLogSchema } from "../validations/audit-log.validation";
import { getAuditLogsService } from "../services/audit-log.service";

export const getAuditLogs = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const validatedQuery = queryAuditLogSchema.parse(req.query);
    const result = await getAuditLogsService(validatedQuery);
    return res.status(200).json({
      success: true,
      data: result.data,
      meta: result.meta,
    });
  } catch (error) {
    next(error);
  }
};
