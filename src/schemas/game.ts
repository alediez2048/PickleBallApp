import { z } from 'zod';
import { SkillLevel, GameStatus } from '@/types/game';

// Create literal union types from our const maps
const skillLevelSchema = z.enum([
  SkillLevel.Beginner,
  SkillLevel.Intermediate,
  SkillLevel.Advanced,
  SkillLevel.Open,
]);

const gameStatusSchema = z.enum([
  GameStatus.Upcoming,
  GameStatus.InProgress,
  GameStatus.Completed,
  GameStatus.Cancelled,
]);

export const locationSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  address: z.string().min(1),
  city: z.string().min(1),
  state: z.string().length(2),
  zipCode: z.string().regex(/^\d{5}(-\d{4})?$/),
  coordinates: z.object({
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
  }),
});

export const userSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(2),
  email: z.string().email(),
  skillLevel: skillLevelSchema,
  rating: z.number().min(0).max(5).optional(),
});

export const baseGameSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(3).max(100),
  date: z.date(),
  location: locationSchema,
  maxPlayers: z.number().int().min(2).max(8),
  currentPlayers: z.number().int().min(1),
  skillLevel: skillLevelSchema,
  price: z.number().min(0),
  host: userSchema,
  status: gameStatusSchema,
});

export const gameSchema = baseGameSchema.refine(
  (data) => data.currentPlayers <= data.maxPlayers,
  {
    message: "Current players cannot exceed maximum players",
    path: ["currentPlayers"],
  }
);

// Create type-safe validation functions
export const validateGame = (data: unknown) => gameSchema.safeParse(data);
export const validateLocation = (data: unknown) => locationSchema.safeParse(data);
export const validateUser = (data: unknown) => userSchema.safeParse(data);

// Partial schemas for updates
export const partialGameSchema = z.object({
  id: z.string().min(1).optional(),
  title: z.string().min(3).max(100).optional(),
  date: z.date().optional(),
  location: locationSchema.optional(),
  maxPlayers: z.number().int().min(2).max(8).optional(),
  currentPlayers: z.number().int().min(1).optional(),
  skillLevel: skillLevelSchema.optional(),
  price: z.number().min(0).optional(),
  host: userSchema.optional(),
  status: gameStatusSchema.optional(),
}).refine(
  (data) => !data.currentPlayers || !data.maxPlayers || data.currentPlayers <= data.maxPlayers,
  {
    message: "Current players cannot exceed maximum players",
    path: ["currentPlayers"],
  }
);

export const partialLocationSchema = z.object({
  id: z.string().min(1).optional(),
  name: z.string().min(1).optional(),
  address: z.string().min(1).optional(),
  city: z.string().min(1).optional(),
  state: z.string().length(2).optional(),
  zipCode: z.string().regex(/^\d{5}(-\d{4})?$/).optional(),
  coordinates: z.object({
    latitude: z.number().min(-90).max(90).optional(),
    longitude: z.number().min(-180).max(180).optional(),
  }).optional(),
});

export const partialUserSchema = z.object({
  id: z.string().min(1).optional(),
  name: z.string().min(2).optional(),
  email: z.string().email().optional(),
  skillLevel: skillLevelSchema.optional(),
  rating: z.number().min(0).max(5).optional(),
});

// Create type-safe validation functions for partial data
export const validatePartialGame = (data: unknown) => partialGameSchema.safeParse(data);
export const validatePartialLocation = (data: unknown) => partialLocationSchema.safeParse(data);
export const validatePartialUser = (data: unknown) => partialUserSchema.safeParse(data); 