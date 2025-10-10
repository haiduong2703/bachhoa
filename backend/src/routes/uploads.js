import express from "express";
import uploadService from "../services/uploadService.js";
import { ProductImage } from "../models/index.js";
import { authenticate } from "../middlewares/auth.js";
import { catchAsync } from "../utils/errors.js";

const router = express.Router();

// Upload single image
router.post(
  "/image",
  authenticate,
  uploadService.createUploadMiddleware({
    subfolder: "products",
    maxFiles: 1,
    fieldName: "file",
  }),
  catchAsync(async (req, res) => {
    console.log("📸 Upload request received");
    console.log("File:", req.file);
    console.log("Body:", req.body);

    if (!req.file) {
      console.log("❌ No file in request");
      return res.status(400).json({
        status: "error",
        message: "No file uploaded",
      });
    }

    const type = req.body.type || "product";
    console.log(`📦 Upload type: ${type}`);
    let result;

    if (type === "product") {
      console.log("🔄 Processing product image...");
      result = await uploadService.uploadProductImage(req.file);
      console.log("✅ Image processed:", JSON.stringify(result, null, 2));

      // Prepare data for database
      const imageData = {
        imageUrl: result.variants.medium.url,
        thumbnailUrl: result.variants.thumbnail.url,
        altText: req.body.altText || "",
        isPrimary: false,
      };
      console.log("📝 Data to save:", JSON.stringify(imageData, null, 2));

      // Save to database
      let productImage;
      try {
        productImage = await ProductImage.create(imageData);
        console.log("💾 Saved to database, ID:", productImage.id);
      } catch (dbError) {
        console.error("❌ Database save failed:", dbError.message);
        console.error("Original error:", dbError.original?.message);
        console.error("SQL:", dbError.original?.sql);
        throw dbError;
      }

      res.json({
        status: "success",
        message: "Image uploaded successfully",
        data: {
          id: productImage.id,
          url: result.variants.medium.url,
          thumbnailUrl: result.variants.thumbnail.url,
          variants: result.variants,
        },
      });
    } else if (type === "category") {
      console.log("🔄 Processing category image...");
      result = await uploadService.uploadCategoryImage(req.file);
      console.log("✅ Image processed:", JSON.stringify(result, null, 2));

      // For category, just return the medium variant URL
      res.json({
        status: "success",
        message: "Category image uploaded successfully",
        data: {
          url: result.variants.medium.url,
          thumbnailUrl: result.variants.thumbnail.url,
          variants: result.variants,
        },
      });
    } else {
      // For other types, just return the file path
      const url = `/uploads/${type}s/${req.file.filename}`;
      console.log("📁 File saved at:", url);
      res.json({
        status: "success",
        message: "File uploaded successfully",
        data: { url },
      });
    }
  })
);

// Upload multiple images
router.post(
  "/images",
  authenticate,
  uploadService.createUploadMiddleware({
    subfolder: "products",
    maxFiles: 10,
    fieldName: "files",
  }),
  catchAsync(async (req, res) => {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        status: "error",
        message: "No files uploaded",
      });
    }

    const type = req.body.type || "product";
    const uploadResults = [];

    if (type === "product") {
      for (const file of req.files) {
        const result = await uploadService.uploadProductImage(file);

        // Save to database
        const productImage = await ProductImage.create({
          imageUrl: result.variants.medium.url,
          thumbnailUrl: result.variants.thumbnail.url,
          altText: "",
          isPrimary: false,
        });

        uploadResults.push({
          id: productImage.id,
          url: result.variants.medium.url,
          thumbnailUrl: result.variants.thumbnail.url,
        });
      }
    } else {
      for (const file of req.files) {
        const url = `/uploads/${type}s/${file.filename}`;
        uploadResults.push({ url });
      }
    }

    res.json({
      status: "success",
      message: `${uploadResults.length} images uploaded successfully`,
      data: { images: uploadResults },
    });
  })
);

// Delete image
router.delete(
  "/image",
  authenticate,
  catchAsync(async (req, res) => {
    const { imagePath, imageId } = req.body;

    if (imageId) {
      // Delete from database
      const productImage = await ProductImage.findByPk(imageId);
      if (productImage) {
        await productImage.destroy();
      }
    }

    if (imagePath) {
      await uploadService.deleteFile(imagePath);
    }

    res.json({
      status: "success",
      message: "Image deleted successfully",
    });
  })
);

export default router;
