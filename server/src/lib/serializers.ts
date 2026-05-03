import { decodeArr } from './json.js';

// Strip password and decode JSON arrays before sending to client.
export function serializeUser<T extends { password?: string }>(user: T): Omit<T, 'password'> {
  const { password: _pw, ...rest } = user;
  return rest as Omit<T, 'password'>;
}

interface ProductLike {
  composition: string;
  careTips: string;
  colors: string;
  flowerTypes: string;
  [key: string]: unknown;
}

export function serializeProduct<T extends ProductLike>(p: T) {
  return {
    ...p,
    composition: decodeArr(p.composition),
    careTips: decodeArr(p.careTips),
    colors: decodeArr(p.colors),
    flowerTypes: decodeArr(p.flowerTypes),
  };
}

interface EventLike {
  contentImages: string;
  [key: string]: unknown;
}

export function serializeEvent<T extends EventLike>(e: T) {
  return { ...e, contentImages: decodeArr(e.contentImages) };
}

interface AboutLike {
  spaceImages: string;
  workshopPhotos: string;
  [key: string]: unknown;
}

export function serializeAbout<T extends AboutLike>(a: T) {
  return {
    ...a,
    spaceImages: decodeArr(a.spaceImages),
    workshopPhotos: decodeArr(a.workshopPhotos),
  };
}
