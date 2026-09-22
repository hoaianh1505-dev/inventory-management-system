import { AppDataSource } from "../config/database";
import { AuditLog } from "../entities/AuditLog";
import { QueryAuditLogInput } from "../validations/audit-log.validation";

const auditLogRepository = AppDataSource.getRepository(AuditLog);

interface CreateAuditLogParams {
  user_id?: string | null;
  action: string;
  entity_name: string;
  entity_id?: string | null;
  details?: any;
  ip_address?: string | null;
}

// Helper ghi nhật ký thao tác ngầm
export const createAuditLogHelper = async (params: CreateAuditLogParams): Promise<void> => {
  try {
    const log = auditLogRepository.create({
      user_id: params.user_id || null,
      action: params.action,
      entity_name: params.entity_name,
      entity_id: params.entity_id || null,
      details: params.details || null,
      ip_address: params.ip_address || null,
    });
    await auditLogRepository.save(log);
  } catch (error) {
    console.error("[AUDIT_LOG_ERROR] Không thể ghi nhật ký thao tác:", error);
  }
};

export const getAuditLogsService = async (query: QueryAuditLogInput) => {
  const { page, limit, user_id, action, entity_name, start_date, end_date } = query;
  const skip = (page - 1) * limit;

  const queryBuilder = auditLogRepository
    .createQueryBuilder("log")
    .leftJoinAndSelect("log.user", "user")
    .select([
      "log.id",
      "log.action",
      "log.entity_name",
      "log.entity_id",
      "log.details",
      "log.ip_address",
      "log.created_at",
      "user.id",
      "user.username",
      "user.email",
      "user.role",
    ]);

  if (user_id) {
    queryBuilder.andWhere("log.user_id = :user_id", { user_id });
  }

  if (action) {
    queryBuilder.andWhere("log.action ILIKE :action", { action: `%${action}%` });
  }

  if (entity_name) {
    queryBuilder.andWhere("log.entity_name ILIKE :entity_name", { entity_name: `%${entity_name}%` });
  }

  if (start_date) {
    queryBuilder.andWhere("log.created_at >= :start_date", { start_date: new Date(start_date) });
  }

  if (end_date) {
    const endDateObj = new Date(end_date);
    endDateObj.setHours(23, 59, 59, 999);
    queryBuilder.andWhere("log.created_at <= :end_date", { end_date: endDateObj });
  }

  const [logs, total] = await queryBuilder
    .orderBy("log.created_at", "DESC")
    .skip(skip)
    .take(limit)
    .getManyAndCount();

  return {
    data: logs,
    meta: {
      page,
      limit,
      total,
      total_pages: Math.ceil(total / limit),
    },
  };
};
