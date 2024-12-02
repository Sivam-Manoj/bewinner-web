import { Request, Response } from "express";
import expressAsyncHandler from "express-async-handler";

export const AddNewOrders = expressAsyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    if (req.file) {
      res.status(200).json({
        message: "File received successfully!",
        fileName: req.file.originalname,
        fileSize: req.file.size,
        mimeType: req.file.mimetype,
        fileContent: req.file.buffer.toString("base64"),
      });
    } else {
      res.status(400).json({ message: "No file uploaded" });
    }
  }
);
