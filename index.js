import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import helmet from 'helmet';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

import ErrorMiddleware from './middlewares/error.js';
import router from './routes/index.js';
import getOrigins from './utils/origins.js';


const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// ADD MANUAL & ALL COLLEGES ORIGINS
const configCors = async () => {
    const origin = [process.env.ENV === 'DEV' && 'http://localhost:5174', process.env.ORIGIN_ONE];
    const college_origins = await getOrigins();
    college_origins?.forEach((item) => {
        origin.push(item);
    });

    app.use(cors({
        credentials: true, origin, methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
        allowedHeaders: ["platform", "content-type", "Authorization", "x-api-key", "x-refresh-token"]
    }));
};
configCors();

// UPLOAD FILES
app.use("/uploads", express.static(path.join(__dirname, "uploads"), {
    setHeaders: (resp, file_path) => {
        resp.setHeader("Content-Security-Policy", `frame-ancestors 'self' ${process.env.ORIGIN_ONE}`);
        resp.setHeader("X-Content-Type-Options", "nosniff");
    }
}));
app.use(helmet.contentSecurityPolicy({
    directives: {
        defaultSrc: ["'self'"], frameAncestors: ["'self'", process.env.ORIGIN_ONE],
    },
}));


app.get('/', (req, resp, next) => {
    resp.status(200).send('<h1>APP STARTED!</h1>');
});

// ROUTES
app.use('/v1', router);


app.listen(process.env.PORT, () =>
    console.warn('SERVER STARTED: http://localhost:' + process.env.PORT));

app.use(ErrorMiddleware);
