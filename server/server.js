import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import routes from './routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS and JSON parsing
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Setup static uploads path
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Serve uploaded files statically
app.use('/uploads', express.static(uploadsDir));

// Mount our routes under /api
app.use('/api', routes);

// Serve frontend static assets from ../dist in production
const distPath = path.join(__dirname, '../dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  
  // For any other GET request, serve index.html (supports SPA client-side routing)
  app.get('*', (req, res, next) => {
    // If it's an API or Uploads route that fell through, don't serve index.html
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
      return next();
    }
    res.sendFile(path.join(distPath, 'index.html'));
  });
} else {
  // Base route for sanity check in dev (if dist isn't built yet)
  app.get('/', (req, res) => {
    res.json({ message: "Sachivalayam Connect API is running (development mode)." });
  });
}

// Start listening
app.listen(PORT, () => {
  console.log(`[SERVER] Sachivalayam Connect server running on http://localhost:${PORT}`);
});
