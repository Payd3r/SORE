import { ImageType } from '../types/db';

const RANDOM_TYPES: ImageType[] = [
  ImageType.LANDSCAPE,
  ImageType.SINGLE,
  ImageType.COUPLE,
  ImageType.FOOD
];

export async function classifyImage(_buffer: Buffer): Promise<ImageType> {
  const index = Math.floor(Math.random() * RANDOM_TYPES.length);
  return RANDOM_TYPES[index];
}