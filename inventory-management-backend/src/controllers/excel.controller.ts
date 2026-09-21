import { Request, Response, NextFunction } from "express";
import {
  exportProductsExcelService,
  exportInventoryExcelService,
  exportStockTransactionsExcelService,
  generateProductTemplateExcelService,
  importProductsExcelService,
} from "../services/excel.service";
import { AppError } from "../utils/appError.util";

const EXCEL_MIME_TYPE = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

export const exportProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const buffer = await exportProductsExcelService();

    res.setHeader("Content-Type", EXCEL_MIME_TYPE);
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=danh_sach_san_pham_${Date.now()}.xlsx`
    );

    return res.status(200).send(buffer);
  } catch (error) {
    next(error);
  }
};

export const exportInventory = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const buffer = await exportInventoryExcelService();

    res.setHeader("Content-Type", EXCEL_MIME_TYPE);
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=bao_cao_ton_kho_${Date.now()}.xlsx`
    );

    return res.status(200).send(buffer);
  } catch (error) {
    next(error);
  }
};

export const exportStockTransactions = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const buffer = await exportStockTransactionsExcelService();

    res.setHeader("Content-Type", EXCEL_MIME_TYPE);
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=lich_su_giao_dich_${Date.now()}.xlsx`
    );

    return res.status(200).send(buffer);
  } catch (error) {
    next(error);
  }
};

export const downloadProductTemplate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const buffer = await generateProductTemplateExcelService();

    res.setHeader("Content-Type", EXCEL_MIME_TYPE);
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=mau_nhap_danh_sach_san_pham.xlsx"
    );

    return res.status(200).send(buffer);
  } catch (error) {
    next(error);
  }
};

export const importProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.file) {
      throw new AppError("Vui lòng chọn 1 file Excel để upload", 400, "BAD_REQUEST");
    }

    const result = await importProductsExcelService(req.file.buffer);

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
