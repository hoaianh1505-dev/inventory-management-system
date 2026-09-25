import { Request, Response, NextFunction } from "express";
import {
  sendIndividualMailSchema,
  broadcastMailSchema,
} from "../validations/mail.validation";
import {
  sendIndividualMailService,
  broadcastMailService,
  verifyMailConnectionService,
} from "../services/mail.service";

export const sendIndividualMail = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const validatedInput = sendIndividualMailSchema.parse(req.body);
    const result = await sendIndividualMailService(validatedInput);

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const broadcastMail = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const validatedInput = broadcastMailSchema.parse(req.body);
    const result = await broadcastMailService(validatedInput);

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const testMailConnection = async (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await verifyMailConnectionService();
    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
