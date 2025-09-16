import config from "@app/config";
import {
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl as s3GetSignedUrl } from "@aws-sdk/s3-request-presigner";
import multer from "multer";

const s3 = new S3Client({
  region: config.aws.aws_region,
  credentials: {
    accessKeyId: config.aws.aws_access_key as string,
    secretAccessKey: config.aws.aws_secret_key as string,
  },
});

const storage = multer.memoryStorage();
const upload = multer({ storage });

// ---------------- Upload ----------------
const uploadToS3 = async (file: Express.Multer.File) => {
  const safeFileName = file.originalname.replace(/\s+/g, "_");

  const uploadParams = {
    Bucket: config.aws.aws_bucket,
    Key: `${Date.now()}_${safeFileName}`,
    Body: file.buffer,
    ContentType: file.mimetype,
  };

  const command = new PutObjectCommand(uploadParams);
  await s3.send(command);

  return `https://${config.aws.aws_bucket}.s3.${config.aws.aws_region}.amazonaws.com/${uploadParams.Key}`;
};

// ---------------- Get Signed URL ----------------
const getSignedUrl = async (fileUrl: string, expiresIn = 3600) => {
  // Extract Key from full URL
  const key = fileUrl.split(".amazonaws.com/")[1];

  const command = new GetObjectCommand({
    Bucket: config.aws.aws_bucket,
    Key: key,
  });

  return await s3GetSignedUrl(s3, command, { expiresIn });
};

// ---------------- Delete File ----------------
const deleteFromS3 = async (fileUrl: string) => {
  const key = fileUrl.split(".amazonaws.com/")[1];

  const command = new DeleteObjectCommand({
    Bucket: config.aws.aws_bucket,
    Key: key,
  });

  await s3.send(command);
  return { message: "File deleted from S3", key };
};

export const fileUploader = {
  upload,
  uploadToS3,
  getSignedUrl,
  deleteFromS3,
};
