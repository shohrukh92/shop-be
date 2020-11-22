import Joi, { ObjectSchema, ValidationResult } from "joi";

export interface Product {
  id?: string;
  title: string;
  description: string;
  price: number;
  count: number;
}

export type Validation = null | { errors: string[] };

const MAX_SAFE_PRICE = 99999999.99;
const MAX_SAFE_COUNT = 2147483647;
const MAX_TEXT_LENGTH = 100;

const productSchema: ObjectSchema = Joi.object({
  title: Joi.string().max(MAX_TEXT_LENGTH).required(),
  description: Joi.string().max(MAX_TEXT_LENGTH).required(),
  price: Joi.number().max(MAX_SAFE_PRICE).required(),
  count: Joi.number().integer().min(0).max(MAX_SAFE_COUNT).required(),
});

export const validateProduct = (product: Product): Validation => {
  const validation: ValidationResult = productSchema.validate(product, {
    abortEarly: false,
  });

  if (validation.error) {
    const errors = validation.error.details.map(({ message }) => message);
    return { errors };
  }
  return null;
};
