import e from "express";
import { routesAdmin } from "./Routes/adminRoutes";
import cors from "cors";
import path from "path";
import { routesUser, webHook } from "./Routes/userRoutes";

export const app = e();
export const base_url = "https://tourismbackend.anythingforall.com";
app.post("/user/webhook", e.raw({ type: "application/json" }), webHook);
app.use(e.json());
app.use(cors({ origin: "*" }));
app.use("/uploads", e.static(path.join(__dirname, "uploads")));

app.use("/user", routesUser);
app.use("/admin", routesAdmin);
