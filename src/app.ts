require("dotenv").config();
import * as express from "express";
import * as bodyParser from "body-parser";
import { Routes } from "./routes/apiRoutes";
import { ErrorMiddleware } from "./middleware/errorMiddleware";
import * as mongoose from "mongoose";

class App {
  public app: express.Application = express();
  public mongoUrl: string = process.env.MONGO_URL;
  public routeEng: Routes = new Routes();
  public errorMiddleware: ErrorMiddleware = new ErrorMiddleware();

  constructor() {
    this.config();
    this.mongoSetup();
    this.routeEng.routes(this.app);
    this.errorHandler();
  }

  // extend parser functions
  private config(): void {
    this.app.use(bodyParser.json());
    this.app.use(bodyParser.urlencoded({ extended: false }));
  }

  private mongoSetup(): void {
    mongoose.Promise = global.Promise;
    mongoose.connect(this.mongoUrl, { useNewUrlParser: true });
  }

  private errorHandler() {
    this.app.use(this.errorMiddleware.handle);
  }
}

export default new App().app;
