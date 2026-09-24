import bwipjs from "bwip-js";

/**
 * Generate a Code128 Barcode as a PNG Buffer
 * @param text Content to encode (e.g. SKU)
 */
export const generateBarcodePngBuffer = async (text: string): Promise<Buffer> => {
  return bwipjs.toBuffer({
    bcid: "code128", // Barcode type Code128
    text: text, // Text to encode
    scale: 3, // Scaling factor
    height: 12, // Bar height in mm
    includetext: true, // Show human-readable text below barcode
    textxalign: "center", // Center text
  });
};

/**
 * Generate a Code128 Barcode as a Base64 Data URL string
 * @param text Content to encode (e.g. SKU)
 */
export const generateBarcodeBase64 = async (text: string): Promise<string> => {
  const buffer = await generateBarcodePngBuffer(text);
  return `data:image/png;base64,${buffer.toString("base64")}`;
};

/**
 * Generate a QR Code as a PNG Buffer
 * @param text Content to encode (e.g. SKU or JSON data)
 */
export const generateQrCodePngBuffer = async (text: string): Promise<Buffer> => {
  return bwipjs.toBuffer({
    bcid: "qrcode", // QR Code type
    text: text, // Text to encode
    scale: 4, // Scaling factor
  });
};

/**
 * Generate a QR Code as a Base64 Data URL string
 * @param text Content to encode
 */
export const generateQrCodeBase64 = async (text: string): Promise<string> => {
  const buffer = await generateQrCodePngBuffer(text);
  return `data:image/png;base64,${buffer.toString("base64")}`;
};
