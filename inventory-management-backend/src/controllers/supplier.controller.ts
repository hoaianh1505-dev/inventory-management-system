import { Request, Response } from "express";
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
import { asyncHandler } from "../utils/asyncHandler.util";

export const getSuppliers = asyncHandler(async (req: Request, res: Response) => {
  const validatedQuery = querySupplierSchema.parse(req.query);
  const result = await getSuppliersService(validatedQuery);
  return res.status(200).json({
    success: true,
    data: result.data,
    meta: result.meta,
  });
});

export const getSupplierById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const supplier = await getSupplierByIdService(id);
  return res.status(200).json({
    success: true,
    data: supplier,
  });
});

export const createSupplier = asyncHandler(async (req: Request, res: Response) => {
  const validatedInput = createSupplierSchema.parse(req.body);
  const supplier = await createSupplierService(validatedInput);
  return res.status(201).json({
    success: true,
    data: supplier,
  });
});

export const updateSupplier = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const validatedInput = updateSupplierSchema.parse(req.body);
  const supplier = await updateSupplierService(id, validatedInput);
  return res.status(200).json({
    success: true,
    data: supplier,
  });
});

export const deleteSupplier = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await deleteSupplierService(id);
  return res.status(200).json({
    success: true,
    data: result,
  });
});
