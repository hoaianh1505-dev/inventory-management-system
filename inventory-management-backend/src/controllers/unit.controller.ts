import { Request, Response, NextFunction } from "express";
import { createUnitSchema, updateUnitSchema } from "../validations/unit.validation";
import {
  getUnitsService,
  createUnitService,
  updateUnitService,
  deleteUnitService,
} from "../services/unit.service";

export const getUnits = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const units = await getUnitsService();
    return res.status(200).json({
      success: true,
      data: units,
    });
  } catch (error) {
    next(error);
  }
};

export const createUnit = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedInput = createUnitSchema.parse(req.body);
    const unit = await createUnitService(validatedInput);
    return res.status(201).json({
      success: true,
      data: unit,
    });
  } catch (error) {
    next(error);
  }
};

export const updateUnit = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const validatedInput = updateUnitSchema.parse(req.body);
    const unit = await updateUnitService(id, validatedInput);
    return res.status(200).json({
      success: true,
      data: unit,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteUnit = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const result = await deleteUnitService(id);
    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
