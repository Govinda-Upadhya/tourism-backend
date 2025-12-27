import type { Request, Response } from "express";
import { prismaClient } from "../lib";
import { start } from "repl";
import { base_url } from "..";
import fs from "fs";
import path from "path";
import { error } from "console";

//tour packages route handlers (CRUD)
export const createPackage = async (req: Request, res: Response) => {
  try {
    // Access text fields
    let {
      name,
      category,
      price,
      vehicleId,
      description,
      highlights,
      included,
    } = req.body;
    console.log("vehicle", vehicleId);
    const vehicle = await prismaClient.vehicles.findFirst({
      where: { id: vehicleId },
    });
    highlights = highlights.split(",");
    included = included.split(",");
    description = description.split(",");

    // Access uploaded files
    const files = req.files as {
      [fieldname: string]: Express.Multer.File[];
    };

    const mainImage = files?.mainImage?.[0]?.filename || null;
    const carouselImages =
      files?.carouselImages?.map((file) => file.filename) || [];

    // Construct image URLs (so frontend can access them)
    const mainImageUrl = mainImage ? `/uploads/${mainImage}` : null;
    const carouselImageUrls = carouselImages.map((img) => `/uploads/${img}`);

    // Save in DB
    const clientRes = await prismaClient.tourPackages.create({
      data: {
        name,
        category,
        price: Number(price),
        description,
        highlights,
        included,

        mainImage: mainImageUrl!,
        carousel: carouselImageUrls,
      },
    });
    await prismaClient.tourPackageVehicle.create({
      data: {
        tourPackage: {
          connect: { id: clientRes.id }, // existing tour package ID
        },
        vehicle: {
          connect: { id: vehicleId }, // must be a valid existing vehicle ID
        },
        note: "vehicle assigned",
        status: "ACTIVE",
      },
    });

    console.log("tour created");
    return res.json({
      msg: "Tour package created successfully",
      package: clientRes,
    });
  } catch (error) {
    console.error("Error creating package:", error);
    return res.status(500).json({ msg: "Error occurred", error });
  }
};

export const updatePackage = async (req: Request, res: Response) => {
  try {
    let {
      id,
      name,
      category,
      price,
      carouselImagesUrl,
      mainUrl,
      description,
      highlights,
      included,
    } = req.body;

    // ---------- Normalize text fields ----------
    description = description?.split(",") || [];
    highlights = highlights?.split(",") || [];
    included = included?.split(",") || [];

    // ---------- Normalize carouselImagesUrl ----------
    if (!carouselImagesUrl) {
      carouselImagesUrl = [];
    }

    if (typeof carouselImagesUrl === "string") {
      carouselImagesUrl = [carouselImagesUrl];
    }

    // Remove base_url from existing image URLs
    carouselImagesUrl = carouselImagesUrl.map((img: string) =>
      img.replace(base_url, "")
    );

    // ---------- Files ----------
    const files = req.files as {
      [fieldname: string]: Express.Multer.File[];
    };

    const mainImageFile = files?.mainImage?.[0]?.filename || null;
    const carouselFiles =
      files?.carouselImages?.map((file) => file.filename) || [];

    // ---------- Main image ----------
    let mainImageUrl = mainImageFile
      ? `/uploads/${mainImageFile}`
      : mainUrl
      ? mainUrl.replace(base_url, "")
      : null;

    // ---------- Carousel images ----------
    const newCarouselImages = carouselFiles.map((img) => `/uploads/${img}`);

    const finalCarouselImages = [...newCarouselImages, ...carouselImagesUrl];

    // ---------- Fetch existing package ----------
    const tourPackage = await prismaClient.tourPackages.findUnique({
      where: { id },
    });

    if (!tourPackage) {
      return res.status(404).json({ msg: "Tour package not found" });
    }

    // ---------- Delete removed images ----------
    const existingImages = tourPackage.carousel || [];

    for (const img of existingImages) {
      if (!finalCarouselImages.includes(img)) {
        const oldPath = path.join(__dirname, "..", img);
        fs.unlink(oldPath, (err) => {
          if (err) console.log("Old image not found:", err.message);
        });
      }
    }

    // ---------- Update DB ----------
    await prismaClient.tourPackages.update({
      where: { id },
      data: {
        name,
        category,
        price: parseInt(price),
        description,
        highlights,
        included,
        mainImage: mainImageUrl!,
        carousel: finalCarouselImages,
      },
    });

    return res.json({ msg: "Tour package updated successfully" });
  } catch (error) {
    console.error("Update package error:", error);
    return res.status(500).json({ msg: "Error occurred", error });
  }
};

export const deletePackage = async (req: Request, res: Response) => {
  let { id } = req.body;
  console.log("package id to delete", id);
  try {
    const tourPackage = await prismaClient.tourPackages.findFirst({
      where: { id: id },
    });
    if (!tourPackage) {
      return res.json({ msg: "cannot find the package" });
    }
    const filePath = path.join(__dirname, "..", tourPackage.mainImage!);
    fs.unlink(filePath, (err) => {
      if (err) console.log("Old image not found:", err);
    });
    for (const image of tourPackage.carousel) {
      const oldPath = path.join(__dirname, "..", image);
      fs.unlink(oldPath, (err) => {
        if (err) console.log("Old image not found:", err);
      });
    }
    const clientRes = await prismaClient.tourPackages.delete({
      where: { id: id },
    });
    return res.json({ msg: "Tour package deleted successfully" });
  } catch (error) {
    console.log("error", error);
    return res.status(400).json({ msg: "error occured", err: error });
  }
};
export const viewAllPackages = async (req: Request, res: Response) => {
  try {
    const clientRes = await prismaClient.tourPackages.findMany({
      include: {
        vehicleAssignments: {
          include: {
            vehicle: {
              select: {
                name: true, // vehicle name
                contact: true, // driver contact or driver name (depending on your meaning)
              },
            },
          },
        },
      },
    });
    console.log(clientRes);
    return res.json({ msg: "All the tour packages", packages: clientRes });
  } catch (error) {
    console.log("error", error);
    return res.json({ msg: "error occured", err: error });
  }
};
export const viewPackage = async (req: Request, res: Response) => {
  let { id } = req.body;

  try {
    const clientRes = await prismaClient.tourPackages.findFirst({
      where: { id: id },
      include: {
        vehicleAssignments: {
          include: {
            vehicle: true, // fetch full vehicle info
          },
        },
      },
    });
    console.log(clientRes);
    return res.json({
      msg: "Details of the requested package",
      package: clientRes,
    });
  } catch (error) {
    console.log("error", error);
    return res.json({ msg: "error occured", err: error });
  }
};

//upcoming events route handlers

export const createEvent = async (req: Request, res: Response) => {
  let {
    title,
    price,
    maxPeople,
    date,
    availability,
    location,
    vehicle,
    description,
    highlights,
    includes,
  } = req.body;

  try {
    // Multer stores the uploaded file in req.file
    const imageFile = req.file?.filename;
    const imageUrl = imageFile ? `/uploads/${imageFile}` : null;
    description = description.split(",");
    highlights = highlights.split(",");
    includes = includes.split(",");

    const clientRes = await prismaClient.events.create({
      data: {
        name: title,
        image: imageUrl!,
        maxpeople: parseInt(maxPeople),
        price: parseInt(price),
        date,
        location,
        description,
        vehicle,
        includes,
        highlights,
        availability: availability,
      },
    });

    return res.json({
      msg: "Created the event successfully",
      event: clientRes,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ msg: "Cannot create an event" });
  }
};

export const updateEvent = async (req: Request, res: Response) => {
  let {
    id,
    title,
    price,
    maxPeople,
    date,
    availability,
    location,
    vehicle,
    description,
    highlights,
    includes,
    eventImageUrl,
  } = req.body;

  try {
    description = description.split(",");
    highlights = highlights.split(",");
    includes = includes.split(",");
    const eventMain = await prismaClient.events.findFirst({ where: { id } });
    if (!eventMain) {
      return res.json({ msg: "no such events" });
    }
    const imageFile = req.file?.filename;
    let imageUrl = imageFile ? `/uploads/${imageFile}` : undefined;
    if (imageUrl != undefined) {
      const existingImage = eventMain.image;
      const oldPath = path.join(__dirname, "..", existingImage!);
      fs.unlink(oldPath, (err) => {
        if (err) console.log("Old image not found:", err);
      });
    }
    if (imageUrl == undefined) {
      imageUrl = eventImageUrl;
    }
    const clientRes = await prismaClient.events.update({
      where: { id },
      data: {
        name: title,
        image: imageUrl,
        maxpeople: parseInt(maxPeople),
        price: parseInt(price),
        date,
        location,
        description,
        vehicle,
        includes,
        highlights,
        availability: availability,
      },
    });
    return res.json({
      msg: "Updated the event successfully",
      id: clientRes.id,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ msg: "Couldn't update the event." });
  }
};
export const deleteEvent = async (req: Request, res: Response) => {
  const { id } = req.body;
  try {
    const event = await prismaClient.events.findFirst({ where: { id } });
    if (!event) {
      return res.json({ msg: "event not found" });
    }
    const oldPath = path.join(__dirname, "..", event.image);
    fs.unlink(oldPath, (err) => {
      if (err) console.log("Old image not found:", err);
    });
    const clientRes = await prismaClient.events.delete({ where: { id } });
    return res.json({
      msg: "deleted the event successfully",
      id: clientRes.id,
    });
  } catch (error) {
    console.log(error);
    return res.json({ msg: "cannot delete an event" });
  }
};
export const viewEvent = async (req: Request, res: Response) => {
  const { id } = req.body;
  try {
    const clientRes = await prismaClient.events.findFirst({ where: { id } });
    return res.json({
      msg: "Details of the requested event",
      event: clientRes,
    });
  } catch (error) {
    console.log(error);
    return res.json({ msg: "couldnt find the event" });
  }
};
export const viewAllEvent = async (req: Request, res: Response) => {
  try {
    const clientRes = await prismaClient.events.findMany({});
    return res.json({
      msg: "Details of all the events",
      event: clientRes,
    });
  } catch (error) {
    console.log(error);
    return res.json({ msg: "some error occured while finding the events" });
  }
};

export const createVehicle = async (req: Request, res: Response) => {
  let { name, contact, vehicle_type } = req.body;
  let image = req.file?.filename;
  let imageUrl = image ? `/uploads/${image}` : undefined;
  const clientres = await prismaClient.vehicles.create({
    data: {
      name,
      contact,
      image: imageUrl!,
      vehicle_type,
    },
  });
  if (clientres) {
    return res.json({ msg: "vehcile created sucessfully" });
  } else {
    return res.status(500).json("couldnt create the vehciles");
  }
};
export const fetchVehicle = async (req: Request, res: Response) => {
  const vehicles = await prismaClient.vehicles.findMany({});
  return res.json({ vehicles });
};
export const updateVehicle = async (req: Request, res: Response) => {
  let { id, name, contact, vehicle_type, vehicleImageUrl } = req.body;
  let image = req.file?.filename;
  let imageUrl = image ? `/uploads/${image}` : undefined;
  const vehicle = await prismaClient.vehicles.findFirst({ where: { id } });
  if (!vehicle) {
    return res.json({ msg: "no vehicles" });
  }
  if (imageUrl != undefined) {
    const oldPath = path.join(__dirname, "..", vehicle.image);
    fs.unlink(oldPath, (err) => {
      if (err) console.log("Old image not found:", err);
    });
  }
  if (imageUrl == undefined) {
    imageUrl = vehicleImageUrl;
  }
  const updateVehicle = await prismaClient.vehicles.update({
    where: { id },
    data: {
      name,
      contact,
      vehicle_type,
      image: imageUrl,
    },
  });
  if (updateVehicle) {
    return res.json({ msg: "updated successfully" });
  } else {
    return res.status(500).json({ msg: "couldnt update the vehicle" });
  }
};
export const deleteVehicle = async (req: Request, res: Response) => {
  const { id } = req.body;
  const vehicle = await prismaClient.vehicles.findFirst({ where: { id } });
  if (!vehicle) {
    return res.json({ msg: "no vehicles" });
  }

  const oldPath = path.join(__dirname, "..", vehicle.image);
  fs.unlink(oldPath, (err) => {
    if (err) console.log("Old image not found:", err);
  });
  await prismaClient.vehicles.delete({ where: { id } });
  return res.json({ msg: "deleted successfully" });
};

export const viewBookings = async (req: Request, res: Response) => {
  const bookings = await prismaClient.bookings.findMany({});
  return res.json({ bookings });
};
export const deleteBooking = async (req: Request, res: Response) => {
  const { id } = req.body;
  const booking = await prismaClient.bookings.findFirst({ where: { id } });
  if (!booking) {
    return res.status(404).json({ msg: "no bookings" });
  }
  await prismaClient.bookings.delete({ where: { id } });
  return res.status(200).json({ msg: "deleted successfully" });
};
