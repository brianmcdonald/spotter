import type { Species } from '../types';

export const birds: Species[] = [
  {
    id: 'common-ostrich',
    category: 'birds',
    name: 'Common Ostrich',
    scientificName: 'Struthio camelus',
    rarity: 'Common',
    conservation: 'LC',
    habitats: ['Savannah', 'Semi-arid'],
    whereToSee: ['Maasai Mara', 'Nairobi National Park', 'Amboseli'],
    size: 'Up to 2.7 m tall',
    diet: 'Plants, seeds, insects and small reptiles',
    description:
      'The world\'s largest bird. Males of the Maasai subspecies have pink necks and legs in the breeding season; it cannot fly but runs at up to 70 km/h.',
    funFact: 'Its eye is larger than its brain.',
    wiki: 'Common ostrich'
  },
  {
    id: 'lesser-flamingo',
    category: 'birds',
    name: 'Lesser Flamingo',
    scientificName: 'Phoeniconaias minor',
    rarity: 'Common',
    conservation: 'NT',
    habitats: ['Soda Lake', 'Wetland'],
    whereToSee: ['Lake Bogoria', 'Lake Nakuru', 'Lake Magadi'],
    size: 'Up to 90 cm tall',
    diet: 'Spirulina and other blue-green algae',
    description:
      'Gathers in flocks of hundreds of thousands on the Rift Valley soda lakes, turning the shorelines pink. Its deep red bill is specialised for filtering algae.',
    funFact: 'Its pink colour comes from pigments in the algae it eats.',
    wiki: 'Lesser flamingo'
  },
  {
    id: 'secretarybird',
    category: 'birds',
    name: 'Secretarybird',
    scientificName: 'Sagittarius serpentarius',
    rarity: 'Uncommon',
    conservation: 'EN',
    habitats: ['Savannah'],
    whereToSee: ['Maasai Mara', 'Nairobi National Park', 'Amboseli'],
    size: 'Up to 1.3 m tall',
    diet: 'Snakes, lizards, rodents and insects',
    description:
      'A long-legged bird of prey that hunts on foot, stamping on snakes and other prey. Its crest of quill-like feathers gives it its name.',
    funFact: 'It can deliver a kick with a force of about five times its own body weight.',
    wiki: 'Secretarybird'
  },
  {
    id: 'grey-crowned-crane',
    category: 'birds',
    name: 'Grey Crowned Crane',
    scientificName: 'Balearica regulorum',
    rarity: 'Uncommon',
    conservation: 'EN',
    habitats: ['Wetland', 'Savannah'],
    whereToSee: ['Lake Naivasha', 'Maasai Mara', 'Kinangop Plateau'],
    size: 'Up to 1.1 m tall',
    diet: 'Seeds, insects, frogs and small reptiles',
    description:
      'An elegant crane with a stiff golden crown, white cheek patch and red throat pouch. Pairs perform elaborate dancing displays.',
    wiki: 'Grey crowned crane'
  },
  {
    id: 'lilac-breasted-roller',
    category: 'birds',
    name: 'Lilac-breasted Roller',
    scientificName: 'Coracias caudatus',
    rarity: 'Common',
    conservation: 'LC',
    habitats: ['Savannah', 'Woodland'],
    whereToSee: ['Maasai Mara', 'Tsavo', 'Samburu'],
    size: 'Up to 38 cm',
    diet: 'Insects, lizards and small rodents',
    description:
      'A dazzling bird with a lilac breast, turquoise belly and blue wings, usually seen perched on bare branches watching for prey.',
    funFact: 'It gets its name from the rolling, tumbling dives it makes during courtship flights.',
    wiki: 'Lilac-breasted roller'
  },
  {
    id: 'superb-starling',
    category: 'birds',
    name: 'Superb Starling',
    scientificName: 'Lamprotornis superbus',
    rarity: 'Common',
    conservation: 'LC',
    habitats: ['Savannah', 'Semi-arid'],
    whereToSee: ['Nairobi National Park', 'Samburu', 'Amboseli'],
    size: 'Up to 19 cm',
    diet: 'Insects, fruit and seeds',
    description:
      'A bold, iridescent blue-green starling with an orange belly separated by a white band. Commonly seen around lodges and campsites.',
    wiki: 'Superb starling'
  },
  {
    id: 'african-fish-eagle',
    category: 'birds',
    name: 'African Fish Eagle',
    scientificName: 'Haliaeetus vocifer',
    rarity: 'Common',
    conservation: 'LC',
    habitats: ['Wetland', 'Freshwater Lake', 'River'],
    whereToSee: ['Lake Naivasha', 'Lake Baringo', 'Lake Victoria'],
    size: 'Wingspan up to 2.4 m',
    diet: 'Fish, waterbirds',
    description:
      'A large eagle with a white head, chestnut body and black wings. Its ringing call is one of the signature sounds of African lakes.',
    funFact: 'It swoops down and snatches fish from just below the water\'s surface with its talons.',
    wiki: 'African fish eagle'
  },
  {
    id: 'kori-bustard',
    category: 'birds',
    name: 'Kori Bustard',
    scientificName: 'Ardeotis kori',
    rarity: 'Uncommon',
    conservation: 'NT',
    habitats: ['Savannah', 'Semi-arid'],
    whereToSee: ['Maasai Mara', 'Amboseli', 'Samburu'],
    size: 'Up to 1.5 m long',
    diet: 'Insects, small vertebrates, seeds',
    description:
      'Possibly the heaviest flying bird in the world. It spends most of its time walking slowly through grassland.',
    funFact: 'Displaying males inflate their throat into a huge white balloon.',
    wiki: 'Kori bustard'
  },
  {
    id: 'martial-eagle',
    category: 'birds',
    name: 'Martial Eagle',
    scientificName: 'Polemaetus bellicosus',
    rarity: 'Rare',
    conservation: 'EN',
    habitats: ['Savannah', 'Woodland'],
    whereToSee: ['Maasai Mara', 'Tsavo', 'Laikipia'],
    size: 'Wingspan up to 2.6 m',
    diet: 'Gamebirds, hares, small antelope, monitor lizards',
    description:
      'Africa\'s largest eagle, with a dark head and chest and a white, spotted belly. It hunts from high soaring flight.',
    wiki: 'Martial eagle'
  },
  {
    id: 'bateleur',
    category: 'birds',
    name: 'Bateleur',
    scientificName: 'Terathopius ecaudatus',
    rarity: 'Uncommon',
    conservation: 'EN',
    habitats: ['Savannah'],
    whereToSee: ['Tsavo', 'Maasai Mara', 'Meru'],
    size: 'Wingspan up to 1.8 m',
    diet: 'Carrion, birds, small mammals, snakes',
    description:
      'A strikingly coloured eagle with a red face and legs and a very short tail. Its rocking, acrobatic flight earned it a name meaning "tightrope walker" in French.',
    wiki: 'Bateleur'
  },
  {
    id: 'ruppells-vulture',
    category: 'birds',
    name: "Rüppell's Vulture",
    scientificName: 'Gyps rueppelli',
    rarity: 'Uncommon',
    conservation: 'CR',
    habitats: ['Savannah', 'Highlands'],
    whereToSee: ['Maasai Mara', "Hell's Gate National Park"],
    size: 'Wingspan up to 2.6 m',
    diet: 'Carrion',
    description:
      'A large, scaly-looking vulture that nests on cliffs. Populations have crashed because of poisoning, and it is now critically endangered.',
    funFact: 'It holds the record for the highest-flying bird, recorded at 11,300 m.',
    wiki: "Rüppell's vulture"
  },
  {
    id: 'southern-ground-hornbill',
    category: 'birds',
    name: 'Southern Ground Hornbill',
    scientificName: 'Bucorvus leadbeateri',
    rarity: 'Rare',
    conservation: 'VU',
    habitats: ['Savannah', 'Woodland'],
    whereToSee: ['Maasai Mara', 'Ruma National Park'],
    size: 'Up to 1.3 m',
    diet: 'Reptiles, frogs, insects, small mammals',
    description:
      'A large black hornbill with bright red facial and throat skin. Groups walk through grassland hunting, and their deep booming calls carry for kilometres.',
    wiki: 'Southern ground hornbill'
  },
  {
    id: 'vulturine-guineafowl',
    category: 'birds',
    name: 'Vulturine Guineafowl',
    scientificName: 'Acryllium vulturinum',
    rarity: 'Uncommon',
    conservation: 'LC',
    habitats: ['Semi-arid'],
    whereToSee: ['Samburu', 'Buffalo Springs', 'Tsavo East'],
    size: 'Up to 72 cm',
    diet: 'Seeds, roots, insects',
    description:
      'The largest guineafowl, with a bare vulture-like head, cobalt-blue breast and long striped neck feathers.',
    wiki: 'Vulturine guineafowl'
  },
  {
    id: 'hartlaubs-turaco',
    category: 'birds',
    name: "Hartlaub's Turaco",
    scientificName: 'Tauraco hartlaubi',
    rarity: 'Uncommon',
    conservation: 'LC',
    habitats: ['Forest', 'Highlands'],
    whereToSee: ['Karura Forest', 'Mount Kenya forests', 'Aberdares'],
    size: 'Up to 43 cm',
    diet: 'Fruit',
    description:
      'A green forest bird with a blue-black crest. When it flies it flashes brilliant crimson flight feathers.',
    funFact: 'Turacos have unique copper-based pigments (turacin) that make their red feathers.',
    wiki: "Hartlaub's turaco"
  },
  {
    id: 'marabou-stork',
    category: 'birds',
    name: 'Marabou Stork',
    scientificName: 'Leptoptilos crumenifer',
    rarity: 'Common',
    conservation: 'LC',
    habitats: ['Savannah', 'Wetland', 'Urban'],
    whereToSee: ['Nairobi', 'Kisumu', 'Maasai Mara'],
    size: 'Up to 1.5 m tall',
    diet: 'Carrion, fish, frogs, rubbish',
    description:
      'A huge, bald-headed stork with a pink, dangling throat pouch. Often seen in towns scavenging alongside vultures.',
    wiki: 'Marabou stork'
  },
  {
    id: 'hamerkop',
    category: 'birds',
    name: 'Hamerkop',
    scientificName: 'Scopus umbretta',
    rarity: 'Common',
    conservation: 'LC',
    habitats: ['Wetland', 'River'],
    whereToSee: ['Lake Naivasha', 'Nairobi National Park', 'Lake Baringo'],
    size: 'Up to 56 cm',
    diet: 'Frogs, fish, invertebrates',
    description:
      'A brown wading bird whose crest and bill give its head a hammer shape. It builds enormous domed nests from sticks.',
    funFact: 'Its nest can be over 1.5 m across and contain thousands of sticks.',
    wiki: 'Hamerkop'
  },
  {
    id: 'malachite-kingfisher',
    category: 'birds',
    name: 'Malachite Kingfisher',
    scientificName: 'Corythornis cristatus',
    rarity: 'Common',
    conservation: 'LC',
    habitats: ['Wetland', 'River'],
    whereToSee: ['Lake Naivasha', 'Lake Baringo', 'Tana River'],
    size: 'Up to 13 cm',
    diet: 'Small fish, aquatic insects',
    description:
      'A tiny, jewel-like kingfisher with a turquoise crest, orange underparts and a red bill. It perches on reeds before diving for fish.',
    wiki: 'Malachite kingfisher'
  },
  {
    id: 'yellow-billed-oxpecker',
    category: 'birds',
    name: 'Yellow-billed Oxpecker',
    scientificName: 'Buphagus africanus',
    rarity: 'Common',
    conservation: 'LC',
    habitats: ['Savannah'],
    whereToSee: ['Maasai Mara', 'Lake Nakuru', 'Tsavo'],
    size: 'Up to 22 cm',
    diet: 'Ticks, blood and parasites from large mammals',
    description:
      'A brown starling-relative that rides on buffalo, giraffe and other large animals, picking off ticks and insects.',
    wiki: 'Yellow-billed oxpecker'
  },
  {
    id: 'golden-breasted-starling',
    category: 'birds',
    name: 'Golden-breasted Starling',
    scientificName: 'Lamprotornis regius',
    rarity: 'Uncommon',
    conservation: 'LC',
    habitats: ['Semi-arid'],
    whereToSee: ['Tsavo East', 'Samburu', 'Meru'],
    size: 'Up to 35 cm',
    diet: 'Insects, especially termites',
    description:
      'A slender starling with a long, graduated tail, glossy blue-green upperparts and a brilliant golden-yellow belly.',
    wiki: 'Golden-breasted starling'
  },
  {
    id: 'taita-thrush',
    category: 'birds',
    name: 'Taita Thrush',
    scientificName: 'Turdus helleri',
    rarity: 'Very Rare',
    conservation: 'CR',
    habitats: ['Forest', 'Highlands'],
    whereToSee: ['Taita Hills (Ngangao, Mbololo forests)'],
    size: 'Up to 23 cm',
    diet: 'Insects and fruit from the forest floor',
    description:
      'A shy, dark thrush with an orange belly and bill, found only in a few tiny forest fragments in the Taita Hills.',
    endemic: true,
    wiki: 'Taita thrush'
  },
  {
    id: 'sokoke-scops-owl',
    category: 'birds',
    name: 'Sokoke Scops Owl',
    scientificName: 'Otus ireneae',
    rarity: 'Very Rare',
    conservation: 'EN',
    habitats: ['Forest', 'Coast'],
    whereToSee: ['Arabuko-Sokoke Forest'],
    size: 'Up to 18 cm',
    diet: 'Insects',
    description:
      'One of Africa\'s smallest owls, living mainly in the Brachystegia woodland of Arabuko-Sokoke Forest. Its call sounds like a soft, repeated whistle.',
    wiki: 'Sokoke scops owl'
  },
  {
    id: 'clarkes-weaver',
    category: 'birds',
    name: "Clarke's Weaver",
    scientificName: 'Ploceus golandi',
    rarity: 'Very Rare',
    conservation: 'EN',
    habitats: ['Forest', 'Coast'],
    whereToSee: ['Arabuko-Sokoke Forest', 'Dakatcha Woodland'],
    size: 'Up to 13 cm',
    diet: 'Insects and seeds',
    description:
      'A black-and-yellow weaver found nowhere else on Earth but a small area of coastal Kenya. Flocks forage in the forest canopy.',
    endemic: true,
    wiki: "Clarke's weaver"
  },
  {
    id: 'hindes-babbler',
    category: 'birds',
    name: "Hinde's Babbler",
    scientificName: 'Turdoides hindei',
    rarity: 'Rare',
    conservation: 'VU',
    habitats: ['Highlands', 'Woodland'],
    whereToSee: ['Mwea National Reserve', 'Kianyaga Valley'],
    size: 'Up to 23 cm',
    diet: 'Insects',
    description:
      'A noisy, social brown babbler with pale scaly feathers, found only in the eastern foothills of Mount Kenya.',
    endemic: true,
    wiki: "Hinde's babbler"
  },
  {
    id: 'sharpes-longclaw',
    category: 'birds',
    name: "Sharpe's Longclaw",
    scientificName: 'Hemimacronyx sharpei',
    rarity: 'Rare',
    conservation: 'EN',
    habitats: ['Highlands', 'Grassland'],
    whereToSee: ['Kinangop Plateau', 'Mau Narok'],
    size: 'Up to 17 cm',
    diet: 'Insects',
    description:
      'A small, streaky, yellow-breasted pipit-like bird restricted to high-altitude tussock grasslands of the central Kenyan highlands.',
    endemic: true,
    wiki: "Sharpe's longclaw"
  },
  {
    id: 'aberdare-cisticola',
    category: 'birds',
    name: 'Aberdare Cisticola',
    scientificName: 'Cisticola aberdare',
    rarity: 'Rare',
    conservation: 'EN',
    habitats: ['Highlands', 'Grassland'],
    whereToSee: ['Aberdares', 'Mau Escarpment'],
    size: 'Up to 15 cm',
    diet: 'Insects',
    description:
      'A small, streaked warbler of montane grasslands above 2,300 m, found only in Kenya.',
    endemic: true,
    wiki: 'Aberdare cisticola'
  }
];
