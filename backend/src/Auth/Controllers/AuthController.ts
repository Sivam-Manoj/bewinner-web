import { Request, Response, RequestHandler, NextFunction } from "express";
import { loginService } from "../service/loginService";
import { AsyncError, biezor } from "biezor";
import { sendTokensAsCookies } from "../../Utils/token/createTokens";

export const login: RequestHandler = biezor(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { email, password } = req.body;
    if (!email || !password) {
      throw new AsyncError("Email and password are required");
    }
    try {
      const user = await loginService(email, password);
      const { userId, name, email: userEmail, role } = user;
      const token = sendTokensAsCookies(
        res,
        String(userId),
        name,
        userEmail,
        role
      );
      res.status(200).json(token);
    } catch (error: any) {
      next(error);
    }
  }
);
