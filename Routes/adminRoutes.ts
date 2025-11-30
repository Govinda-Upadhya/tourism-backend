import { Router } from "express";
import {
  createEvent,
  createPackage,
  createVehicle,
  deleteBooking,
  deleteEvent,
  deletePackage,
  deleteVehicle,
  fetchVehicle,
  updateEvent,
  updatePackage,
  updateVehicle,
  viewAllEvent,
  viewAllPackages,
  viewBookings,
  viewEvent,
  viewPackage,
} from "../Controller/adminControl";
import path from "path";
import multer from "multer";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // folder to store uploaded images
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

export const upload = multer({ storage });

export const routesAdmin = Router();

//tour packages routes
routesAdmin.post(
  "/tourpackages/create",
  upload.fields([
    { name: "mainImage", maxCount: 1 },
    { name: "carouselImages", maxCount: 3 },
  ]),
  createPackage
);

routesAdmin.put(
  "/tourpackages/update",
  upload.fields([
    { name: "mainImage", maxCount: 1 },
    { name: "carouselImages", maxCount: 3 },
  ]),
  updatePackage
);
routesAdmin.delete("/tourpackages/delete", deletePackage);
routesAdmin.get("/tourpackages/viewAll", viewAllPackages);
routesAdmin.get("/tourpackages/view", viewPackage);

//upcoming events routes
routesAdmin.post("/events/create", upload.single("mainImage"), createEvent);
routesAdmin.put("/events/update", upload.single("mainImage"), updateEvent);

routesAdmin.delete("/events/delete", deleteEvent);
routesAdmin.get("/events/viewAll", viewAllEvent);
routesAdmin.get("/events/view", viewEvent);

//driver routes
routesAdmin.post("/vehicle/create", upload.single("mainImage"), createVehicle);
routesAdmin.put("/vehicle/update", upload.single("mainImage"), updateVehicle);

routesAdmin.delete("/vehicle/delete", deleteVehicle);
routesAdmin.get("/vehicle/fetch", fetchVehicle);

//bookingroutes
routesAdmin.get("/bookings/viewAll", viewBookings);
routesAdmin.delete("/bookings/delete", deleteBooking);
