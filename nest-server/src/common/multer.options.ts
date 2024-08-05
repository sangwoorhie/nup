import { diskStorage } from 'multer';
import { extname, join } from 'path';

export const multerOptions = {
  storage: diskStorage({
    destination: join(__dirname, '../../uploads'), // Change this path as per your directory structure
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      cb(
        null,
        `${file.fieldname}-${uniqueSuffix}${extname(file.originalname)}`,
      );
    },
  }),
  fileFilter: (req, file, cb) => {
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
      return cb(
        new Error('이미지 파일 (jpg, jpeg, png, gif)만 업로드 가능합니다.'),
        false,
      );
    }
    cb(null, true);
  },
};

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
