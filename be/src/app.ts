import express from "express";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import { config } from "./config.js";
import { createOpenApiDocument } from "./openapi.js";
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
import { categoriesRouter } from "./routes/categories.js";
import { deliveryZonesRouter } from "./routes/delivery-zones.js";
import { bannersRouter } from "./routes/banners.js";
import { statsRouter } from "./routes/stats.js";
import { wholesaleRouter } from "./routes/wholesale.js";
import { cpRequestsRouter } from "./routes/cp-requests.js";
import { partnerApplicationsRouter } from "./routes/partner-applications.js";

export function createApp() {
  const app = express();

  app.use(
    cors({
      origin: [config.adminUrl, config.feUrl],
      credentials: true,
    })
  );
  app.use(express.json());

  app.use(express.json());

  app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  const openApiDocument = createOpenApiDocument(config.apiUrl);
  app.get("/docs/openapi.json", (_req, res) => {
    res.json(openApiDocument);
  });
  app.use("/docs", swaggerUi.serve, swaggerUi.setup(openApiDocument));
  app.get("/", (_req, res) => {
    res.redirect("/docs");
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
