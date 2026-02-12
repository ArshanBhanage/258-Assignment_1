export interface FlashCard {
  id: string;
  question: string;
  answer: string;
  hint: string;
  seenCount: number;
  correctCount: number;
  lastSeenAt: Date | null;
  createdAt: Date;
}

export interface Deck {
  id: string;
  title: string;
  topic: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  examType: string | null;
  cardCount: number;
  createdAt: Date;
  updatedAt: Date;
  lastStudiedAt: Date | null;
}

export interface DeckWithMastery extends Deck {
  masteryPercent: number;
}

export interface GeneratedCard {
  question: string;
  answer: string;
  hint: string;
}

export interface GeneratedDeck {
  title: string;
  cards: GeneratedCard[];
}

export interface DeckFormData {
  topic: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  numCards: number;
  examType: string;
}
