import express from 'express';
import 'dotenv/config';
import multer from 'multer';
import path from 'path'
import { createImage, to_anime, upscaleImage } from './libs/flux-pro.js';
const app = express();
const port = process.env.PORT || 5000;
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static('public') );
app.use(express.json());
app.post('/generate-image', createImage)
app.post('/upscale-image', upscaleImage)
app.post('/image-to-anime',to_anime)
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
      cb(null, Date.now() + path.extname(file.originalname)); // Save with timestamp + original extension
    }
  });
const upload = multer({ storage: storage });
  
  // File upload endpoint
  app.post('/upload', upload.single('file'), (req, res) => {
    if (req.file) {
      const fileUrl = `https://ai-image-generator-by-talha-92a3aa2e28fe.herokuapp.com/uploads/${req.file.filename}`;
      res.json({ url: fileUrl });
    } else {
      res.status(400).json({ error: 'File upload failed' });
    }
  });
  app.get('/uploads/:filename', (req, res) => {
    const filePath = path.join(__dirname, 'uploads', req.params.filename);
    res.sendFile(filePath);
  });
  // Serve uploaded files
  

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
