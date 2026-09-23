import { Request, Response, NextFunction } from "express";
import { chatMessageSchema } from "../validations/ai-assistant.validation";
import {
  chatWithAiService,
  getAiSuggestionsService,
} from "../services/ai-assistant.service";

export const chatWithAi = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const validatedInput = chatMessageSchema.parse(req.body);
    const result = await chatWithAiService(validatedInput);
    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getAiSuggestions = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await getAiSuggestionsService();
    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
