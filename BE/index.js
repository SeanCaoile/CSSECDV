import express from 'express';
import cors from 'cors';
import userRoutes from './routes/routes.js';
import blogRoutes from './routes/blogRoutes.js';
import dotenv from 'dotenv';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';

dotenv.config();

console.log('host is index in ' + process.env.DB_HOST);

const port = process.env.PORT;
const app = express();

// app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: 'http://localhost:5173', // Allow only this origin (for FE)
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

app.listen(port, () => {
  console.log('Server running on port ' + port);
});
