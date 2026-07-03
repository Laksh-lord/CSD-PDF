import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import sqlite3 from 'sqlite3';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const DIST_DIR = path.join(ROOT_DIR, 'dist');
const DATA_DIR = path.join(ROOT_DIR, 'server-data');
const UPLOADS_DIR = path.join(DATA_DIR, 'uploads');
const DB_PATH = path.join(DATA_DIR, 'pdfvault.db');
const PORT = Number(process.env.PORT || 8787);

fs.mkdirSync(UPLOADS_DIR, { recursive: true });

const db = new sqlite3.Database(DB_PATH);
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS pdfs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      fileName TEXT NOT NULL,
      fileSize INTEGER NOT NULL,
      storagePath TEXT NOT NULL,
      createdAt TEXT NOT NULL
    )
  `);
});

const app = express();
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(UPLOADS_DIR));
if (fs.existsSync(DIST_DIR)) {
  app.use(express.static(DIST_DIR));
  app.get('/', (_req, res) => {
    res.sendFile(path.join(DIST_DIR, 'index.html'));
  });
  app.get('/index.html', (_req, res) => {
    res.sendFile(path.join(DIST_DIR, 'index.html'));
  });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOADS_DIR),
  filename: (_req, file, cb) => {
    const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    cb(null, `${Date.now()}_${safeName}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const isPdf = file.mimetype === 'application/pdf' || file.originalname.toLowerCase().endsWith('.pdf');
    cb(isPdf ? null : new Error('Only PDF files are allowed.'), isPdf);
  },
});

app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

app.get('/api/pdfs', (_req, res) => {
  db.all(
    'SELECT id, fileName, fileSize, storagePath, createdAt FROM pdfs ORDER BY datetime(createdAt) DESC',
    [],
    (err, rows) => {
      if (err) return res.status(500).json({ error: 'Failed to fetch files.' });
      const mapped = rows.map((row) => ({
        ...row,
        id: String(row.id),
        openURL: `/uploads/${row.storagePath}`,
        downloadURL: `/api/pdfs/${row.id}/download`,
      }));
      res.json(mapped);
    }
  );
});

app.post('/api/pdfs', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded.' });
  const createdAt = new Date().toISOString();
  db.run(
    'INSERT INTO pdfs (fileName, fileSize, storagePath, createdAt) VALUES (?, ?, ?, ?)',
    [req.file.originalname, req.file.size, req.file.filename, createdAt],
    function onInsert(err) {
      if (err) return res.status(500).json({ error: 'Failed to save file metadata.' });
      res.status(201).json({
        id: String(this.lastID),
        fileName: req.file.originalname,
        fileSize: req.file.size,
        storagePath: req.file.filename,
        createdAt,
        openURL: `/uploads/${req.file.filename}`,
        downloadURL: `/api/pdfs/${this.lastID}/download`,
      });
    }
  );
});

app.get('/api/pdfs/:id/download', (req, res) => {
  const { id } = req.params;
  db.get('SELECT fileName, storagePath FROM pdfs WHERE id = ?', [id], (err, row) => {
    if (err) return res.status(500).json({ error: 'Failed to download file.' });
    if (!row) return res.status(404).json({ error: 'File not found.' });

    const filePath = path.join(UPLOADS_DIR, row.storagePath);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File missing on disk.' });
    }

    res.download(filePath, row.fileName);
  });
});

app.delete('/api/pdfs/:id', (req, res) => {
  const { id } = req.params;
  db.get('SELECT storagePath FROM pdfs WHERE id = ?', [id], (err, row) => {
    if (err) return res.status(500).json({ error: 'Failed to delete file.' });
    if (!row) return res.status(404).json({ error: 'File not found.' });

    const filePath = path.join(UPLOADS_DIR, row.storagePath);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    db.run('DELETE FROM pdfs WHERE id = ?', [id], (deleteErr) => {
      if (deleteErr) return res.status(500).json({ error: 'Failed to delete metadata.' });
      res.status(204).send();
    });
  });
});

if (fs.existsSync(DIST_DIR)) {
  app.use((req, res, next) => {
    if (req.method !== 'GET' || req.path.startsWith('/api/') || req.path.startsWith('/uploads/')) {
      return next();
    }

    const indexPath = path.join(DIST_DIR, 'index.html');
    if (fs.existsSync(indexPath)) {
      return res.sendFile(indexPath);
    }

    return next();
  });
}

app.listen(PORT, () => {
  console.log(`PDFVault backend running on http://127.0.0.1:${PORT}`);
});
