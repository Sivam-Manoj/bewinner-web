import { biezor } from "biezor";
import { getEmployees } from "../Service/getEmployees";
import { Request, Response } from "express";

export const addNewEmployee = biezor(async (req, res) => {});

export const getEmployee = biezor(async (req: Request, res: Response) => {
  try {
    await getEmployees(req, res);
  } catch (error: any) {
    throw new Error(error.message);
  }
});
