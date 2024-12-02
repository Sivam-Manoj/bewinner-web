import { Router } from "express";
import upload from "../../Utils/multer/multer";
import { AddNewOrders } from "../Controllers/orderController";

const router = Router();

router.post("/add", upload.single("file"), AddNewOrders);

export default router;
