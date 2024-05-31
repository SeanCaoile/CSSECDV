import express from 'express';
import cors from 'cors';
//import Router from './routes/routes.js';
import userRoutes from './routes/routes.js';
import dotenv from 'dotenv';
dotenv.config();
console.log('host is index in ' + process.env.DB_HOST);

const port = process.env.PORT
const app = express();

app.use(express.json());
app.use(cors());
//app.use(Router);
app.use('/api', userRoutes);


app.listen(port, () => {
  console.log('Server running on port ' + port);
});