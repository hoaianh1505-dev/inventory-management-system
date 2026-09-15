import { AppDataSource } from "../config/database";
import { Product } from "../entities/Product";
import { ProductImage } from "../entities/ProductImage";
import {
  CreateProductInput,
  UpdateProductInput,
  QueryProductInput,
} from "../validations/product.validation";
import { AppError } from "../utils/appError.util";
import { uploadFileToS3, deleteFileFromS3 } from "../utils/s3.util";

const productRepository = AppDataSource.getRepository(Product);
const productImageRepository = AppDataSource.getRepository(ProductImage);

export const getProductsService = async (query: QueryProductInput) => {
  const { page, limit, search, category_id, supplier_id, low_stock } = query;
  const skip = (page - 1) * limit;

  const queryBuilder = productRepository
    .createQueryBuilder("product")
    .leftJoinAndSelect("product.category", "category")
    .leftJoinAndSelect("product.unit", "unit")
    .leftJoinAndSelect("product.supplier", "supplier")
    .leftJoinAndSelect("product.images", "images")
    .orderBy("product.created_at", "DESC")
    .skip(skip)
    .take(limit);

  if (search) {
    queryBuilder.andWhere(
      "(product.name ILIKE :search OR product.sku ILIKE :search OR product.barcode ILIKE :search)",
      { search: `%${search}%` }
    );
  }

  if (category_id) {
    queryBuilder.andWhere("product.category_id = :category_id", { category_id });
  }

  if (supplier_id) {
    queryBuilder.andWhere("product.supplier_id = :supplier_id", { supplier_id });
  }

  const [products, total] = await queryBuilder.getManyAndCount();

  return {
    data: products,
    meta: {
      page,
      limit,
      total,
    },
  };
};

export const getProductByIdService = async (id: string) => {
  const product = await productRepository.findOne({
    where: { id },
    relations: ["category", "unit", "supplier", "images"],
  });

  if (!product) {
    throw new AppError("Không tìm thấy sản phẩm", 404, "NOT_FOUND");
  }

  return product;
};

export const createProductService = async (input: CreateProductInput) => {
  const existingSku = await productRepository.findOne({ where: { sku: input.sku } });
  if (existingSku) {
    throw new AppError("Mã SKU sản phẩm đã tồn tại", 409, "DUPLICATE_SKU");
  }

  if (input.barcode) {
    const existingBarcode = await productRepository.findOne({ where: { barcode: input.barcode } });
    if (existingBarcode) {
      throw new AppError("Mã vạch Barcode đã tồn tại", 409, "DUPLICATE_BARCODE");
    }
  }

  const product = productRepository.create({
    name: input.name,
    sku: input.sku,
    barcode: input.barcode || null,
    description: input.description || null,
    cost_price: input.cost_price ?? 0,
    selling_price: input.selling_price ?? 0,
    low_stock_threshold: input.low_stock_threshold ?? 10,
    category_id: input.category_id || null,
    unit_id: input.unit_id || null,
    supplier_id: input.supplier_id || null,
  });

  await productRepository.save(product);
  return product;
};

export const updateProductService = async (id: string, input: UpdateProductInput) => {
  const product = await productRepository.findOne({ where: { id } });
  if (!product) {
    throw new AppError("Không tìm thấy sản phẩm", 404, "NOT_FOUND");
  }

  if (input.sku && input.sku !== product.sku) {
    const existingSku = await productRepository.findOne({ where: { sku: input.sku } });
    if (existingSku) {
      throw new AppError("Mã SKU sản phẩm đã tồn tại", 409, "DUPLICATE_SKU");
    }
  }

  if (input.barcode && input.barcode !== product.barcode) {
    const existingBarcode = await productRepository.findOne({ where: { barcode: input.barcode } });
    if (existingBarcode) {
      throw new AppError("Mã vạch Barcode đã tồn tại", 409, "DUPLICATE_BARCODE");
    }
  }

  if (input.name !== undefined) product.name = input.name;
  if (input.sku !== undefined) product.sku = input.sku;
  if (input.barcode !== undefined) product.barcode = input.barcode || null;
  if (input.description !== undefined) product.description = input.description || null;
  if (input.cost_price !== undefined) product.cost_price = input.cost_price;
  if (input.selling_price !== undefined) product.selling_price = input.selling_price;
  if (input.low_stock_threshold !== undefined) product.low_stock_threshold = input.low_stock_threshold;
  if (input.category_id !== undefined) product.category_id = input.category_id || null;
  if (input.unit_id !== undefined) product.unit_id = input.unit_id || null;
  if (input.supplier_id !== undefined) product.supplier_id = input.supplier_id || null;

  await productRepository.save(product);
  return product;
};

export const deleteProductService = async (id: string) => {
  const product = await productRepository.findOne({ where: { id } });
  if (!product) {
    throw new AppError("Không tìm thấy sản phẩm", 404, "NOT_FOUND");
  }

  await productRepository.softDelete(id);
  return { message: "Xóa sản phẩm thành công" };
};

export const uploadProductImagesService = async (
  productId: string,
  files: Express.Multer.File[]
) => {
  const product = await productRepository.findOne({
    where: { id: productId },
    relations: ["images"],
  });

  if (!product) {
    throw new AppError("Không tìm thấy sản phẩm", 404, "NOT_FOUND");
  }

  if (!files || files.length === 0) {
    throw new AppError("Vui lòng gửi kèm ít nhất một file ảnh", 400, "NO_FILES_PROVIDED");
  }

  const existingImagesCount = product.images ? product.images.length : 0;
  const savedImages: ProductImage[] = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const s3Result = await uploadFileToS3(
      file.buffer,
      file.originalname,
      file.mimetype,
      "products"
    );

    const isPrimary = existingImagesCount === 0 && i === 0;

    const newImage = productImageRepository.create({
      product_id: productId,
      image_url: s3Result.url,
      s3_key: s3Result.key,
      is_primary: isPrimary,
    });

    const savedImage = await productImageRepository.save(newImage);
    savedImages.push(savedImage);
  }

  return savedImages;
};

export const deleteProductImageService = async (productId: string, imageId: string) => {
  const image = await productImageRepository.findOne({
    where: { id: imageId, product_id: productId },
  });

  if (!image) {
    throw new AppError("Không tìm thấy hình ảnh sản phẩm", 404, "NOT_FOUND");
  }

  // Xóa file trên S3 AWS
  try {
    await deleteFileFromS3(image.s3_key);
  } catch (err) {
    console.error(`[AWS S3] Error deleting key ${image.s3_key}:`, err);
  }

  const wasPrimary = image.is_primary;
  await productImageRepository.delete(imageId);

  // Nếu ảnh vừa xóa là ảnh chính, đặt ảnh khác làm ảnh chính
  if (wasPrimary) {
    const remainingImage = await productImageRepository.findOne({
      where: { product_id: productId },
      order: { created_at: "ASC" },
    });

    if (remainingImage) {
      remainingImage.is_primary = true;
      await productImageRepository.save(remainingImage);
    }
  }

  return { message: "Xóa hình ảnh sản phẩm thành công" };
};

export const setPrimaryProductImageService = async (productId: string, imageId: string) => {
  const images = await productImageRepository.find({
    where: { product_id: productId },
  });

  if (!images || images.length === 0) {
    throw new AppError("Sản phẩm không có hình ảnh nào", 404, "NOT_FOUND");
  }

  const targetImage = images.find((img) => img.id === imageId);
  if (!targetImage) {
    throw new AppError("Không tìm thấy hình ảnh được chỉ định", 404, "NOT_FOUND");
  }

  for (const img of images) {
    img.is_primary = img.id === imageId;
  }

  await productImageRepository.save(images);
  return { message: "Đặt ảnh đại diện sản phẩm thành công" };
};
