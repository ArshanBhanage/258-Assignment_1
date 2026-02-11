import {
    collection,
    doc,
    setDoc,
    getDoc,
    getDocs,
    updateDoc,
    deleteDoc,
    query,
    orderBy,
    serverTimestamp,
    Timestamp,
    writeBatch,
    Firestore,
} from 'firebase/firestore';
import { db } from './firebase';
import { Deck, DeckWithMastery, FlashCard, GeneratedCard } from './types';

// ── Helpers ──────────────────────────────────────────────────────────────────

function getDb(): Firestore {
    if (!db) throw new Error('Firestore is not initialized. Check your Firebase config.');
    return db;
}

function toDate(ts: Timestamp | null | undefined): Date | null {
    return ts ? ts.toDate() : null;
}

/** Wrap a Firestore promise with a timeout so denied queries don't hang forever. */
function withTimeout<T>(promise: Promise<T>, ms = 10000, label = 'Firestore'): Promise<T> {
    return Promise.race([
        promise,
        new Promise<T>((_, reject) =>
            setTimeout(() => reject(new Error(
                `${label} query timed out after ${ms / 1000}s. ` +
                'This usually means Firestore security rules are blocking access. ' +
                'Deploy your firestore.rules or set Firestore to test mode in the Firebase Console.'
            )), ms)
        ),
    ]);
}

// ── Decks ────────────────────────────────────────────────────────────────────

export async function createDeck(
    uid: string,
    data: {
        title: string;
        topic: string;
        difficulty: string;
        examType: string | null;
        cardCount: number;
    },
    cards: GeneratedCard[]
): Promise<string> {
    const firestore = getDb();
    const deckRef = doc(collection(firestore, 'users', uid, 'decks'));
    const now = serverTimestamp();

    await setDoc(deckRef, {
        title: data.title,
        topic: data.topic,
        difficulty: data.difficulty,
        examType: data.examType,
        cardCount: data.cardCount,
        createdAt: now,
        updatedAt: now,
        lastStudiedAt: null,
    });

    const batch = writeBatch(firestore);
    for (const card of cards) {
        const cardRef = doc(collection(firestore, 'users', uid, 'decks', deckRef.id, 'cards'));
        batch.set(cardRef, {
            question: card.question,
            answer: card.answer,
            hint: card.hint,
            seenCount: 0,
            correctCount: 0,
            lastSeenAt: null,
            createdAt: now,
        });
    }
    await batch.commit();

    return deckRef.id;
}

export async function getUserDecks(uid: string): Promise<DeckWithMastery[]> {
    const firestore = getDb();
    const decksRef = collection(firestore, 'users', uid, 'decks');
    const q = query(decksRef, orderBy('createdAt', 'desc'));
    console.log('[Firestore] Fetching decks for user:', uid);
    const snapshot = await withTimeout(getDocs(q), 10000, 'getUserDecks');
    console.log('[Firestore] Found', snapshot.docs.length, 'decks');

    const decks: DeckWithMastery[] = [];

    for (const deckDoc of snapshot.docs) {
        const d = deckDoc.data();
        const cardsSnap = await withTimeout(
            getDocs(collection(firestore, 'users', uid, 'decks', deckDoc.id, 'cards')),
            10000,
            `getDeckCards(${deckDoc.id})`
        );

        let totalSeen = 0;
        let totalCorrect = 0;
        cardsSnap.docs.forEach((c) => {
            const cd = c.data();
            totalSeen += cd.seenCount || 0;
            totalCorrect += cd.correctCount || 0;
        });

        decks.push({
            id: deckDoc.id,
            title: d.title,
            topic: d.topic,
            difficulty: d.difficulty,
            examType: d.examType || null,
            cardCount: d.cardCount,
            createdAt: toDate(d.createdAt) || new Date(),
            updatedAt: toDate(d.updatedAt) || new Date(),
            lastStudiedAt: toDate(d.lastStudiedAt),
            masteryPercent: totalSeen > 0 ? Math.round((totalCorrect / totalSeen) * 100) : 0,
        });
    }

    return decks;
}

export async function getDeck(uid: string, deckId: string): Promise<Deck | null> {
    const firestore = getDb();
    const ref = doc(firestore, 'users', uid, 'decks', deckId);
    const snap = await withTimeout(getDoc(ref), 10000, `getDeck(${deckId})`);
    if (!snap.exists()) return null;
    const d = snap.data();
    return {
        id: snap.id,
        title: d.title,
        topic: d.topic,
        difficulty: d.difficulty,
        examType: d.examType || null,
        cardCount: d.cardCount,
        createdAt: toDate(d.createdAt) || new Date(),
        updatedAt: toDate(d.updatedAt) || new Date(),
        lastStudiedAt: toDate(d.lastStudiedAt),
    };
}

export async function getDeckCards(uid: string, deckId: string): Promise<FlashCard[]> {
    const firestore = getDb();
    const cardsRef = collection(firestore, 'users', uid, 'decks', deckId, 'cards');
    const snapshot = await withTimeout(getDocs(cardsRef), 10000, `getDeckCards(${deckId})`);

    return snapshot.docs.map((d) => {
        const data = d.data();
        return {
            id: d.id,
            question: data.question,
            answer: data.answer,
            hint: data.hint,
            seenCount: data.seenCount || 0,
            correctCount: data.correctCount || 0,
            lastSeenAt: toDate(data.lastSeenAt),
            createdAt: toDate(data.createdAt) || new Date(),
        };
    });
}

export async function updateCardStats(
    uid: string,
    deckId: string,
    cardId: string,
    correct: boolean
): Promise<void> {
    const firestore = getDb();
    const cardRef = doc(firestore, 'users', uid, 'decks', deckId, 'cards', cardId);
    const snap = await getDoc(cardRef);
    if (!snap.exists()) return;

    const data = snap.data();
    await updateDoc(cardRef, {
        seenCount: (data.seenCount || 0) + 1,
        correctCount: (data.correctCount || 0) + (correct ? 1 : 0),
        lastSeenAt: serverTimestamp(),
    });

    // Also update the deck's lastStudiedAt
    const deckRef = doc(firestore, 'users', uid, 'decks', deckId);
    await updateDoc(deckRef, { lastStudiedAt: serverTimestamp() });
}

export async function deleteDeck(uid: string, deckId: string): Promise<void> {
    const firestore = getDb();
    // Delete all cards first
    const cardsRef = collection(firestore, 'users', uid, 'decks', deckId, 'cards');
    const cardsSnap = await getDocs(cardsRef);
    const batch = writeBatch(firestore);
    cardsSnap.docs.forEach((d) => batch.delete(d.ref));
    await batch.commit();

    // Delete deck
    await deleteDoc(doc(firestore, 'users', uid, 'decks', deckId));
}

export async function regenerateDeck(
    uid: string,
    deckId: string,
    newTitle: string,
    newCards: GeneratedCard[]
): Promise<void> {
    const firestore = getDb();
    // Delete existing cards
    const cardsRef = collection(firestore, 'users', uid, 'decks', deckId, 'cards');
    const cardsSnap = await getDocs(cardsRef);
    const deleteBatch = writeBatch(firestore);
    cardsSnap.docs.forEach((d) => deleteBatch.delete(d.ref));
    await deleteBatch.commit();

    // Update deck metadata
    const deckRef = doc(firestore, 'users', uid, 'decks', deckId);
    await updateDoc(deckRef, {
        title: newTitle,
        cardCount: newCards.length,
        updatedAt: serverTimestamp(),
        lastStudiedAt: null,
    });

    // Add new cards
    const addBatch = writeBatch(firestore);
    for (const card of newCards) {
        const cardRef = doc(collection(firestore, 'users', uid, 'decks', deckId, 'cards'));
        addBatch.set(cardRef, {
            question: card.question,
            answer: card.answer,
            hint: card.hint,
            seenCount: 0,
            correctCount: 0,
            lastSeenAt: null,
            createdAt: serverTimestamp(),
        });
    }
    await addBatch.commit();
}
