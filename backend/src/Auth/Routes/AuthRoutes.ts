import express from "express";
import { login } from "../Controllers/AuthController";

const router = express.Router();

router.post("/login", login);
export default router;
