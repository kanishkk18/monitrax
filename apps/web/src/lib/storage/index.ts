// lib/storage/index.ts
import { UTApi } from "uploadthing/server";
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export interface IStorageProvider {
  upload(key: string, buffer: Buffer, contentType?: string): Promise<string>;
  getUrl(key: string): Promise<string>;
  delete(key: string): Promise<void>;
}

// ─── UploadThing Provider (default / dev) ───────────────────────────────────
class UploadThingProvider implements IStorageProvider {
  private utapi: UTApi;

  constructor() {
    this.utapi = new UTApi();
  }

  async upload(key: string, buffer: Buffer, contentType = "image/png"): Promise<string> {
    // Type assertion to satisfy UploadThing's File constructor
    const file = new File([buffer.buffer as ArrayBuffer], key.split("/").pop()!, { type: contentType });
    const response = await this.utapi.uploadFiles(file);
    if (response.error) throw new Error(response.error.message);
    return response.data!.ufsUrl;
  }

  async getUrl(key: string): Promise<string> {
    // UploadThing URLs are already public
    return key;
  }

  async delete(fileKey: string): Promise<void> {
    await this.utapi.deleteFiles(fileKey);
  }
}

// ─── S3 Provider (production) ───────────────────────────────────────────────
class S3Provider implements IStorageProvider {
  private client: S3Client;
  private bucket: string;

  constructor() {
    this.client = new S3Client({
      region: process.env.AWS_REGION!,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      },
    });
    this.bucket = process.env.S3_BUCKET_NAME!;
  }

  async upload(key: string, buffer: Buffer, contentType = "image/png"): Promise<string> {
    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: buffer,
        ContentType: contentType,
        ACL: "public-read",
      })
    );
    return `https://${this.bucket}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
  }

  async getUrl(key: string): Promise<string> {
    // Return signed URL (1 hour expiry)
    const command = new GetObjectCommand({ Bucket: this.bucket, Key: key });
    return getSignedUrl(this.client, command, { expiresIn: 3600 });
  }

  async delete(key: string): Promise<void> {
    await this.client.send(new DeleteObjectCommand({ Bucket: this.bucket, Key: key }));
  }
}

// ─── Factory ────────────────────────────────────────────────────────────────
export function getStorageProvider(type?: string): IStorageProvider {
  const provider = type || process.env.STORAGE_PROVIDER || "uploadthing";
  if (provider === "s3") return new S3Provider();
  return new UploadThingProvider();
}
