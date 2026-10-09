export interface Costume {
  id: number;
  character: string;
  name: string;
  description: string;
  price: number;
  aiAssistedInfo?: string;
  embedding: number[];
}

export const COSTUME_CATALOG: Costume[] = [
  {
    id: 1,
    character: 'Jason Voorhees',
    name: 'Crystal Lake Slasher',
    description: 'Hockey mask, tattered jacket, and machete prop.',
    price: 49.99,
    embedding: [3, 2, 0, 0, 0, 0, 0],
  },
  {
    id: 2,
    character: 'Korg',
    name: 'Kronan Rock Warrior',
    description: 'Rocky skin suit with shoulder armor and club.',
    price: 59.99,
    embedding: [0, 0, 2, 2, 0, 0, 0],
  },
  {
    id: 3,
    character: 'Wednesday Addams',
    name: 'Gothic Academy Uniform',
    description: 'Black braided pigtails and a dark dress with white collar.',
    price: 44.99,
    embedding: [0, 0, 0, 0, 2, 2, 1],
  },
];

const CONCEPTS = [
  ['scary', 'horror', 'slasher', 'killer', 'frightening', 'jason'],
  ['hockey', 'mask', 'machete'],
  ['rock', 'rocky', 'stone', 'kronan'],
  ['alien', 'extraterrestrial', 'cosmic', 'thor', 'creature'],
  ['gothic', 'dark', 'black', 'spooky'],
  ['braid', 'braids', 'pigtail', 'hair'],
  ['girl', 'uniform', 'academy', 'school', 'wednesday'],
];

export function embedQuery(text: string): number[] {
  const normalized = text.toLowerCase();

  return CONCEPTS.map((terms) =>
    terms.reduce(
      (score, term) => score + (normalized.includes(term) ? 1 : 0),
      0,
    ),
  );
}

export function cosineSimilarity(left: number[], right: number[]): number {
  if (left.length !== right.length) {
    throw new Error('Cannot compare embeddings with different dimensions.');
  }

  const dotProduct = left.reduce(
    (total, value, index) => total + value * right[index],
    0,
  );
  const leftMagnitude = Math.sqrt(
    left.reduce((total, value) => total + value * value, 0),
  );
  const rightMagnitude = Math.sqrt(
    right.reduce((total, value) => total + value * value, 0),
  );

  if (leftMagnitude === 0 || rightMagnitude === 0) {
    return 0;
  }

  return dotProduct / (leftMagnitude * rightMagnitude);
}

export function searchCostumes(
  query: string,
  costumes: Costume[] = COSTUME_CATALOG,
): Costume[] {
  const queryEmbedding = embedQuery(query);

  return costumes
    .map((costume) => ({
      costume,
      similarity: cosineSimilarity(queryEmbedding, costume.embedding),
    }))
    .filter((match) => match.similarity >= 0.3)
    .sort((left, right) => right.similarity - left.similarity)
    .map((match) => match.costume);
}

export async function createCostumeInsight(
  costume: Costume,
  prompt: string,
): Promise<string> {
  await new Promise((resolve) => setTimeout(resolve, 450));

  const question = prompt.toLowerCase();

  if (/diy|build|make|foam|easy/.test(question)) {
    switch (costume.character) {
      case 'Korg':
        return 'Moderate DIY difficulty. Add EVA foam blocks to a dark shirt, then paint them gray.';
      case 'Wednesday Addams':
        return 'Easy DIY option. Use a dark dress, a white collar, and two braided pigtails.';
      default:
        return 'Easy to assemble with a hockey mask, an old jacket, and a safe toy prop.';
    }
  }

  if (/group|pair|match|friend/.test(question)) {
    switch (costume.character) {
      case 'Korg':
        return 'Pair this look with other space heroes or a team of rock creatures.';
      case 'Wednesday Addams':
        return 'Pair this look with classmates from Nevermore Academy or the Addams family.';
      default:
        return 'Pair this look with a camp counselor or classic horror movie characters.';
    }
  }

  if (/school|child|kid|appropriate/.test(question)) {
    return `${costume.character} can work for a school event. Check the event rules and leave prop weapons at home.`;
  }

  return `${costume.character}: ${costume.description} The listed price is $${costume.price.toFixed(2)}.`;
}
