import { Request, Response, NextFunction } from "express";
import {
  createWarehouseSchema,
  updateWarehouseSchema,
  queryWarehouseSchema,
  createWarehouseLocationSchema,
  updateWarehouseLocationSchema,
  queryWarehouseLocationSchema,
} from "../validations/warehouse.validation";
import {
  getWarehousesService,
  getWarehouseByIdService,
  createWarehouseService,
  updateWarehouseService,
  deleteWarehouseService,
  getWarehouseLocationsService,
  getWarehouseLocationByIdService,
  createWarehouseLocationService,
  updateWarehouseLocationService,
  deleteWarehouseLocationService,
} from "../services/warehouse.service";

// Warehouse Controllers
export const getWarehouses = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const query = queryWarehouseSchema.parse(req.query);
    const result = await getWarehousesService(query);
    return res.status(200).json({
      success: true,
      data: result.data,
      meta: result.meta,
    });
  } catch (error) {
    next(error);
  }
};

export const getWarehouseById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const warehouse = await getWarehouseByIdService(id);
    return res.status(200).json({
      success: true,
      data: warehouse,
    });
  } catch (error) {
    next(error);
  }
};

export const createWarehouse = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedInput = createWarehouseSchema.parse(req.body);
    const warehouse = await createWarehouseService(validatedInput);
    return res.status(201).json({
      success: true,
      data: warehouse,
    });
  } catch (error) {
    next(error);
  }
};

export const updateWarehouse = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const validatedInput = updateWarehouseSchema.parse(req.body);
    const warehouse = await updateWarehouseService(id, validatedInput);
    return res.status(200).json({
      success: true,
      data: warehouse,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteWarehouse = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const result = await deleteWarehouseService(id);
    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// Warehouse Location Controllers
export const getWarehouseLocations = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const query = queryWarehouseLocationSchema.parse(req.query);
    const result = await getWarehouseLocationsService(query);
    return res.status(200).json({
      success: true,
      data: result.data,
      meta: result.meta,
    });
  } catch (error) {
    next(error);
  }
};

export const getWarehouseLocationById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const location = await getWarehouseLocationByIdService(id);
    return res.status(200).json({
      success: true,
      data: location,
    });
  } catch (error) {
    next(error);
  }
};

export const createWarehouseLocation = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedInput = createWarehouseLocationSchema.parse(req.body);
    const location = await createWarehouseLocationService(validatedInput);
    return res.status(201).json({
      success: true,
      data: location,
    });
  } catch (error) {
    next(error);
  }
};

export const updateWarehouseLocation = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const validatedInput = updateWarehouseLocationSchema.parse(req.body);
    const location = await updateWarehouseLocationService(id, validatedInput);
    return res.status(200).json({
      success: true,
      data: location,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteWarehouseLocation = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const result = await deleteWarehouseLocationService(id);
    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
