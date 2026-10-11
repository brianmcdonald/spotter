import type { Species } from '../types';

export const animals: Species[] = [
  {
    id: 'african-elephant',
    category: 'animals',
    name: 'African Bush Elephant',
    scientificName: 'Loxodonta africana',
    rarity: 'Common',
    conservation: 'EN',
    habitats: ['Savannah', 'Forest', 'Semi-arid'],
    whereToSee: ['Amboseli', 'Tsavo', 'Samburu', 'Maasai Mara'],
    size: 'Up to 4 m at the shoulder',
    diet: 'Grasses, leaves, bark, fruit',
    description:
      'The largest land animal on Earth. Amboseli\'s herds, set against Kilimanjaro, are some of the most studied elephants in the world.',
    funFact: 'Elephants communicate with low-frequency rumbles that can travel several kilometres.',
    wiki: 'African bush elephant'
  },
  {
    id: 'lion',
    category: 'animals',
    name: 'Lion',
    scientificName: 'Panthera leo',
    rarity: 'Uncommon',
    conservation: 'VU',
    habitats: ['Savannah'],
    whereToSee: ['Maasai Mara', 'Nairobi National Park', 'Tsavo', 'Samburu'],
    size: 'Up to 2.5 m long (excluding tail)',
    diet: 'Wildebeest, zebra, buffalo, antelope',
    description:
      'The only truly social cat, living in prides of related females and their cubs. The Maasai Mara has one of Africa\'s densest lion populations.',
    funFact: 'A lion\'s roar can be heard up to 8 km away.',
    wiki: 'Lion'
  },
  {
    id: 'leopard',
    category: 'animals',
    name: 'Leopard',
    scientificName: 'Panthera pardus',
    rarity: 'Rare',
    conservation: 'VU',
    habitats: ['Savannah', 'Forest', 'Highlands'],
    whereToSee: ['Maasai Mara', 'Samburu', 'Lake Nakuru'],
    size: 'Up to 1.9 m long (excluding tail)',
    diet: 'Antelope, monkeys, hares, birds',
    description:
      'A powerful, secretive cat covered in rosettes. Mostly nocturnal, it often hauls its kills up into trees, away from lions and hyenas.',
    wiki: 'African leopard'
  },
  {
    id: 'cheetah',
    category: 'animals',
    name: 'Cheetah',
    scientificName: 'Acinonyx jubatus',
    rarity: 'Rare',
    conservation: 'VU',
    habitats: ['Savannah', 'Semi-arid'],
    whereToSee: ['Maasai Mara', 'Samburu', 'Tsavo East'],
    size: 'Up to 1.5 m long (excluding tail)',
    diet: 'Gazelles, impala, hares',
    description:
      'A slender, long-legged cat built for speed, with black "tear lines" running from the eyes to the mouth. It hunts by day to avoid other predators.',
    funFact: 'The fastest land animal, reaching about 100 km/h in short bursts.',
    wiki: 'Cheetah'
  },
  {
    id: 'black-rhino',
    category: 'animals',
    name: 'Black Rhinoceros',
    scientificName: 'Diceros bicornis',
    rarity: 'Very Rare',
    conservation: 'CR',
    habitats: ['Savannah', 'Semi-arid'],
    whereToSee: ['Lake Nakuru', 'Ol Pejeta', 'Tsavo West (Ngulia Sanctuary)', 'Lewa'],
    size: 'Up to 1.8 m at the shoulder',
    diet: 'Leaves, shoots and branches (browser)',
    description:
      'A browsing rhino with a hooked, prehensile upper lip. Kenya holds one of the largest remaining populations, mostly in heavily guarded sanctuaries.',
    wiki: 'Black rhinoceros'
  },
  {
    id: 'cape-buffalo',
    category: 'animals',
    name: 'African Buffalo',
    scientificName: 'Syncerus caffer',
    rarity: 'Common',
    conservation: 'NT',
    habitats: ['Savannah', 'Forest', 'Wetland'],
    whereToSee: ['Maasai Mara', 'Lake Nakuru', 'Aberdares'],
    size: 'Up to 1.7 m at the shoulder',
    diet: 'Grasses',
    description:
      'A massive, unpredictable bovine with heavy, curved horns that fuse into a "boss" across the forehead in males. One of the "Big Five".',
    wiki: 'African buffalo'
  },
  {
    id: 'grevys-zebra',
    category: 'animals',
    name: "Grévy's Zebra",
    scientificName: 'Equus grevyi',
    rarity: 'Rare',
    conservation: 'EN',
    habitats: ['Semi-arid'],
    whereToSee: ['Samburu', 'Buffalo Springs', 'Lewa', 'Laikipia'],
    size: 'Up to 1.6 m at the shoulder',
    diet: 'Grasses',
    description:
      'The largest zebra, with narrow stripes, a white belly and large rounded ears. Around 90% of the world\'s population lives in northern Kenya.',
    wiki: "Grévy's zebra"
  },
  {
    id: 'plains-zebra',
    category: 'animals',
    name: 'Plains Zebra',
    scientificName: 'Equus quagga',
    rarity: 'Common',
    conservation: 'NT',
    habitats: ['Savannah'],
    whereToSee: ['Maasai Mara', 'Nairobi National Park', 'Amboseli'],
    size: 'Up to 1.4 m at the shoulder',
    diet: 'Grasses',
    description:
      'The familiar zebra with broad stripes that extend under the belly. Huge numbers join the wildebeest in the Great Migration.',
    funFact: 'Stripes may help deter biting flies.',
    wiki: 'Plains zebra'
  },
  {
    id: 'reticulated-giraffe',
    category: 'animals',
    name: 'Reticulated Giraffe',
    scientificName: 'Giraffa reticulata',
    rarity: 'Uncommon',
    conservation: 'EN',
    habitats: ['Semi-arid', 'Savannah'],
    whereToSee: ['Samburu', 'Meru', 'Laikipia'],
    size: 'Up to 5.8 m tall',
    diet: 'Acacia leaves and shoots',
    description:
      'A giraffe of northern Kenya with large, polygonal liver-red patches separated by crisp white lines.',
    wiki: 'Reticulated giraffe'
  },
  {
    id: 'masai-giraffe',
    category: 'animals',
    name: 'Masai Giraffe',
    scientificName: 'Giraffa tippelskirchi',
    rarity: 'Common',
    conservation: 'EN',
    habitats: ['Savannah'],
    whereToSee: ['Maasai Mara', 'Nairobi National Park', 'Amboseli'],
    size: 'Up to 5.7 m tall',
    diet: 'Acacia leaves and shoots',
    description:
      'The tallest land animal and Kenya\'s most widespread giraffe, with jagged, vine-leaf-shaped dark patches.',
    wiki: 'Masai giraffe'
  },
  {
    id: 'hirola',
    category: 'animals',
    name: 'Hirola',
    scientificName: 'Beatragus hunteri',
    rarity: 'Very Rare',
    conservation: 'CR',
    habitats: ['Semi-arid'],
    whereToSee: ['Ishaqbini Hirola Conservancy', 'Tsavo East (translocated herd)'],
    size: 'Up to 1.2 m at the shoulder',
    diet: 'Grasses',
    description:
      'The world\'s most endangered antelope, found only on the Kenya–Somalia border. It has distinctive white "spectacles" around its eyes.',
    funFact: 'Its pre-orbital glands are so large it is sometimes called the "four-eyed antelope".',
    endemic: true,
    wiki: 'Hirola'
  },
  {
    id: 'mountain-bongo',
    category: 'animals',
    name: 'Mountain Bongo',
    scientificName: 'Tragelaphus eurycerus isaaci',
    rarity: 'Very Rare',
    conservation: 'CR',
    habitats: ['Forest', 'Highlands'],
    whereToSee: ['Aberdares', 'Mount Kenya', 'Mount Kenya Wildlife Conservancy'],
    size: 'Up to 1.3 m at the shoulder',
    diet: 'Leaves, bark, roots',
    description:
      'A large, chestnut-red forest antelope with thin white stripes and spiralled horns. Fewer than 100 remain in the wild, all in Kenya\'s highland forests.',
    endemic: true,
    wiki: 'Mountain bongo'
  },
  {
    id: 'wildebeest',
    category: 'animals',
    name: 'Blue Wildebeest',
    scientificName: 'Connochaetes taurinus',
    rarity: 'Common',
    conservation: 'LC',
    habitats: ['Savannah'],
    whereToSee: ['Maasai Mara (July–October)', 'Nairobi National Park'],
    size: 'Up to 1.5 m at the shoulder',
    diet: 'Short grasses',
    description:
      'Over a million wildebeest cross into the Maasai Mara each year during the Great Migration, braving crocodile-filled river crossings.',
    wiki: 'Blue wildebeest'
  },
  {
    id: 'hippopotamus',
    category: 'animals',
    name: 'Hippopotamus',
    scientificName: 'Hippopotamus amphibius',
    rarity: 'Common',
    conservation: 'VU',
    habitats: ['Wetland', 'River', 'Freshwater Lake'],
    whereToSee: ['Mara River', 'Lake Naivasha', 'Mzima Springs (Tsavo West)'],
    size: 'Up to 1.6 m at the shoulder; 1.5–3 tonnes',
    diet: 'Grasses (grazes at night)',
    description:
      'A huge, semi-aquatic mammal that spends the day in water to keep cool and leaves to graze after dark. Considered one of Africa\'s most dangerous animals.',
    funFact: 'Hippos secrete a reddish fluid that acts as a natural sunscreen.',
    wiki: 'Hippopotamus'
  },
  {
    id: 'african-wild-dog',
    category: 'animals',
    name: 'African Wild Dog',
    scientificName: 'Lycaon pictus',
    rarity: 'Very Rare',
    conservation: 'EN',
    habitats: ['Savannah', 'Semi-arid'],
    whereToSee: ['Laikipia', 'Tsavo', 'Samburu'],
    size: 'Up to 1.1 m long',
    diet: 'Impala, gazelle, dik-dik',
    description:
      'Also called the painted wolf for its patchy coat of black, tan and white. Packs hunt cooperatively and are among the most successful predators in Africa.',
    wiki: 'African wild dog'
  },
  {
    id: 'spotted-hyena',
    category: 'animals',
    name: 'Spotted Hyena',
    scientificName: 'Crocuta crocuta',
    rarity: 'Common',
    conservation: 'LC',
    habitats: ['Savannah', 'Semi-arid'],
    whereToSee: ['Maasai Mara', 'Amboseli', 'Nairobi National Park'],
    size: 'Up to 1.8 m long',
    diet: 'Hunts antelope and zebra; also scavenges',
    description:
      'A powerful, highly social carnivore living in matriarchal clans. Far from being mere scavengers, hyenas kill most of their own food.',
    funFact: 'Its "laugh" is actually a sign of frustration or submission.',
    wiki: 'Spotted hyena'
  },
  {
    id: 'gerenuk',
    category: 'animals',
    name: 'Gerenuk',
    scientificName: 'Litocranius walleri',
    rarity: 'Uncommon',
    conservation: 'NT',
    habitats: ['Semi-arid'],
    whereToSee: ['Samburu', 'Tsavo East', 'Meru'],
    size: 'Up to 1 m at the shoulder',
    diet: 'Leaves and shoots',
    description:
      'A gazelle with an extraordinarily long neck that stands upright on its hind legs to browse high branches.',
    funFact: 'It can survive without drinking, getting all its water from plants.',
    wiki: 'Gerenuk'
  },
  {
    id: 'thomsons-gazelle',
    category: 'animals',
    name: "Thomson's Gazelle",
    scientificName: 'Eudorcas thomsonii',
    rarity: 'Common',
    conservation: 'NT',
    habitats: ['Savannah'],
    whereToSee: ['Maasai Mara', 'Nairobi National Park', 'Amboseli'],
    size: 'Up to 70 cm at the shoulder',
    diet: 'Grasses',
    description:
      'A small, graceful gazelle with a bold black stripe along each flank and a constantly flicking tail.',
    wiki: "Thomson's gazelle"
  },
  {
    id: 'impala',
    category: 'animals',
    name: 'Impala',
    scientificName: 'Aepyceros melampus',
    rarity: 'Common',
    conservation: 'LC',
    habitats: ['Savannah', 'Woodland'],
    whereToSee: ['Lake Nakuru', 'Maasai Mara', 'Nairobi National Park'],
    size: 'Up to 92 cm at the shoulder',
    diet: 'Grasses and leaves',
    description:
      'A medium-sized, reddish antelope; males carry lyre-shaped horns. Herds can leap up to 3 m high when fleeing predators.',
    wiki: 'Impala'
  },
  {
    id: 'warthog',
    category: 'animals',
    name: 'Common Warthog',
    scientificName: 'Phacochoerus africanus',
    rarity: 'Common',
    conservation: 'LC',
    habitats: ['Savannah'],
    whereToSee: ['Nairobi National Park', 'Maasai Mara', 'Lake Nakuru'],
    size: 'Up to 85 cm at the shoulder',
    diet: 'Grasses, roots, bulbs',
    description:
      'A wild pig with curved tusks and facial "warts". It runs with its thin tail held straight up like an antenna.',
    wiki: 'Common warthog'
  },
  {
    id: 'nile-crocodile',
    category: 'animals',
    name: 'Nile Crocodile',
    scientificName: 'Crocodylus niloticus',
    rarity: 'Common',
    conservation: 'LC',
    habitats: ['River', 'Freshwater Lake', 'Wetland'],
    whereToSee: ['Mara River', 'Lake Turkana', 'Lake Baringo', 'Tana River'],
    size: 'Up to 5 m',
    diet: 'Fish, wildebeest, zebra, birds',
    description:
      'Africa\'s largest reptile. Lake Turkana hosts one of the largest breeding populations on the continent.',
    wiki: 'Nile crocodile'
  },
  {
    id: 'green-sea-turtle',
    category: 'animals',
    name: 'Green Sea Turtle',
    scientificName: 'Chelonia mydas',
    rarity: 'Uncommon',
    conservation: 'EN',
    habitats: ['Marine', 'Coral Reef'],
    whereToSee: ['Watamu', 'Diani', 'Kiunga Marine Reserve'],
    size: 'Shell up to 1.5 m',
    diet: 'Seagrass and algae',
    description:
      'A large sea turtle that grazes on seagrass beds. Females nest on beaches around Watamu and Lamu, where local groups protect the nests.',
    wiki: 'Green sea turtle'
  },
  {
    id: 'dugong',
    category: 'animals',
    name: 'Dugong',
    scientificName: 'Dugong dugon',
    rarity: 'Very Rare',
    conservation: 'VU',
    habitats: ['Marine'],
    whereToSee: ['Kiunga Marine Reserve', 'Lamu Archipelago', 'Kisite-Mpunguti Marine Park'],
    size: 'Up to 3 m',
    diet: 'Seagrass',
    description:
      'A gentle marine mammal related to elephants, which grazes on seagrass meadows. Only a handful remain in Kenyan waters.',
    funFact: 'Dugongs may have inspired sailors\' legends of mermaids.',
    wiki: 'Dugong'
  },
  {
    id: 'golden-rumped-sengi',
    category: 'animals',
    name: 'Golden-rumped Elephant Shrew',
    scientificName: 'Rhynchocyon chrysopygus',
    rarity: 'Rare',
    conservation: 'EN',
    habitats: ['Forest', 'Coast'],
    whereToSee: ['Arabuko-Sokoke Forest', 'Boni-Dodori Forest'],
    size: 'Up to 30 cm (plus tail)',
    diet: 'Insects, spiders, worms',
    description:
      'A small, long-snouted mammal with a bright golden patch on its rump. It forages noisily in leaf litter on the coastal forest floor.',
    funFact: 'Despite the name, sengis are more closely related to elephants than to shrews.',
    endemic: true,
    wiki: 'Golden-rumped elephant shrew'
  },
  {
    id: 'aardvark',
    category: 'animals',
    name: 'Aardvark',
    scientificName: 'Orycteropus afer',
    rarity: 'Rare',
    conservation: 'LC',
    habitats: ['Savannah', 'Semi-arid'],
    whereToSee: ['Laikipia', 'Maasai Mara (night drives)'],
    size: 'Up to 2.2 m long',
    diet: 'Ants and termites',
    description:
      'A nocturnal, burrowing mammal with a pig-like snout, rabbit-like ears and powerful claws used to dig into termite mounds.',
    wiki: 'Aardvark'
  },
  {
    id: 'ground-pangolin',
    category: 'animals',
    name: 'Ground Pangolin',
    scientificName: 'Smutsia temminckii',
    rarity: 'Very Rare',
    conservation: 'VU',
    habitats: ['Savannah', 'Semi-arid'],
    whereToSee: ['Maasai Mara', 'Tsavo', 'Laikipia'],
    size: 'Up to 1 m long',
    diet: 'Ants and termites',
    description:
      'A scaly, nocturnal anteater that rolls into an armoured ball when threatened. Pangolins are the most trafficked mammals in the world.',
    wiki: 'Ground pangolin'
  },
  {
    id: 'tana-red-colobus',
    category: 'animals',
    name: 'Tana River Red Colobus',
    scientificName: 'Piliocolobus rufomitratus',
    rarity: 'Rare',
    conservation: 'EN',
    habitats: ['Forest', 'River'],
    whereToSee: ['Tana River Primate Reserve'],
    size: 'Up to 63 cm (plus tail)',
    diet: 'Leaves, flowers, fruit',
    description:
      'A monkey with a rusty-red cap restricted to fragmented riverine forests along the lower Tana River.',
    endemic: true,
    wiki: 'Tana River red colobus'
  },
  {
    id: 'mantled-guereza',
    category: 'animals',
    name: 'Black-and-white Colobus',
    scientificName: 'Colobus guereza',
    rarity: 'Uncommon',
    conservation: 'LC',
    habitats: ['Forest', 'Highlands'],
    whereToSee: ['Kakamega Forest', 'Aberdares', 'Lake Naivasha (Crescent Island)'],
    size: 'Up to 70 cm (plus tail)',
    diet: 'Leaves',
    description:
      'A striking black monkey with a white face ring, long white mantle and bushy white tail. It leaps between treetops with its "cape" streaming behind.',
    funFact: 'Colobus monkeys have no thumbs, which helps them swing through branches.',
    wiki: 'Mantled guereza'
  },
  {
    id: 'olive-baboon',
    category: 'animals',
    name: 'Olive Baboon',
    scientificName: 'Papio anubis',
    rarity: 'Common',
    conservation: 'LC',
    habitats: ['Savannah', 'Forest'],
    whereToSee: ['Nairobi National Park', 'Lake Nakuru', 'Maasai Mara'],
    size: 'Up to 85 cm (plus tail)',
    diet: 'Omnivore — grasses, fruit, insects, small animals',
    description:
      'A large, olive-grey baboon living in troops of up to 150. Highly adaptable, it is found across most of Kenya.',
    wiki: 'Olive baboon'
  },
  {
    id: 'sitatunga',
    category: 'animals',
    name: 'Sitatunga',
    scientificName: 'Tragelaphus spekii',
    rarity: 'Rare',
    conservation: 'LC',
    habitats: ['Swamp', 'Wetland'],
    whereToSee: ['Saiwa Swamp National Park', 'Lewa Swamp'],
    size: 'Up to 1.25 m at the shoulder',
    diet: 'Reeds, sedges and grasses',
    description:
      'A shy, swamp-dwelling antelope with long, splayed hooves that let it walk on soft mud and floating vegetation. Saiwa Swamp was created specifically to protect it.',
    wiki: 'Sitatunga'
  }
];
