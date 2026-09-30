import cors from "cors";
import express, { Application } from "express";
import db from "../db_connection";
import { corsOptions } from "../../config/corsOptions";
import "./models_associations";
import { config } from "../../config/app.config";
import { errorHandler } from "../../middlewares/errorHandler";
import { routes } from "../../centralizations/routes";
import {
  authenticateJWT,
  setupJwtStrategy,
} from "../../common/strategies/jwt.strategy";
import passport from "passport";
import cookieParser from "cookie-parser";

class Server {
  private app: Application;
  private port: string;

  private apiPaths = {
    auth: "/auth",
    mfa: "/mfa",
    session: "/session",
    company_sizes: "/company-sizes",
    s3Files: "/s3Files",
    players: "/players",
  };

  constructor(connectDatabase: boolean = true) {
    this.app = express();
    this.port = config.PORT;

    this.app.set("trust proxy", 1);

    // Database connection
    if (connectDatabase) {
      this.dbConnection();
    }

    // Middlewares
    this.app.use(cors(corsOptions));
    this.app.options("*", cors(corsOptions));

    this.app.use(express.json({ limit: "10mb" }));
    this.app.use(express.urlencoded({ extended: true }));

    this.app.use(express.static("public"));

    // Agrega cookie-parser antes de passport
    this.app.use(cookieParser());

    // Passport
    this.app.use(passport.initialize());
    setupJwtStrategy(passport);

    // Health check
    this.app.get("/health", (_req, res) => {
      res.status(200).json({
        status: "ok",
        service: "vaqueros-backend",
      });
    });

    // Routes
    this.routes();

    // Error handler LETS SEE IF WORKS
    this.app.use(errorHandler);
  }

  async dbConnection() {
    try {
      await db.authenticate();
      console.log("Database connected");
    } catch (error: any) {
      throw new Error(error);
    }
  }

  routes() {
    // Public routes
    this.app.use(this.apiPaths.auth, routes.authRoutes);
    this.app.use(this.apiPaths.mfa, routes.mfaRoutes);

    // Private routes
    this.app.use(this.apiPaths.session, authenticateJWT, routes.sessionRoutes);

    this.app.use(this.apiPaths.players, authenticateJWT, routes.playerRoutes);

    this.app.use(this.apiPaths.s3Files, authenticateJWT, routes.s3FilesRoutes);
  }

  listen() {
    this.app.listen(this.port, () => {
      console.log(`Backend server is running on port ${this.port}`);
    });
  }

  getApp() {
    return this.app;
  }
}

export default Server;
