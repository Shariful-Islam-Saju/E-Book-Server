import { JwtPayload } from "jsonwebtoken";

export interface JwtConfig {
  access_token_secret: string;
  access_token_expires_in: string;
  refresh_token_secret: string;
  refresh_token_expires_in: string;
}


export interface AwsConfig {
  aws_access_key: string;
  aws_secret_key: string;
  aws_region: string;
  aws_bucket: string;
}

export interface Config {
  env: string;
  port: string;
  salt_rounds: string;
  jwt: JwtConfig;
  aws: AwsConfig;
}


export interface CustomJwtPayload extends JwtPayload {
  id: string;
  iat: number;
}
