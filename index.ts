import e from "express";
import { routesAdmin } from "./Routes/adminRoutes";
import cors from "cors";
import path from "path";
import { routesUser, webHook } from "./Routes/userRoutes";

export const app = e();
export const base_url = "http://localhost:3000";
app.post("/user/webhook", e.raw({ type: "*/*" }), webHook);
app.use(e.json());
app.use(cors({ origin: "*" }));
app.use("/uploads", e.static(path.join(__dirname, "uploads")));

app.use("/user", routesUser);
app.use("/admin", routesAdmin);
