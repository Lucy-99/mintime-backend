import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { existsSync, mkdirSync } from 'fs';
import { diskStorage } from 'multer';

export const multerDiskOptions: MulterOptions = {
  storage: diskStorage({
    destination(req, file, callback) {
      const uploadPath = 'uploads';
      if (!existsSync(uploadPath)) {
        mkdirSync(uploadPath);
      }
      callback(null, uploadPath);
    },
    filename(req, file, callback) {
      callback(null, `${Date.now()}${file.originalname}`);
    },
  }),
};

export const uploadFileURL = (fileName: string) =>
  `http://localhost:3090/api/posts/image/${fileName}`;
