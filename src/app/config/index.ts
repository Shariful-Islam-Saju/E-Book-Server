// config/index.ts
import { Config } from "@app/types";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(process.cwd(), ".env") });

// Validate required environment variables
const requiredEnv = [
  "NODE_ENV",
  "PORT",
  "SALT_ROUNDS",
  "ACCESS_TOKEN_SECRET",
  "ACCESS_TOKEN_EXPIRES_IN",
  "REFRESH_TOKEN_SECRET",
  "REFRESH_TOKEN_EXPIRES_IN",
] as const;

requiredEnv.forEach((key) => {
  if (!process.env[key]) {
    throw new Error(`Environment variable ${key} is missing`);
  }
});

const config: Config = {
  env: process.env.NODE_ENV!,
  port: process.env.PORT!,
  salt_rounds: process.env.SALT_ROUNDS!,
  jwt: {
    access_token_secret: process.env.ACCESS_TOKEN_SECRET!,
    access_token_expires_in: process.env.ACCESS_TOKEN_EXPIRES_IN!,
    refresh_token_secret: process.env.REFRESH_TOKEN_SECRET!,
    refresh_token_expires_in: process.env.REFRESH_TOKEN_EXPIRES_IN!,
  },
  aws: {
    aws_access_key: process.env.AWS_ACCESS_KEY!,
    aws_secret_key: process.env.AWS_SECRET_KEY!,
    aws_region: process.env.AWS_REGION!,
    aws_bucket: process.env.AWS_BUCKET!,
  },
};

export default config;
