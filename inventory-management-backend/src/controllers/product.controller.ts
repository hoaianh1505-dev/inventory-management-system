import { Request, Response, NextFunction } from "express";
import {
  createProductSchema,
  updateProductSchema,
  queryProductSchema,
} from "../validations/product.validation";
import {
  getProductsService,
  getProductByIdService,
  createProductService,
  updateProductService,
  deleteProductService,
  uploadProductImagesService,
  deleteProductImageService,
  setPrimaryProductImageService,
  getProductBarcodeService,
  getProductBySkuService,
} from "../services/product.service";

export const getProducts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const query = queryProductSchema.parse(req.query);
    const result = await getProductsService(query);
    return res.status(200).json({
      success: true,
      data: result.data,
      meta: result.meta,
    });
  } catch (error) {
    next(error);
  }
};

export const getProductById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const product = await getProductByIdService(id);
    return res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

export const createProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedInput = createProductSchema.parse(req.body);
    const product = await createProductService(validatedInput);
    return res.status(201).json({
      success: true,
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

export const updateProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const validatedInput = updateProductSchema.parse(req.body);
    const product = await updateProductService(id, validatedInput);
    return res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const result = await deleteProductService(id);
    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const uploadImages = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const files = req.files as Express.Multer.File[];
    const images = await uploadProductImagesService(id, files);
    return res.status(201).json({
      success: true,
      data: images,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteImage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id, imageId } = req.params;
    const result = await deleteProductImageService(id, imageId);
    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const setPrimaryImage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id, imageId } = req.params;
    const result = await setPrimaryProductImageService(id, imageId);
    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getProductBarcode = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const result = await getProductBarcodeService(id);
    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getProductBySku = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { sku } = req.params;
    const product = await getProductBySkuService(sku);
    return res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    next(error);
  }
};
