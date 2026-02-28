import { ZodSchema } from "zod";

export class SchemaValidationError extends Error {
  constructor(
    message: string,
    public zodError: unknown,
  ) {
    super(message);
    this.name = "SchemaValidationError";
  }
}

export function validateLLMOutput<T>(raw: string, schema: ZodSchema<T>): T {
  const parsed = JSON.parse(raw);
  const result = schema.safeParse(parsed);
  if (!result.success) {
    throw new SchemaValidationError(
      "LLM output failed schema validation",
      result.error,
    );
  }
  return result.data;
}
