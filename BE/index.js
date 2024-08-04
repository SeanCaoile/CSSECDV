import express from 'express';
import cors from 'cors';
import userRoutes from './routes/routes.js';
import blogRoutes from './routes/blogRoutes.js';
import announcementRoutes from './routes/announcementRoutes.js';

import dotenv from 'dotenv';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';

import path from 'path';
import fs from 'fs';
import https from 'https';

dotenv.config();

console.log('host is index in ' + process.env.DB_HOST);

const port = process.env.PORT;
const app = express();

// Increase the limit for JSON payloads
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.use(cookieParser());
app.use(cors({
  origin: 'https://localhost:5173', // Allow only this origin (for FE)
  credentials: true
}));

// Middleware to get IPv4 address if possible
app.use((req, res, next) => {
  let ip = req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || req.socket.remoteAddress;

  // Handle IPv6 loopback address
  if (ip === '::1' || ip === '::ffff:127.0.0.1') {
    ip = '127.0.0.1';
  }

  // Check if IP is IPv4-mapped IPv6 address
  if (ip.includes('::ffff:')) {
    ip = ip.split(':').pop();  // Extract the IPv4 part
  }

  req.ipv4 = ip;
  next();
}); 

// Use helmet with CSP
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'"],
      imgSrc: ["'self'"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
      workerSrc: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'"],
      frameAncestors: ["'none'"],
      blockAllMixedContent: [],
      upgradeInsecureRequests: [],
    },
  },
}));

app.use('/api', userRoutes);
app.use('/api', blogRoutes);
app.use('/api/announcements', announcementRoutes);

// Resolve directory path using import.meta.url
const __dirname = path.dirname(new URL(import.meta.url).pathname);

// Read SSL certificate and key files
const privateKey = fs.readFileSync('cert/key.pem', 'utf8');
const certificate = fs.readFileSync('cert/cert.pem', 'utf8');

const credentials = { key: privateKey, cert: certificate };

// Create HTTPS server
const httpsServer = https.createServer(credentials, app);

// Start HTTPS server
httpsServer.listen(port, () => {
  console.log('HTTPS Server running on port ' + port);
});
