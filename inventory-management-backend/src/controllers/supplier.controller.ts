import { Request, Response, NextFunction } from "express";
import {
  createSupplierSchema,
  updateSupplierSchema,
  querySupplierSchema,
} from "../validations/supplier.validation";
import {
  getSuppliersService,
  getSupplierByIdService,
  createSupplierService,
  updateSupplierService,
  deleteSupplierService,
} from "../services/supplier.service";

export const getSuppliers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedQuery = querySupplierSchema.parse(req.query);
    const result = await getSuppliersService(validatedQuery);
    return res.status(200).json({
      success: true,
      data: result.data,
      meta: result.meta,
    });
  } catch (error) {
    next(error);
  }
};

export const getSupplierById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const supplier = await getSupplierByIdService(id);
    return res.status(200).json({
      success: true,
      data: supplier,
    });
  } catch (error) {
    next(error);
  }
};

export const createSupplier = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedInput = createSupplierSchema.parse(req.body);
    const supplier = await createSupplierService(validatedInput);
    return res.status(201).json({
      success: true,
      data: supplier,
    });
  } catch (error) {
    next(error);
  }
};

export const updateSupplier = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const validatedInput = updateSupplierSchema.parse(req.body);
    const supplier = await updateSupplierService(id, validatedInput);
    return res.status(200).json({
      success: true,
      data: supplier,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteSupplier = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const result = await deleteSupplierService(id);
    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
