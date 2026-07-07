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
import { registerFilesRoute } from "./routes/files.js";
import { checkMinioConnection } from "./services/minio.js";
import { categoriesRouter } from "./routes/categories.js";
import { deliveryZonesRouter } from "./routes/delivery-zones.js";
import { bannersRouter } from "./routes/banners.js";
import { statsRouter } from "./routes/stats.js";
import { wholesaleRouter } from "./routes/wholesale.js";
import { cpRequestsRouter } from "./routes/cp-requests.js";
import { partnerApplicationsRouter } from "./routes/partner-applications.js";
import { newsletterRouter } from "./routes/newsletter.js";

export function createApp() {
  const app = express();

  const allowedOrigins = new Set(
    [config.adminUrl, config.feUrl, "http://localhost:5173", "http://localhost:5174"].filter(
      Boolean
    )
  );

  app.use(
    cors({
      origin(origin, callback) {
        if (!origin || allowedOrigins.has(origin)) {
          callback(null, true);
          return;
        }
        if (
          config.nodeEnv === "development" &&
          /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)
        ) {
          callback(null, true);
          return;
        }
        callback(new Error("CORS not allowed"));
      },
      credentials: true,
    })
  );
  app.use(express.json());

  app.get("/health", async (_req, res) => {
    const minioOk = await checkMinioConnection();
    res.json({ status: "ok", minio: minioOk });
  });

  app.use("/api/auth", authRouter);
  app.use("/api/products", productsRouter);
  app.use("/api/categories", categoriesRouter);
  app.use("/api/services", servicesRouter);
  app.use("/api/feedback", feedbackRouter);
  app.use("/api/applications", applicationsRouter);
  app.use("/api/reviews", reviewsRouter);
  app.use("/api/sale-points", salePointsRouter);
  app.use("/api/delivery-zones", deliveryZonesRouter);
  app.use("/api/orders", ordersRouter);
  app.use("/api/cart", cartRouter);
  app.use("/api/banners", bannersRouter);
  app.use("/api/stats", statsRouter);
  app.use("/api/wholesale", wholesaleRouter);
  app.use("/api/cp-requests", cpRequestsRouter);
  app.use("/api/partner-applications", partnerApplicationsRouter);
  app.use("/api/newsletter", newsletterRouter);
  app.use("/api/webhooks", webhooksRouter);
  registerFilesRoute(app);

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
