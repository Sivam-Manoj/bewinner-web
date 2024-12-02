import { Router } from "express";
import { getEmployee } from "../Controller/EmployeeController";
const router = Router();

router.get("/get-all", getEmployee);

export default router;
