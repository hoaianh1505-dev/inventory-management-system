import { Request, Response } from "express";
import { createUnitSchema, updateUnitSchema } from "../validations/unit.validation";
import {
  getUnitsService,
  createUnitService,
  updateUnitService,
  deleteUnitService,
} from "../services/unit.service";
import { asyncHandler } from "../utils/asyncHandler.util";

export const getUnits = asyncHandler(async (req: Request, res: Response) => {
  const units = await getUnitsService();
  return res.status(200).json({
    success: true,
    data: units,
  });
});

export const createUnit = asyncHandler(async (req: Request, res: Response) => {
  const validatedInput = createUnitSchema.parse(req.body);
  const unit = await createUnitService(validatedInput);
  return res.status(201).json({
    success: true,
    data: unit,
  });
});

export const updateUnit = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const validatedInput = updateUnitSchema.parse(req.body);
  const unit = await updateUnitService(id, validatedInput);
  return res.status(200).json({
    success: true,
    data: unit,
  });
});

export const deleteUnit = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await deleteUnitService(id);
  return res.status(200).json({
    success: true,
    data: result,
  });
});
