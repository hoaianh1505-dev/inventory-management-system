import { AppDataSource } from "../config/database";
import { Unit } from "../entities/Unit";
import { CreateUnitInput, UpdateUnitInput } from "../validations/unit.validation";
import { AppError } from "../utils/appError.util";

const unitRepository = AppDataSource.getRepository(Unit);

export const getUnitsService = async () => {
  return unitRepository.find({ order: { name: "ASC" } });
};

export const createUnitService = async (input: CreateUnitInput) => {
  const existing = await unitRepository.findOne({ where: { name: input.name } });
  if (existing) {
    throw new AppError("Tên đơn vị tính đã tồn tại", 409, "DUPLICATE_UNIT");
  }

  const unit = unitRepository.create({
    name: input.name,
    symbol: input.symbol,
  });

  await unitRepository.save(unit);
  return unit;
};

export const updateUnitService = async (id: string, input: UpdateUnitInput) => {
  const unit = await unitRepository.findOne({ where: { id } });
  if (!unit) {
    throw new AppError("Không tìm thấy đơn vị tính", 404, "NOT_FOUND");
  }

  if (input.name !== undefined) unit.name = input.name;
  if (input.symbol !== undefined) unit.symbol = input.symbol;

  await unitRepository.save(unit);
  return unit;
};

export const deleteUnitService = async (id: string) => {
  const unit = await unitRepository.findOne({ where: { id } });
  if (!unit) {
    throw new AppError("Không tìm thấy đơn vị tính", 404, "NOT_FOUND");
  }

  await unitRepository.delete(id);
  return { message: "Xóa đơn vị tính thành công" };
};
