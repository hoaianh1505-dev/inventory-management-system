import { AppDataSource } from "../config/database";
import { Product } from "../entities/Product";
import { Inventory } from "../entities/Inventory";
import { Warehouse } from "../entities/Warehouse";
import { ChatMessageInput } from "../validations/ai-assistant.validation";
import { AppError } from "../utils/appError.util";

const productRepository = AppDataSource.getRepository(Product);
const inventoryRepository = AppDataSource.getRepository(Inventory);
const warehouseRepository = AppDataSource.getRepository(Warehouse);

// Thu thập bức ảnh dữ liệu thời gian thực từ CSDL để làm ngữ cảnh cho AI
const getSystemContextData = async () => {
  const [products, inventories, warehouses] = await Promise.all([
    productRepository.find({
      relations: ["category", "unit"],
      select: ["id", "sku", "name", "selling_price", "low_stock_threshold"],
      take: 20,
    }),
    inventoryRepository.find({
      relations: ["warehouse", "product"],
      take: 50,
    }),
    warehouseRepository.find({
      where: { is_active: true },
      select: ["id", "name", "code"],
    }),
  ]);

  // Danh sách tồn kho gom nhóm
  const inventorySummary = inventories.map((inv) => ({
    warehouse: inv.warehouse?.name || "N/A",
    product: inv.product?.name || "N/A",
    sku: inv.product?.sku || "N/A",
    quantity: inv.quantity,
  }));

  // Danh sách các sản phẩm có tổng tồn kho thấp
  const lowStockProducts = products.filter((prod) => {
    const totalQty = inventories
      .filter((inv) => inv.product_id === prod.id)
      .reduce((sum, item) => sum + item.quantity, 0);
    return totalQty <= prod.low_stock_threshold;
  }).map((prod) => ({
    name: prod.name,
    sku: prod.sku,
    threshold: prod.low_stock_threshold,
  }));

  return {
    total_products_count: products.length,
    warehouses_list: warehouses.map((w) => w.name),
    sample_products: products.map((p) => ({
      name: p.name,
      sku: p.sku,
      unit: p.unit?.name || "N/A",
      price: Number(p.selling_price),
    })),
    inventory_summary: inventorySummary,
    low_stock_alert_products: lowStockProducts,
  };
};

export const chatWithAiService = async (input: ChatMessageInput) => {
  const { message } = input;

  if (!message || message.trim().length === 0) {
    throw new AppError("Câu hỏi không được để trống", 400, "BAD_REQUEST");
  }

  const contextData = await getSystemContextData();

  const apiKey = process.env.GEMINI_API_KEY;

  // Nếu người dùng đã cài đặt GEMINI_API_KEY trong .env -> Gọi Gemini API thật
  if (apiKey && apiKey.trim() !== "" && apiKey !== "your_gemini_api_key") {
    try {
      const systemInstruction = `Bạn là Trợ lý AI Quản lý Kho Hàng (IMS AI Assistant) chuyên nghiệp, thông minh và thân thiện.
Dưới đây là DỮ LIỆU THỰC TẾ HIỆN TẠI TỪ CSDL HỆ THỐNG KHO HÀNG:
${JSON.stringify(contextData, null, 2)}

HƯỚNG DẪN TRẢ LỜI:
1. Trả lời bằng tiếng Việt thân thiện, súc tích, chuyên nghiệp.
2. Sử dụng thông tin dữ liệu thực tế ở trên để trả lời chính xác câu hỏi của người dùng.
3. Nếu người dùng hỏi về tồn kho hay cảnh báo hết hàng, hãy dùng dữ liệu 'inventory_summary' và 'low_stock_alert_products'.
4. Trình bày rõ ràng, sử dụng bullet points nếu danh sách có nhiều mục.`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                role: "user",
                parts: [
                  { text: `${systemInstruction}\n\nCâu hỏi của người dùng: ${message}` },
                ],
              },
            ],
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        const replyText =
          data.candidates?.[0]?.content?.parts?.[0]?.text ||
          "Xin lỗi, tôi không thể xử lý câu hỏi này lúc này.";

        return {
          reply: replyText,
          source: "gemini_ai",
        };
      }
    } catch (error) {
      console.error("[AI_ASSISTANT_ERROR] Lỗi khi gọi Gemini API:", error);
    }
  }

  // Fallback thông minh: Phân tích cú pháp tiếng Việt đơn giản và trả lời bằng dữ liệu thật của DB khi chưa cấu hình API Key
  const lowerMsg = message.toLowerCase();
  let fallbackReply = "";

  if (lowerMsg.includes("tồn") || lowerMsg.includes("kho") || lowerMsg.includes("số lượng")) {
    const invListStr = contextData.inventory_summary
      .slice(0, 5)
      .map((item) => `- ${item.product} (${item.sku}) tại ${item.warehouse}: **${item.quantity}**`)
      .join("\n");

    fallbackReply = `Dưới đây là thông tin tồn kho thực tế hiện tại:\n\n${invListStr || "Hiện chưa có dữ liệu tồn kho."}\n\n*Lưu ý: Để bật trí tuệ nhân tạo Gemini phản hồi tự nhiên hơn, bạn có thể điền GEMINI_API_KEY trong file .env nhé!*`;
  } else if (lowerMsg.includes("hết hàng") || lowerMsg.includes("cảnh báo") || lowerMsg.includes("thấp")) {
    const lowStockStr = contextData.low_stock_alert_products
      .map((p) => `- ${p.name} (${p.sku}) - Ngưỡng tối thiểu: ${p.threshold}`)
      .join("\n");

    fallbackReply = `Danh sách các sản phẩm đang chạm hoặc dưới ngưỡng tồn tối thiểu:\n\n${lowStockStr || "Hiện không có sản phẩm nào chạm ngưỡng tồn thấp."}`;
  } else {
    fallbackReply = `Chào bạn! Tôi là Trợ lý AI Quản lý Kho Hàng (IMS Assistant).\nHệ thống hiện có **${contextData.total_products_count} sản phẩm** và **${contextData.warehouses_list.length} nhà kho** đang hoạt động.\n\nBạn có thể hỏi tôi các câu hỏi như: "Cho tôi xem tồn kho hiện tại?", "Sản phẩm nào sắp hết hàng?"...`;
  }

  return {
    reply: fallbackReply,
    source: "system_smart_assistant",
  };
};

export const getAiSuggestionsService = async () => {
  return [
    "Thống kê tình hình tồn kho thực tế hiện tại?",
    "Những sản phẩm nào đang bị cảnh báo sắp hết hàng?",
    "Cho tôi xem danh sách các nhà kho đang hoạt động?",
    "Giá bán trung bình của các sản phẩm là bao nhiêu?",
  ];
};
