import { z } from 'zod';
import { baseGameSchema, locationSchema, userSchema, partialGameSchema } from './game';

// Request Schemas
export const createGameRequestSchema = z.object({
  title: baseGameSchema.shape.title,
  date: baseGameSchema.shape.date,
  location: baseGameSchema.shape.location,
  maxPlayers: baseGameSchema.shape.maxPlayers,
  currentPlayers: baseGameSchema.shape.currentPlayers,
  skillLevel: baseGameSchema.shape.skillLevel,
  price: baseGameSchema.shape.price,
  host: baseGameSchema.shape.host,
});

export const updateGameRequestSchema = partialGameSchema;

export const gameFilterSchema = z.object({
  skillLevel: z.string().optional(),
  date: z.string().optional(), // ISO date string
  location: z.string().optional(), // location ID
  status: z.string().optional(),
});

// Response Schemas
export const apiErrorSchema = z.object({
  code: z.number(),
  message: z.string(),
  details: z.record(z.unknown()).optional(),
});

export const paginationSchema = z.object({
  page: z.number().int().min(1),
  limit: z.number().int().min(1),
  total: z.number().int().min(0),
});

export const gameListResponseSchema = z.object({
  data: z.array(baseGameSchema),
  pagination: paginationSchema,
});

export const gameResponseSchema = z.object({
  data: baseGameSchema,
});

export const locationListResponseSchema = z.object({
  data: z.array(locationSchema),
  pagination: paginationSchema,
});

export const locationResponseSchema = z.object({
  data: locationSchema,
});

export const userResponseSchema = z.object({
  data: userSchema,
});

// Type-safe validation functions
export const validateCreateGameRequest = (data: unknown) => createGameRequestSchema.safeParse(data);
export const validateUpdateGameRequest = (data: unknown) => updateGameRequestSchema.safeParse(data);
export const validateGameFilters = (data: unknown) => gameFilterSchema.safeParse(data);

// Response validation functions
export const validateGameListResponse = (data: unknown) => gameListResponseSchema.safeParse(data);
export const validateGameResponse = (data: unknown) => gameResponseSchema.safeParse(data);
export const validateLocationListResponse = (data: unknown) => locationListResponseSchema.safeParse(data);
export const validateLocationResponse = (data: unknown) => locationResponseSchema.safeParse(data);
export const validateUserResponse = (data: unknown) => userResponseSchema.safeParse(data);
export const validateApiError = (data: unknown) => apiErrorSchema.safeParse(data); 