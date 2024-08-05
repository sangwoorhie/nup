import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';

export const multerOptions = {
  storage: diskStorage({
    destination: (req, file, cb) => {
      let uploadPath: string;

      if (file.fieldname === 'profile_image') {
        uploadPath = join(__dirname, '../../uploads/profile_images');
      } else if (file.fieldname === 'business_license') {
        uploadPath = join(__dirname, '../../uploads/business_licenses');
      }

      // Ensure the upload directory exists
      if (!existsSync(uploadPath)) {
        mkdirSync(uploadPath, { recursive: true });
      }

      cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      cb(null, `${file.fieldname}-${uniqueSuffix}${extname(file.originalname)}`);
    },
  }),
  fileFilter: (req, file, cb) => {
    if (file.fieldname === 'profile_image') {
      if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
        return cb(new Error('이미지 파일 (jpg, jpeg, png, gif)만 업로드 가능합니다.'), false);
      }
    } else if (file.fieldname === 'business_license') {
      if (!file.originalname.match(/\.(pdf|doc|docx|ppt|pptx|xls|xlsx)$/)) {
        return cb(new Error('허용된 파일 형식: pdf, doc, docx, ppt, pptx, xls, xlsx'), false);
      }
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
