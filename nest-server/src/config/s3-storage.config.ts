import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import * as multerS3 from 'multer-s3';
import * as multer from 'multer';
import * as dotenv from 'dotenv';
dotenv.config();

// Create the S3 client instance
const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// 이미지 업로드
export async function uploadFileToS3(file: Express.Multer.File) {
  const key = `image/images/${Date.now().toString()}-${file.originalname}`;

  const upload = new Upload({
    client: s3,
    params: {
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: key,
      Body: file.buffer,
      ACL: 'public-read', // or 'private' depending on your requirements
    },
    partSize: 5 * 1024 * 1024, // optional, defaults to 5MB
    leavePartsOnError: false, // optional, defaults to false
  });

  await upload.done();
  console.log('File uploaded to:', key);
  return key; // Return the key to store in the database

  // const result = await upload.done();
  // console.log('File uploaded to:', result.Location);
  // return result.Location;
}

// 버퍼 업로드
export async function uploadBufferToS3(
  key: string,
  buffer: Buffer,
  bucket: string, // Expect the bucket name as a string
  contentType: string = 'image/jpeg', // default to jpeg
) {
  const command = new PutObjectCommand({
    Bucket: bucket, // Use the bucket name passed as a parameter
    Key: key,
    Body: buffer,
    ContentType: contentType,
    ACL: 'public-read', // or 'private' based on your requirements
  });

  await s3.send(command);
  console.log('Buffer uploaded to:', key);
}
