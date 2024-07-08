// import { S3Client } from '@aws-sdk/client-s3';
// import * as multerS3 from 'multer-s3';
// import { extname } from 'path';
// import { s3 } from '../config/aws.config';

// export const multerOptions = {
//   storage: multerS3({
//     s3: s3,
//     bucket: process.env.AWS_S3_BUCKET_NAME,
//     key: (req, file, cb) => {
//       const fileExtName = extname(file.originalname);
//       const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
//       cb(null, `${uniqueSuffix}${fileExtName}`);
//     },
//   }),
// };
