import express from 'express';
import cors from 'cors';
import { join, dirname } from 'path';
import rateLimit from 'express-rate-limit';
import { fileURLToPath } from 'url';
import api from './routes/routes.js';
import dotenv from 'dotenv';

dotenv.config();

const dirnameNew = dirname(fileURLToPath(import.meta.url));
// Create a new express application named 'app'
const app = express();

// Set our backend port to be either an environment variable or port 5000
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// This application level middleware prints incoming requests
// to the servers console, useful to see incoming requests
app.use((req, res, next) => {
  console.log(`Request_Endpoint: ${req.method} ${req.url}`);
  next();
});

// Configure the CORs middleware - might not be needed
// since we host the react front end on the same orign
// app.use(cors());

app.use('/api/v1/', api);
// This middleware informs the express application to serve our compiled React files
if (
  process.env.NODE_ENV === 'production' ||
  process.env.NODE_ENV === 'staging'
) {
  app.use(express.static(join(dirnameNew, '../../client/build')));

  app.get('*', (req, res) => {
    res.sendFile(join(dirnameNew, '../../client/build', 'index.html'));
  });
}

// Catch any bad requests
app.get('*', (req, res) => {
  res.status(200).json({
    msg: 'Catch All',
  });
});

// Configure our server to listen on the port defiend by our port variable
app.listen(port, () => console.log(`BACK_END_SERVICE_PORT: ${port}`));
