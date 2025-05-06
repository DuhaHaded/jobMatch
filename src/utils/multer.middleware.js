import multer from 'multer';
import fs from 'fs';
import path from 'path';

export const fileType = {
  image: ['image/png', 'image/jpeg', 'image/webp'],
  pdf: ['application/pdf']
};

export function fileUpload(customTypes = []) {
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadDir = 'uploads/profile-images';
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      cb(null, uniqueSuffix + path.extname(file.originalname));
    }
  });

  const fileFilter = (req, file, cb) => {
    if (customTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file format!'));
    }
  };

  return multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter
  });
}


/* كود معدل
import multer from 'multer';
import path from 'path';

export const fileType = {
  image: ['image/png', 'image/jpeg', 'image/webp'],
  pdf: ['application/pdf']
};

function fileUpload(customTypes = []) {
  const allowAll = customTypes.length === 0;

  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const ext = path.extname(file.originalname);
      cb(null, file.fieldname + '-' + uniqueSuffix + ext);
    }
  });

  const fileFilter = (req, file, cb) => {
    if (allowAll || customTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDFs are allowed.'));
    }
  };

  return multer({ 
    storage, 
    fileFilter,
    limits: { fileSize: 10 * 1024 * 1024 } // 10 MB
  });
}

export default fileUpload;



*/ 