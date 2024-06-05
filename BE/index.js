import express from 'express';
import cors from 'cors';
import userRoutes from './routes/routes.js';
import dotenv from 'dotenv';
import helmet from 'helmet'; 

dotenv.config();
console.log('host is index in ' + process.env.DB_HOST);

const port = process.env.PORT
const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors({
  origin: 'http://localhost:5173', // Allow only this origin
  credentials: true
}));

// Use helmet with CSP
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
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


app.listen(port, () => {
  console.log('Server running on port ' + port);
});