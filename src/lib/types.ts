export type Category = 'fish' | 'birds' | 'animals';

export type Rarity = 'Common' | 'Uncommon' | 'Rare' | 'Very Rare';

/** IUCN Red List category codes, plus Data Deficient and Not Evaluated. */
export type Conservation = 'NE' | 'DD' | 'LC' | 'NT' | 'VU' | 'EN' | 'CR';

export interface Photo {
  src: string;
  attribution: string;
  license: string;
  sourceUrl: string;
}

export interface Species {
  id: string;
  category: Category;
  name: string;
  scientificName: string;
  /** How likely a visitor is to encounter it in Kenya. */
  rarity: Rarity;
  conservation: Conservation;
  /** Taxonomic group used for filtering: bird family, or order for fish and animals. */
  group?: string;
  habitats?: string[];
  /** Notable places in Kenya to see it. */
  whereToSee?: string[];
  size?: string;
  diet?: string;
  /** Curated description. Generated species load a Wikipedia summary on demand instead. */
  description?: string;
  funFact?: string;
  endemic?: boolean;
  /** English Wikipedia article title (curated entries; used for bundled photos). */
  wiki?: string;
  /** Research-grade iNaturalist observations in Kenya. */
  observations?: number;
  inatId?: number;
  ebirdCode?: string;
  /** Remote photo (iNaturalist). Bundled curated photos take precedence. */
  photo?: Photo;
  /** Known from Kenya through a field guide only (no Kenyan iNaturalist records yet). */
  fromBook?: boolean;
}

export interface SpeciesImage {
  src: string;
  width: number;
  height: number;
  artist: string;
  license: string;
  sourceUrl: string;
}

export interface Sighting {
  id: string;
  speciesId: string;
  /** ISO date (yyyy-mm-dd). */
  date: string;
  locationName: string;
  lat?: number;
  lng?: number;
  notes?: string;
  createdAt: string;
}

export interface LogExport {
  app: 'kenya-spotter';
  version: 1;
  exportedAt: string;
  sightings: Sighting[];
}

/** Field guide content, extracted locally by scripts/extract-books.py. */
export interface BookSource {
  title: string;
  authors: string;
  edition: string;
}

export interface BookSection {
  heading: string;
  text?: string;
  /** Label/value pairs, e.g. ["Weight", "50–80kg"]. */
  facts?: [string, string][];
}

export interface BookImage {
  src: string;
  width: number;
  height: number;
  caption: string;
  /** The whole plate, when `src` is a crop of it. */
  full?: { src: string; width: number; height: number };
}

export interface BookEntry {
  source: string;
  /** Where it is in the book, e.g. "Plate 22: Waterfowl V". */
  ref: string;
  page: number;
  name: string;
  sections: BookSection[];
  images: BookImage[];
}

export interface BookFacts {
  size?: string;
  rarity?: Rarity;
}

/** One picture in a species' gallery, from any source. */
export interface GalleryItem {
  src: string;
  width?: number;
  height?: number;
  caption?: string;
  credit: string;
  href?: string;
  /** Illustrations (plates) are shown whole rather than cropped to fill. */
  contain?: boolean;
  /** Larger version to open in the viewer, e.g. the whole plate. */
  full?: string;
}
