import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Configurar armazenamento
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Sanitizar nome do arquivo para evitar problemas
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `file-${uniqueSuffix}${ext}`);
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit (bom para arquivos de estudo)
  }
});

// Upload de arquivo
router.post('/', authenticateToken, upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Nenhum arquivo enviado' });
    }

    // Construir URL do arquivo
    // Nota: Em produção, isso seria um URL do S3 ou similar
    const baseUrl = process.env.API_URL || 'http://localhost:3001';
    const fileUrl = `${baseUrl}/uploads/${req.file.filename}`;

    res.json({
      success: true,
      data: {
        url: fileUrl,
        filename: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size
      }
    });
    return;
  } catch (error) {
    console.error('Erro no upload:', error);
    res.status(500).json({ success: false, message: 'Erro ao processar upload' });
    return;
  }
});

export default router;
