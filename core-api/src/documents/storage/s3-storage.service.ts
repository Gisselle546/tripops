import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { randomUUID } from 'crypto';

@Injectable()
export class S3StorageService {
  private readonly s3: S3Client;
  private readonly bucket: string;

  constructor(private readonly config: ConfigService) {
    this.bucket = config.get<string>('AWS_S3_BUCKET', 'tripops-documents');

    this.s3 = new S3Client({
      region: config.get<string>('AWS_S3_REGION', 'us-east-1'),
      ...(config.get<string>('AWS_ACCESS_KEY_ID') && {
        credentials: {
          accessKeyId: config.get<string>('AWS_ACCESS_KEY_ID')!,
          secretAccessKey: config.get<string>('AWS_SECRET_ACCESS_KEY')!,
        },
      }),
    });
  }

  /**
   * Upload a file buffer to S3 and return the storage key.
   */
  async upload(
    tripId: string,
    fileName: string,
    buffer: Buffer,
    mimeType?: string,
  ): Promise<string> {
    const key = `trips/${tripId}/${randomUUID()}-${fileName}`;

    await this.s3.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: buffer,
        ContentType: mimeType ?? 'application/octet-stream',
      }),
    );

    return key;
  }

  /**
   * Generate a presigned GET URL (default 15 min expiry).
   */
  async getSignedDownloadUrl(
    storageKey: string,
    expiresInSeconds = 900,
  ): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: storageKey,
    });

    return getSignedUrl(this.s3, command, { expiresIn: expiresInSeconds });
  }

  /**
   * Delete a file from S3.
   */
  async delete(storageKey: string): Promise<void> {
    await this.s3.send(
      new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: storageKey,
      }),
    );
  }
}
