import { PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { s3Client } from "../config/s3.config";
import path from "path";

export interface S3UploadResult {
  key: string;
  url: string;
}

export const uploadFileToS3 = async (
  fileBuffer: Buffer,
  originalName: string,
  mimeType: string,
  folderName: string = "products"
): Promise<S3UploadResult> => {
  const fileExt = path.extname(originalName);
  const baseName = path.basename(originalName, fileExt);
  const keyName = `${Date.now()}-${baseName.replace(/[^a-zA-Z0-9]/g, "_")}${fileExt}`;
  const key = `${folderName}/${keyName}`;
  const bucketName = process.env.AWS_S3_BUCKET || "";
  const region = process.env.AWS_REGION || "ap-southeast-1";

  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: key,
    Body: fileBuffer,
    ContentType: mimeType,
  });

  await s3Client.send(command);

  return {
    key,
    url: `https://${bucketName}.s3.${region}.amazonaws.com/${key}`,
  };
};

export const deleteFileFromS3 = async (s3Key: string): Promise<void> => {
  const command = new DeleteObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET || "",
    Key: s3Key,
  });

  await s3Client.send(command);
};

export const getFileStreamFromS3 = async (s3Key: string) => {
  const command = new GetObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET || "",
    Key: s3Key,
  });

  const response = await s3Client.send(command);
  return response.Body;
};
