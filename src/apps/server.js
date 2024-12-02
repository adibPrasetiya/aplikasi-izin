import express from "express";
import cors from "cors";
import { corsOptions } from "../conf/cors-config.js";
import bodyParser from "body-parser";
import { errorMiddleware } from "../middlewares/error-middleware.js";
import { protectedRoutes } from "../routes/protected-routes.js";
import { publicRoutes } from "../routes/public-routes.js";
import { authenticationMiddleware } from "../middlewares/authectication-middleware.js";

export const app = express();

app.use(cors(corsOptions));

app.options("*", cors(corsOptions));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

app.use(publicRoutes);
app.use(authenticationMiddleware);
app.use(protectedRoutes);
// error middleware selalu ditaruh dipaling akhir
app.use(errorMiddleware);
