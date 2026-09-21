import ExcelJS from "exceljs";
import { AppDataSource } from "../config/database";
import { Product } from "../entities/Product";
import { Inventory } from "../entities/Inventory";
import { StockTransaction } from "../entities/StockTransaction";
import { Category } from "../entities/Category";
import { Unit } from "../entities/Unit";
import { Supplier } from "../entities/Supplier";
import { AppError } from "../utils/appError.util";

const productRepository = AppDataSource.getRepository(Product);
const inventoryRepository = AppDataSource.getRepository(Inventory);
const stockTransactionRepository = AppDataSource.getRepository(StockTransaction);
const categoryRepository = AppDataSource.getRepository(Category);
const unitRepository = AppDataSource.getRepository(Unit);
const supplierRepository = AppDataSource.getRepository(Supplier);

// Hàm hỗ trợ định dạng Tiêu đề bảng Excel
const formatHeaderRow = (row: ExcelJS.Row) => {
  row.font = { name: "Arial", size: 11, bold: true, color: { argb: "FFFFFF" } };
  row.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "1F4E78" }, // Màu xanh thẫm chuyên nghiệp
  };
  row.alignment = { vertical: "middle", horizontal: "center" };
  row.height = 28;
};

// Hàm tự động căn chỉnh độ rộng cột Excel dựa trên nội dung
const autoFitColumns = (worksheet: ExcelJS.Worksheet) => {
  worksheet.columns.forEach((column) => {
    let maxLength = 12;
    if (column.values) {
      column.values.forEach((val) => {
        if (val) {
          const strVal = val.toString();
          if (strVal.length > maxLength) {
            maxLength = strVal.length;
          }
        }
      });
    }
    column.width = Math.min(maxLength + 4, 40);
  });
};

export const exportProductsExcelService = async (): Promise<Buffer> => {
  const products = await productRepository.find({
    relations: ["category", "unit", "supplier"],
    order: { created_at: "DESC" },
  });

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Danh Sách Sản Phẩm");

  worksheet.columns = [
    { header: "Mã SKU", key: "sku" },
    { header: "Tên Sản Phẩm", key: "name" },
    { header: "Danh Mục", key: "category" },
    { header: "Đơn Vị Tính", key: "unit" },
    { header: "Nhà Cung Cấp", key: "supplier" },
    { header: "Giá Nhập (VND)", key: "cost_price" },
    { header: "Giá Bán (VND)", key: "selling_price" },
    { header: "Ngưỡng Tồn Tối Thiểu", key: "low_stock_threshold" },
  ];

  formatHeaderRow(worksheet.getRow(1));

  products.forEach((product) => {
    worksheet.addRow({
      sku: product.sku,
      name: product.name,
      category: product.category?.name || "N/A",
      unit: product.unit?.name || "N/A",
      supplier: product.supplier?.name || "N/A",
      cost_price: Number(product.cost_price),
      selling_price: Number(product.selling_price),
      low_stock_threshold: product.low_stock_threshold,
    });
  });

  autoFitColumns(worksheet);

  const buffer = await workbook.xlsx.writeBuffer();
  return buffer as unknown as Buffer;
};

export const exportInventoryExcelService = async (): Promise<Buffer> => {
  const inventories = await inventoryRepository.find({
    relations: ["warehouse", "location", "product", "product.category", "product.unit"],
    order: { updated_at: "DESC" },
  });

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Báo Cáo Tồn Kho");

  worksheet.columns = [
    { header: "Nhà Kho", key: "warehouse" },
    { header: "Vị Trí Kho", key: "location" },
    { header: "Mã SKU", key: "sku" },
    { header: "Tên Sản Phẩm", key: "product_name" },
    { header: "Số Lượng Tồn", key: "quantity" },
    { header: "Đơn Vị Tính", key: "unit" },
    { header: "Giá Trị Tồn (VND)", key: "inventory_value" },
  ];

  formatHeaderRow(worksheet.getRow(1));

  inventories.forEach((item) => {
    const costPrice = Number(item.product?.cost_price || 0);
    worksheet.addRow({
      warehouse: item.warehouse?.name || "N/A",
      location: item.location?.name || "Khu vực chung",
      sku: item.product?.sku || "N/A",
      product_name: item.product?.name || "N/A",
      quantity: item.quantity,
      unit: item.product?.unit?.name || "N/A",
      inventory_value: item.quantity * costPrice,
    });
  });

  autoFitColumns(worksheet);

  const buffer = await workbook.xlsx.writeBuffer();
  return buffer as unknown as Buffer;
};

export const exportStockTransactionsExcelService = async (): Promise<Buffer> => {
  const transactions = await stockTransactionRepository.find({
    relations: ["warehouse", "target_warehouse", "supplier", "created_by", "items"],
    order: { created_at: "DESC" },
  });

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Lịch Sử Giao Dịch Kho");

  worksheet.columns = [
    { header: "Mã Chứng Từ", key: "reference_no" },
    { header: "Loại Giao Dịch", key: "type" },
    { header: "Kho Hàng", key: "warehouse" },
    { header: "Kho Đích / Đơn Vị", key: "target" },
    { header: "Người Thực Hiện", key: "created_by" },
    { header: "Số Mặt Hàng", key: "items_count" },
    { header: "Ngày Tạo", key: "created_at" },
  ];

  formatHeaderRow(worksheet.getRow(1));

  transactions.forEach((tx) => {
    let targetInfo = "N/A";
    if (tx.type === "transfer") {
      targetInfo = tx.target_warehouse?.name || "N/A";
    } else if (tx.type === "import") {
      targetInfo = tx.supplier?.name || "Nhà cung cấp khác";
    }

    worksheet.addRow({
      reference_no: tx.reference_no,
      type: tx.type.toUpperCase(),
      warehouse: tx.warehouse?.name || "N/A",
      target: targetInfo,
      created_by: tx.created_by?.username || "System",
      items_count: tx.items?.length || 0,
      created_at: new Date(tx.created_at).toLocaleString("vi-VN"),
    });
  });

  autoFitColumns(worksheet);

  const buffer = await workbook.xlsx.writeBuffer();
  return buffer as unknown as Buffer;
};

export const generateProductTemplateExcelService = async (): Promise<Buffer> => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Mau_Nhap_San_Pham");

  worksheet.columns = [
    { header: "Mã SKU (*)", key: "sku" },
    { header: "Tên sản phẩm (*)", key: "name" },
    { header: "Tên Danh mục", key: "category" },
    { header: "Tên Đơn vị tính", key: "unit" },
    { header: "Tên Nhà cung cấp", key: "supplier" },
    { header: "Giá nhập", key: "cost_price" },
    { header: "Giá bán", key: "selling_price" },
    { header: "Ngưỡng tồn tối thiểu", key: "low_stock_threshold" },
  ];

  formatHeaderRow(worksheet.getRow(1));

  // Mẫu ví dụ để người dùng tham khảo
  worksheet.addRow({
    sku: "SP-DEMO-01",
    name: "Sản phẩm mẫu 1",
    category: "Điện tử",
    unit: "Cái",
    supplier: "Công ty ABC",
    cost_price: 150000,
    selling_price: 250000,
    low_stock_threshold: 10,
  });

  worksheet.addRow({
    sku: "SP-DEMO-02",
    name: "Sản phẩm mẫu 2",
    category: "Gia dụng",
    unit: "Hộp",
    supplier: "Công ty XYZ",
    cost_price: 50000,
    selling_price: 80000,
    low_stock_threshold: 5,
  });

  autoFitColumns(worksheet);

  const buffer = await workbook.xlsx.writeBuffer();
  return buffer as unknown as Buffer;
};

export const importProductsExcelService = async (fileBuffer: Buffer) => {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(fileBuffer as any);

  const worksheet = workbook.getWorksheet(1);
  if (!worksheet) {
    throw new AppError("File Excel không hợp lệ hoặc không có sheet dữ liệu", 400, "BAD_REQUEST");
  }

  const failedRows: { row_number: number; sku?: string; reason: string }[] = [];
  const validProductsToSave: Partial<Product>[] = [];

  // Đọc danh sách Category, Unit, Supplier có sẵn để map ID nhanh
  const [categories, units, suppliers] = await Promise.all([
    categoryRepository.find(),
    unitRepository.find(),
    supplierRepository.find(),
  ]);

  const categoryMap = new Map(categories.map((c) => [c.name.toLowerCase(), c.id]));
  const unitMap = new Map(units.map((u) => [u.name.toLowerCase(), u.id]));
  const supplierMap = new Map(suppliers.map((s) => [s.name.toLowerCase(), s.id]));

  // Lấy danh sách tất cả SKU hiện tại để kiểm tra trùng lặp
  const existingProducts = await productRepository.find({ select: ["sku"] });
  const existingSkuSet = new Set(existingProducts.map((p) => p.sku.toLowerCase()));
  const newSkuInFileSet = new Set<string>();

  // Duyệt từng dòng (Bỏ qua dòng 1 là tiêu đề)
  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;

    const sku = row.getCell(1).value?.toString().trim();
    const name = row.getCell(2).value?.toString().trim();
    const categoryName = row.getCell(3).value?.toString().trim();
    const unitName = row.getCell(4).value?.toString().trim();
    const supplierName = row.getCell(5).value?.toString().trim();
    const costPrice = parseFloat(row.getCell(6).value?.toString() || "0");
    const sellingPrice = parseFloat(row.getCell(7).value?.toString() || "0");
    const lowStockThreshold = parseInt(row.getCell(8).value?.toString() || "10", 10);

    // Validate dữ liệu bắt buộc
    if (!sku) {
      failedRows.push({ row_number: rowNumber, reason: "Thiếu mã SKU" });
      return;
    }

    if (!name) {
      failedRows.push({ row_number: rowNumber, sku, reason: "Thiếu tên sản phẩm" });
      return;
    }

    const skuLower = sku.toLowerCase();
    if (existingSkuSet.has(skuLower) || newSkuInFileSet.has(skuLower)) {
      failedRows.push({ row_number: rowNumber, sku, reason: "Mã SKU đã tồn tại trong CSDL hoặc trong file" });
      return;
    }

    newSkuInFileSet.add(skuLower);

    const categoryId = categoryName ? categoryMap.get(categoryName.toLowerCase()) || null : null;
    const unitId = unitName ? unitMap.get(unitName.toLowerCase()) || null : null;
    const supplierId = supplierName ? supplierMap.get(supplierName.toLowerCase()) || null : null;

    validProductsToSave.push({
      sku,
      name,
      category_id: categoryId,
      unit_id: unitId,
      supplier_id: supplierId,
      cost_price: isNaN(costPrice) ? 0 : costPrice,
      selling_price: isNaN(sellingPrice) ? 0 : sellingPrice,
      low_stock_threshold: isNaN(lowStockThreshold) ? 10 : lowStockThreshold,
    });
  });

  // Lưu hàng loạt các sản phẩm hợp lệ vào CSDL
  if (validProductsToSave.length > 0) {
    const entities = productRepository.create(validProductsToSave);
    await productRepository.save(entities);
  }

  const totalRowsProcessed = worksheet.rowCount - 1;

  return {
    total_rows: Math.max(0, totalRowsProcessed),
    imported_count: validProductsToSave.length,
    failed_count: failedRows.length,
    failed_rows: failedRows,
  };
};
