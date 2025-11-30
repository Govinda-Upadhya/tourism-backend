import e from "express";
import { routesAdmin } from "./Routes/adminRoutes";
import cors from "cors";
import path from "path";
import { routesUser } from "./Routes/userRoutes";

export const app = e();
export const base_url = "http://localhost:3000";
app.use(e.json());
app.use(cors({ origin: "*" }));
app.use("/uploads", e.static(path.join(__dirname, "uploads")));

app.use("/user", routesUser);
app.use("/admin", routesAdmin);
