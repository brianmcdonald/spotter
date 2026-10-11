import type { Species } from '../types';

export const fish: Species[] = [
  {
    id: 'whale-shark',
    category: 'fish',
    name: 'Whale Shark',
    scientificName: 'Rhincodon typus',
    rarity: 'Rare',
    conservation: 'EN',
    habitats: ['Open Ocean', 'Coral Reef'],
    whereToSee: ['Diani-Chale', 'Watamu', 'Kisite-Mpunguti Marine Park'],
    size: 'Up to 12 m',
    diet: 'Plankton, krill and small fish (filter feeder)',
    description:
      'The largest fish in the world, recognisable by its checkerboard of pale spots and stripes. Despite its size it is a gentle filter feeder and seasonally visits the Kenyan south coast between October and March.',
    funFact: 'Each whale shark\'s spot pattern is unique, like a fingerprint, and researchers use photos to identify individuals.',
    wiki: 'Whale shark'
  },
  {
    id: 'coelacanth',
    category: 'fish',
    name: 'West Indian Ocean Coelacanth',
    scientificName: 'Latimeria chalumnae',
    rarity: 'Very Rare',
    conservation: 'CR',
    habitats: ['Deep Sea'],
    whereToSee: ['Deep waters off Malindi'],
    size: 'Up to 2 m',
    diet: 'Fish, squid and cuttlefish',
    description:
      'A "living fossil" once thought extinct for 66 million years. Coelacanths live in deep, rocky drop-offs and caves; one was netted off Malindi in 2001, confirming the species in Kenyan waters.',
    funFact: 'Its fleshy, lobed fins move in a pattern similar to the legs of a walking animal.',
    wiki: 'West Indian Ocean coelacanth'
  },
  {
    id: 'humphead-wrasse',
    category: 'fish',
    name: 'Humphead Wrasse',
    scientificName: 'Cheilinus undulatus',
    rarity: 'Rare',
    conservation: 'EN',
    habitats: ['Coral Reef'],
    whereToSee: ['Watamu Marine Park', 'Malindi Marine Park', 'Kisite-Mpunguti Marine Park'],
    size: 'Up to 2 m',
    diet: 'Molluscs, crustaceans, sea urchins and crown-of-thorns starfish',
    description:
      'Also called the Napoleon wrasse, this huge reef fish has thick lips and a prominent bulge on its forehead. It is long-lived and slow to reproduce, making it vulnerable to overfishing.',
    funFact: 'It is one of the few predators of the toxic crown-of-thorns starfish, helping protect coral reefs.',
    wiki: 'Humphead wrasse'
  },
  {
    id: 'scalloped-hammerhead',
    category: 'fish',
    name: 'Scalloped Hammerhead',
    scientificName: 'Sphyrna lewini',
    rarity: 'Very Rare',
    conservation: 'CR',
    habitats: ['Open Ocean', 'Coral Reef'],
    whereToSee: ['Offshore banks near Shimoni', 'Pemba Channel'],
    size: 'Up to 4 m',
    diet: 'Fish, squid and rays',
    description:
      'A schooling shark with a broad, flattened head whose front edge is scalloped. Populations have collapsed globally because of fishing for fins.',
    funFact: 'The wide-set eyes and sensory pores on its "hammer" give it excellent vision and electroreception.',
    wiki: 'Scalloped hammerhead'
  },
  {
    id: 'reef-manta',
    category: 'fish',
    name: 'Reef Manta Ray',
    scientificName: 'Mobula alfredi',
    rarity: 'Rare',
    conservation: 'VU',
    habitats: ['Coral Reef', 'Open Ocean'],
    whereToSee: ['Pemba Channel', 'Watamu'],
    size: 'Wingspan up to 5 m',
    diet: 'Zooplankton',
    description:
      'A graceful ray that "flies" through the water with its huge pectoral fins, often visiting cleaning stations on reefs where small fish remove parasites.',
    funFact: 'Manta rays have one of the largest brain-to-body ratios of any fish.',
    wiki: 'Reef manta ray'
  },
  {
    id: 'sailfish',
    category: 'fish',
    name: 'Indo-Pacific Sailfish',
    scientificName: 'Istiophorus platypterus',
    rarity: 'Uncommon',
    conservation: 'VU',
    habitats: ['Open Ocean'],
    whereToSee: ['Malindi', 'Watamu', 'Kilifi'],
    size: 'Up to 3.4 m',
    diet: 'Sardines, mackerel, squid',
    description:
      'Famous for its towering, sail-like dorsal fin, which it raises to herd schools of baitfish. Malindi and Watamu are renowned for sailfish between November and March.',
    funFact: 'Sailfish are among the fastest fish in the ocean and can change colour when excited.',
    wiki: 'Indo-Pacific sailfish'
  },
  {
    id: 'giant-trevally',
    category: 'fish',
    name: 'Giant Trevally',
    scientificName: 'Caranx ignobilis',
    rarity: 'Uncommon',
    conservation: 'LC',
    habitats: ['Coral Reef', 'Open Ocean'],
    whereToSee: ['Watamu', 'Lamu', 'Diani'],
    size: 'Up to 1.7 m',
    diet: 'Fish, crustaceans and cephalopods',
    description:
      'A powerful, silvery apex predator of reefs and lagoons. Adults often hunt alone and are prized by sport fishermen.',
    funFact: 'In some places they have been filmed leaping out of the water to catch seabirds.',
    wiki: 'Giant trevally'
  },
  {
    id: 'giant-grouper',
    category: 'fish',
    name: 'Giant Grouper',
    scientificName: 'Epinephelus lanceolatus',
    rarity: 'Rare',
    conservation: 'VU',
    habitats: ['Coral Reef', 'Mangrove & Estuary'],
    whereToSee: ['Kisite-Mpunguti Marine Park', 'Mombasa Marine Park'],
    size: 'Up to 2.7 m',
    diet: 'Fish, spiny lobsters, small sharks and turtles',
    description:
      'The largest bony fish found on coral reefs, with a mottled grey-brown body. It lurks in caves and wrecks and swallows prey whole.',
    wiki: 'Giant grouper'
  },
  {
    id: 'allards-clownfish',
    category: 'fish',
    name: "Allard's Clownfish",
    scientificName: 'Amphiprion allardi',
    rarity: 'Common',
    conservation: 'LC',
    habitats: ['Coral Reef'],
    whereToSee: ['Watamu Marine Park', 'Malindi Marine Park', 'Diani'],
    size: 'Up to 15 cm',
    diet: 'Algae and zooplankton',
    description:
      'An orange-black anemonefish with two white bands, found only along the East African coast. It lives among the stinging tentacles of sea anemones, protected by a mucus coat.',
    funFact: 'Clownfish are all born male; the dominant fish in a group becomes female.',
    wiki: "Allard's clownfish"
  },
  {
    id: 'moorish-idol',
    category: 'fish',
    name: 'Moorish Idol',
    scientificName: 'Zanclus cornutus',
    rarity: 'Common',
    conservation: 'LC',
    habitats: ['Coral Reef'],
    whereToSee: ['Watamu Marine Park', 'Mombasa Marine Park', 'Kisite-Mpunguti Marine Park'],
    size: 'Up to 23 cm',
    diet: 'Sponges and invertebrates',
    description:
      'A striking disc-shaped reef fish with bold black, white and yellow bands and a long, trailing dorsal fin.',
    wiki: 'Moorish idol'
  },
  {
    id: 'emperor-angelfish',
    category: 'fish',
    name: 'Emperor Angelfish',
    scientificName: 'Pomacanthus imperator',
    rarity: 'Common',
    conservation: 'LC',
    habitats: ['Coral Reef'],
    whereToSee: ['Malindi Marine Park', 'Watamu Marine Park', 'Diani'],
    size: 'Up to 40 cm',
    diet: 'Sponges and algae',
    description:
      'Adults have electric blue and yellow stripes and a dark mask over the eye. Juveniles look completely different, with white rings on a dark blue body.',
    wiki: 'Emperor angelfish'
  },
  {
    id: 'picasso-triggerfish',
    category: 'fish',
    name: 'Picasso Triggerfish',
    scientificName: 'Rhinecanthus aculeatus',
    rarity: 'Common',
    conservation: 'LC',
    habitats: ['Coral Reef'],
    whereToSee: ['Shallow reef flats at Diani', 'Watamu', 'Malindi'],
    size: 'Up to 30 cm',
    diet: 'Crustaceans, molluscs, algae',
    description:
      'Named for its abstract, painted look of blue lines and yellow-black patches. Commonly seen in shallow lagoons and reef flats.',
    funFact: 'It can lock its first dorsal spine upright to wedge itself into a crevice.',
    wiki: 'Rhinecanthus aculeatus'
  },
  {
    id: 'lionfish',
    category: 'fish',
    name: 'Devil Firefish',
    scientificName: 'Pterois miles',
    rarity: 'Common',
    conservation: 'LC',
    habitats: ['Coral Reef'],
    whereToSee: ['Mombasa Marine Park', 'Watamu', 'Kisite-Mpunguti Marine Park'],
    size: 'Up to 35 cm',
    diet: 'Small fish and shrimp',
    description:
      'A lionfish native to the Indian Ocean, with red-and-white stripes and long venomous spines. It hovers motionless before ambushing prey.',
    wiki: 'Pterois miles'
  },
  {
    id: 'bluespotted-ribbontail',
    category: 'fish',
    name: 'Bluespotted Ribbontail Ray',
    scientificName: 'Taeniura lymma',
    rarity: 'Uncommon',
    conservation: 'LC',
    habitats: ['Coral Reef'],
    whereToSee: ['Watamu', 'Diani', 'Kisite-Mpunguti Marine Park'],
    size: 'Disc up to 35 cm',
    diet: 'Molluscs, worms, shrimp and crabs',
    description:
      'A small, oval stingray covered in vivid electric-blue spots. It shelters under ledges by day and moves into shallow sand flats with the incoming tide.',
    wiki: 'Bluespotted ribbontail ray'
  },
  {
    id: 'nile-perch',
    category: 'fish',
    name: 'Nile Perch',
    scientificName: 'Lates niloticus',
    rarity: 'Common',
    conservation: 'LC',
    habitats: ['Freshwater Lake', 'River'],
    whereToSee: ['Lake Turkana'],
    size: 'Up to 2 m',
    diet: 'Fish, crustaceans and insects',
    description:
      'One of the largest freshwater fish in Africa. Native to Lake Turkana; its introduction to Lake Victoria in the 1950s devastated the native cichlid fauna but created a major fishery.',
    funFact: 'Individuals can weigh more than 200 kg.',
    wiki: 'Nile perch'
  },
  {
    id: 'nile-tilapia',
    category: 'fish',
    name: 'Nile Tilapia',
    scientificName: 'Oreochromis niloticus',
    rarity: 'Common',
    conservation: 'LC',
    habitats: ['Freshwater Lake', 'River'],
    whereToSee: ['Lake Turkana', 'Lake Baringo', 'Fish markets across Kenya'],
    size: 'Up to 60 cm',
    diet: 'Algae, plankton and plant matter',
    description:
      'A hardy, deep-bodied cichlid with faint vertical bars on the tail. It is the most important food fish in Kenya and widely farmed.',
    funFact: 'Females carry eggs and young fry in their mouths to protect them.',
    wiki: 'Nile tilapia'
  },
  {
    id: 'ngege',
    category: 'fish',
    name: 'Singidia Tilapia (Ngege)',
    scientificName: 'Oreochromis esculentus',
    rarity: 'Very Rare',
    conservation: 'CR',
    habitats: ['Freshwater Lake'],
    whereToSee: ['Satellite lakes of the Lake Victoria basin'],
    size: 'Up to 50 cm',
    diet: 'Phytoplankton (diatoms)',
    description:
      'Once the most valuable commercial fish of Lake Victoria, the ngege has virtually vanished from the main lake after the introduction of Nile perch and Nile tilapia, surviving mostly in small satellite lakes.',
    wiki: 'Oreochromis esculentus'
  },
  {
    id: 'magadi-tilapia',
    category: 'fish',
    name: 'Lake Magadi Tilapia',
    scientificName: 'Alcolapia grahami',
    rarity: 'Rare',
    conservation: 'VU',
    habitats: ['Soda Lake'],
    whereToSee: ['Hot springs of Lake Magadi'],
    size: 'Up to 10 cm',
    diet: 'Cyanobacteria and algae',
    description:
      'A tiny cichlid that thrives in the hot (up to 42 °C), extremely alkaline springs of Lake Magadi — conditions that would kill almost any other fish.',
    funFact: 'It excretes nitrogen as urea rather than ammonia, an adaptation to the highly alkaline water.',
    endemic: true,
    wiki: 'Alcolapia grahami'
  },
  {
    id: 'marbled-lungfish',
    category: 'fish',
    name: 'Marbled Lungfish',
    scientificName: 'Protopterus aethiopicus',
    rarity: 'Uncommon',
    conservation: 'LC',
    habitats: ['Freshwater Lake', 'Swamp'],
    whereToSee: ['Lake Victoria shoreline swamps', 'Yala Swamp'],
    size: 'Up to 2 m',
    diet: 'Molluscs, fish and insects',
    description:
      'An eel-like fish with thread-like fins that breathes air with a pair of lungs. In the dry season it can burrow into mud and survive in a mucus cocoon.',
    funFact: 'It has one of the largest genomes of any animal — over 40 times larger than a human\'s.',
    wiki: 'Marbled lungfish'
  },
  {
    id: 'tigerfish',
    category: 'fish',
    name: 'Tigerfish',
    scientificName: 'Hydrocynus forskahlii',
    rarity: 'Uncommon',
    conservation: 'LC',
    habitats: ['River', 'Freshwater Lake'],
    whereToSee: ['Lake Turkana', 'Tana River'],
    size: 'Up to 78 cm',
    diet: 'Fish',
    description:
      'A silvery, fast-swimming predator with dark horizontal stripes and prominent, interlocking teeth.',
    wiki: 'Hydrocynus forskahlii'
  },
  {
    id: 'sharptooth-catfish',
    category: 'fish',
    name: 'African Sharptooth Catfish',
    scientificName: 'Clarias gariepinus',
    rarity: 'Common',
    conservation: 'LC',
    habitats: ['Freshwater Lake', 'River', 'Swamp'],
    whereToSee: ['Lake Naivasha', 'Lake Baringo', 'Lake Victoria'],
    size: 'Up to 1.7 m',
    diet: 'Omnivore — fish, insects, plants, carrion',
    description:
      'A tough, eel-like catfish with long barbels around its mouth. It can gulp air and even move short distances across land between pools.',
    wiki: 'African sharptooth catfish'
  }
];
