import express from "express";
import cors from "cors";
import { config } from "./config.js";
import { authRouter } from "./routes/auth.js";
import { productsRouter } from "./routes/products.js";
import { servicesRouter } from "./routes/services.js";
import { feedbackRouter } from "./routes/feedback.js";
import { applicationsRouter } from "./routes/applications.js";
import { reviewsRouter } from "./routes/reviews.js";
import { ordersRouter } from "./routes/orders.js";
import { cartRouter } from "./routes/cart.js";
import { webhooksRouter } from "./routes/webhooks.js";
import { salePointsRouter } from "./routes/sale-points.js";
import { filesRouter } from "./routes/files.js";

export function createApp() {
  const app = express();

  app.use(
    cors({
      origin: [config.adminUrl, config.feUrl],
      credentials: true,
    })
  );
  app.use(express.json());

  app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  app.use("/api/auth", authRouter);
  app.use("/api/products", productsRouter);
  app.use("/api/services", servicesRouter);
  app.use("/api/feedback", feedbackRouter);
  app.use("/api/applications", applicationsRouter);
  app.use("/api/reviews", reviewsRouter);
  app.use("/api/sale-points", salePointsRouter);
  app.use("/api/orders", ordersRouter);
  app.use("/api/cart", cartRouter);
  app.use("/api/webhooks", webhooksRouter);
  app.use("/api/files", filesRouter);

  app.use(
    (
      err: Error,
      _req: express.Request,
      res: express.Response,
      _next: express.NextFunction
    ) => {
      console.error(err);
      res.status(500).json({ error: err.message || "Внутренняя ошибка сервера" });
    }
  );

  return app;
}
