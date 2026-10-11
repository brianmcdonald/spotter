/**
 * Hand-written species entries. These are layered over the generated
 * iNaturalist/eBird data (matched by scientific name) to supply richer text —
 * descriptions, fun facts, habitats, size, diet — and keep stable ids.
 */
import type { Species } from '../types';
import { fish } from './fish.ts';
import { birds } from './birds.ts';
import { animals } from './animals.ts';

export const curated: Species[] = [...fish, ...birds, ...animals];
