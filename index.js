import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import path from 'path';
import helmet from "helmet";
import { fileURLToPath } from 'url';

dotenv.config({ path: './.env' });

import ErrorMiddleware from './middlewares/error.js';
import router from './routes/index.js';

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors({
    credentials: true, origin: process.env.ORIGIN_ONE,
}));

// Upload Files
app.use("/upload", express.static(path.join(__dirname, "upload"), {
  setHeaders: (res, filePath) => {
    res.setHeader("Content-Security-Policy", "frame-ancestors 'self' https://uat.futryo.com");
    // Optional: allow caching, content-type etc.
    res.setHeader("X-Content-Type-Options", "nosniff");
  }
}));
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      frameAncestors: ["'self'", "https://uat.futryo.com"],
      // add more if needed
    },
  })
);
// Welcome Page
app.get("/", (req, resp) => {
    resp.send("<h1>WELCOME TO THE TP API's!</h1>");
});

// Routes
app.use('/v1', router);

//Error Middleware
app.use(ErrorMiddleware);

app.listen(process.env.PORT,
    () => console.warn(`SERVER STARTED : http://localhost:${process.env.PORT}`));
