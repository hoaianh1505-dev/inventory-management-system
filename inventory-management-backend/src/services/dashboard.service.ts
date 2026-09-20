import { AppDataSource } from "../config/database";
import { Product } from "../entities/Product";
import { Inventory } from "../entities/Inventory";
import { Warehouse } from "../entities/Warehouse";
import { StockTransaction } from "../entities/StockTransaction";
import { StockTransactionItem } from "../entities/StockTransactionItem";
import { TransactionType } from "../constants";
import {
  QueryStockMovementInput,
  QueryTopProductsInput,
  QueryRecentTransactionsInput,
} from "../validations/dashboard.validation";

const productRepository = AppDataSource.getRepository(Product);
const inventoryRepository = AppDataSource.getRepository(Inventory);
const warehouseRepository = AppDataSource.getRepository(Warehouse);
const stockTransactionRepository = AppDataSource.getRepository(StockTransaction);
const stockTransactionItemRepository = AppDataSource.getRepository(StockTransactionItem);

export const getDashboardStatsService = async () => {
  // 1. Tổng số sản phẩm trong hệ thống
  const totalProducts = await productRepository.count();

  // 2. Tổng giá trị vốn hàng tồn kho (quantity * cost_price)
  const inventoryValueResult = await inventoryRepository
    .createQueryBuilder("inventory")
    .innerJoin("inventory.product", "product")
    .select("COALESCE(SUM(inventory.quantity * product.cost_price), 0)", "total_value")
    .getRawOne();

  const totalInventoryValue = parseFloat(inventoryValueResult?.total_value || "0");

  // 3. Số lượng sản phẩm đang có tồn kho dưới hoặc bằng ngưỡng tối thiểu (low_stock)
  const lowStockResult = await productRepository
    .createQueryBuilder("product")
    .leftJoin("inventory", "inventory", "inventory.product_id = product.id")
    .groupBy("product.id")
    .having("COALESCE(SUM(inventory.quantity), 0) <= product.low_stock_threshold")
    .getRawMany();

  const lowStockCount = lowStockResult.length;

  // 4. Tổng số nhà kho đang hoạt động
  const totalWarehouses = await warehouseRepository.count({
    where: { is_active: true },
  });

  return {
    total_products: totalProducts,
    total_inventory_value: totalInventoryValue,
    low_stock_count: lowStockCount,
    total_warehouses: totalWarehouses,
  };
};

export const getStockMovementChartService = async (input: QueryStockMovementInput) => {
  const { days } = input;

  // Ngày bắt đầu (days ngày trước tính từ 00:00:00)
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - (days - 1));
  startDate.setHours(0, 0, 0, 0);

  // Truy vấn tổng số lượng Nhập và Xuất theo từng ngày
  const rawData = await stockTransactionItemRepository
    .createQueryBuilder("item")
    .innerJoin("item.transaction", "transaction")
    .select("TO_CHAR(transaction.created_at, 'YYYY-MM-DD')", "date")
    .addSelect("transaction.type", "type")
    .addSelect("SUM(item.quantity)", "total_quantity")
    .where("transaction.created_at >= :startDate", { startDate })
    .andWhere("transaction.type IN (:...types)", {
      types: [TransactionType.IMPORT, TransactionType.EXPORT],
    })
    .groupBy("TO_CHAR(transaction.created_at, 'YYYY-MM-DD')")
    .addGroupBy("transaction.type")
    .orderBy("date", "ASC")
    .getRawMany();

  // Tạo khung danh sách ngày liên tục đủ days ngày
  const chartDataMap: Record<string, { date: string; import_quantity: number; export_quantity: number }> = {};

  for (let i = 0; i < days; i++) {
    const currentDate = new Date(startDate);
    currentDate.setDate(startDate.getDate() + i);
    const dateString = currentDate.toISOString().split("T")[0];

    chartDataMap[dateString] = {
      date: dateString,
      import_quantity: 0,
      export_quantity: 0,
    };
  }

  // Điền dữ liệu thực tế từ query vào khung ngày
  rawData.forEach((row) => {
    const dateString = row.date;
    const type = row.type;
    const quantity = parseInt(row.total_quantity || "0", 10);

    if (chartDataMap[dateString]) {
      if (type === TransactionType.IMPORT) {
        chartDataMap[dateString].import_quantity = quantity;
      } else if (type === TransactionType.EXPORT) {
        chartDataMap[dateString].export_quantity = quantity;
      }
    }
  });

  return Object.values(chartDataMap);
};

export const getTopExportedProductsService = async (input: QueryTopProductsInput) => {
  const { limit } = input;

  const rawData = await stockTransactionItemRepository
    .createQueryBuilder("item")
    .innerJoin("item.transaction", "transaction")
    .innerJoinAndSelect("item.product", "product")
    .leftJoinAndSelect("product.category", "category")
    .leftJoinAndSelect("product.unit", "unit")
    .select([
      "product.id",
      "product.sku",
      "product.name",
      "product.selling_price",
      "category.id",
      "category.name",
      "unit.id",
      "unit.name",
    ])
    .addSelect("SUM(item.quantity)", "total_exported_quantity")
    .where("transaction.type = :type", { type: TransactionType.EXPORT })
    .groupBy("product.id")
    .addGroupBy("category.id")
    .addGroupBy("unit.id")
    .orderBy("total_exported_quantity", "DESC")
    .limit(limit)
    .getRawAndEntities();

  return rawData.entities.map((product, index) => {
    const rawItem = rawData.raw[index];
    return {
      product,
      total_exported_quantity: parseInt(rawItem.total_exported_quantity || "0", 10),
    };
  });
};

export const getRecentTransactionsService = async (input: QueryRecentTransactionsInput) => {
  const { limit } = input;

  const transactions = await stockTransactionRepository.find({
    relations: ["warehouse", "target_warehouse", "supplier", "created_by", "items", "items.product"],
    order: { created_at: "DESC" },
    take: limit,
  });

  return transactions.map((tx) => ({
    id: tx.id,
    type: tx.type,
    reference_no: tx.reference_no,
    warehouse_name: tx.warehouse?.name || null,
    target_warehouse_name: tx.target_warehouse?.name || null,
    supplier_name: tx.supplier?.name || null,
    created_by_username: tx.created_by?.username || null,
    total_items: tx.items ? tx.items.length : 0,
    created_at: tx.created_at,
  }));
};

export const getFullDashboardService = async () => {
  const [stats, chart, topProducts, recentTransactions] = await Promise.all([
    getDashboardStatsService(),
    getStockMovementChartService({ days: 7 }),
    getTopExportedProductsService({ limit: 5 }),
    getRecentTransactionsService({ limit: 5 }),
  ]);

  return {
    stats,
    stock_movement_chart: chart,
    top_exported_products: topProducts,
    recent_transactions: recentTransactions,
  };
};
