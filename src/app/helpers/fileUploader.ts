import config from "@app/config";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
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


const uploadToS3 = async (file: any) => {
  const uploadParams = {
    Bucket: config.aws.aws_bucket,
    Key: `${Date.now()}_${file.originalname}`,
    Body: file.buffer,
    ContentType: file.mimetype,
  };
  const command = new PutObjectCommand(uploadParams);
  await s3.send(command);
  return `https://${config.aws.aws_bucket}.s3.${config.aws.aws_region}.amazonaws.com/${uploadParams.Key}`;
};

export const fileUploader = {
  upload,
  uploadToS3,
};