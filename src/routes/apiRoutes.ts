import { Request, Response, NextFunction } from "express";
import { AuthMiddleware } from "../middleware/authMiddleware";
import { AclMiddleware } from "../middleware/aclMiddleware";
import { ValidateObjectIdMiddleware } from "../middleware/validateMiddleware";
import { UserController } from "../controllers/userController";
import { CustomerController } from "../controllers/customerController";
import { TicketController } from "../controllers/ticketController";
import { CommentController } from "../controllers/commentController";

export class Routes {
  public authMiddleware: AuthMiddleware = new AuthMiddleware();
  public aclMiddleware: AclMiddleware = new AclMiddleware();
  public objectIdMiddleware: ValidateObjectIdMiddleware = new ValidateObjectIdMiddleware();
  public userController: UserController = new UserController();
  public customerController: CustomerController = new CustomerController();
  public ticketController: TicketController = new TicketController();
  public commentController: CommentController = new CommentController();

  public routes(app): void {
    app.route("/").get((req: Request, res: Response) => {
      res.status(200).send({
        message: "Fliqpay app (v4.17.1)",
      });
    });

    /** -- User Authentication Endpoint -- */

    app.route("/api/login").post(this.userController.login);

    app
      .route("/api/user/me")
      .get(this.authMiddleware.handle, this.userController.getUser);

    /** -- User (Admin/Agent) Endpoints -- */

    app
      .route("/api/user")
      .get(
        [this.authMiddleware.handle, this.aclMiddleware.handle],
        this.userController.getAllUser
      )
      .post(
        [this.authMiddleware.handle, this.aclMiddleware.handle],
        this.userController.createUser
      );

    app
      .route("/api/customer")
      .get(
        [this.authMiddleware.handle, this.aclMiddleware.handle],
        this.customerController.getCustomers
      )
      .post(
        [this.authMiddleware.handle, this.aclMiddleware.handle],
        this.customerController.registerNewCustomer
      );

    app
      .route("/api/ticket")
      .get(this.authMiddleware.handle, this.ticketController.getTickets);

    app
      .route("/api/ticket/:id/")
      .get(
        [this.authMiddleware.handle, this.objectIdMiddleware.handle],
        this.ticketController.getTicket
      );

    app
      .route("/api/report/ticket")
      .get(
        this.authMiddleware.handle,
        this.ticketController.getTicketsClosedInLastOneMonth
      );

    app
      .route("/api/ticket/close/:id")
      .post(
        [this.authMiddleware.handle, this.objectIdMiddleware.handle],
        this.ticketController.closeTicket
      );

    app
      .route("/api/ticket/comment/user")
      .post(this.authMiddleware.handle, this.commentController.addUserComment);

    app
      .route("/api/comments")
      .get(
        [this.authMiddleware.handle, this.aclMiddleware.handle],
        this.commentController.getComments
      );

    /** -- Customer Endpoints -- */

    app.route("/api/ticket/create").post(this.ticketController.createTicket);

    app
      .route("/api/ticket/previous")
      .post(this.ticketController.getCustomerPreviousTicketStatus);

    app
      .route("/api/ticket/comment/customer")
      .post(this.commentController.addCustomerComment);

    app
      .route("/api/ticket/withcomments/:id")
      .get(
        this.objectIdMiddleware.handle,
        this.ticketController.getTicketWithComments
      );

    /** Invalid Routes */

    app.route("*").get((req: Request, res: Response) => {
      res.status(404).send({
        status: false,
        message: "Page not found",
      });
    });
  }
}
