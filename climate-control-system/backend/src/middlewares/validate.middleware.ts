import { NextFunction, Request, Response } from "express";
import { ZodTypeAny } from "zod";

export function validate(schema: ZodTypeAny) {
  return (req: Request, res: Response, next: NextFunction) => {
    const parsed = schema.safeParse({
      body: req.body,
      params: req.params,
      query: req.query
    });

    if (!parsed.success) {
      return res.status(400).json({
        message: "Validation failed",
        details: parsed.error.flatten()
      });
    }

    next();
  };
}
