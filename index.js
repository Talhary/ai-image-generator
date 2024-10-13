import express from 'express';
import 'dotenv/config';
import { createImage, upscaleImage } from './libs/flux-pro.js';
const app = express();
const port = process.env.PORT || 5000;
app.use(express.static('public') );
app.use(express.json());

app.post('/generate-image', createImage)
app.post('/upscale-image', upscaleImage)

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
