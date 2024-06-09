import express from 'express';
import cors from 'cors';
import userRoutes from './routes/routes.js';
import dotenv from 'dotenv';
dotenv.config();

console.log('host is index in ' + process.env.DB_HOST);

const port = process.env.PORT || 3001; // Ensure a default port is provided
const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Routes
app.use('/api', userRoutes);

app.listen(port, () => {
  console.log('Server running on port ' + port);
});
