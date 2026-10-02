/**
 * OfficeAIM Library & Loan Tracker - IndexedDB Database Service
 * Provides persistent browser storage for library inventory, custom genres, loan state,
 * and original raw AI scan audit logs.
 */

const DB_NAME = 'OfficeAIM_LibraryDB';
const DB_VERSION = 1;

export const DEFAULT_GENRES = [
  'Aventura',
  'Ciencia Ficción',
  'Fantasía',
  'Misterio/Suspenso',
  'Romance',
  'Historia',
  'Literatura Infantil',
  'No Ficción',
  'Cómics/Novela Gráfica',
  'Poesía',
  'Biografía',
];

function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;

      if (!db.objectStoreNames.contains('books')) {
        const bookStore = db.createObjectStore('books', { keyPath: 'id' });
        bookStore.createIndex('genre', 'genre', { unique: false });
        bookStore.createIndex('status', 'status', { unique: false });
        bookStore.createIndex('title', 'title', { unique: false });
        bookStore.createIndex('author', 'author', { unique: false });
      }

      if (!db.objectStoreNames.contains('genres')) {
        db.createObjectStore('genres', { keyPath: 'name' });
      }
    };

    request.onsuccess = (event) => resolve(event.target.result);
    request.onerror = (event) => reject(event.target.error);
  });
}

/**
 * Fetch all stored books from IndexedDB
 */
export async function getAllBooks() {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('books', 'readonly');
    const store = tx.objectStore('books');
    const request = store.getAll();

    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Save a new book or update an existing book
 */
export async function saveBook(book) {
  const db = await openDB();
  const now = new Date().toISOString();
  const formattedBook = {
    id: book.id || `book_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    title: book.title || '[ilegible]',
    author: book.author || '[ilegible]',
    genre: book.genre || 'Sin clasificar',
    status: book.status || 'disponible', // 'disponible' | 'prestado'
    borrower: book.borrower || '',
    loan_date: book.loan_date || '',
    image_thumbnail: book.image_thumbnail || null,
    raw_ai_reading: book.raw_ai_reading || null, // audit trail of original AI extraction
    created_at: book.created_at || now,
    updated_at: now,
  };

  return new Promise((resolve, reject) => {
    const tx = db.transaction('books', 'readwrite');
    const store = tx.objectStore('books');
    const request = store.put(formattedBook);

    request.onsuccess = () => resolve(formattedBook);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Delete a book by ID
 */
export async function deleteBook(id) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('books', 'readwrite');
    const store = tx.objectStore('books');
    const request = store.delete(id);

    request.onsuccess = () => resolve(true);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Get all custom user-added genres
 */
export async function getCustomGenres() {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('genres', 'readonly');
    const store = tx.objectStore('genres');
    const request = store.getAll();

    request.onsuccess = () => {
      const customList = (request.result || []).map((g) => g.name);
      resolve(customList);
    };
    request.onerror = () => reject(request.error);
  });
}

/**
 * Add a new custom genre
 */
export async function saveCustomGenre(genreName) {
  const name = genreName.trim();
  if (!name) return;

  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('genres', 'readwrite');
    const store = tx.objectStore('genres');
    const request = store.put({ name, created_at: new Date().toISOString() });

    request.onsuccess = () => resolve(name);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Check imported books against existing database for duplicate title + author matches
 */
export async function findDuplicateBooks(importedBooks) {
  const existingBooks = await getAllBooks();
  const duplicates = [];

  const existingMap = new Map();
  existingBooks.forEach((b) => {
    const key = `${(b.title || '').trim().toLowerCase()}|||${(b.author || '').trim().toLowerCase()}`;
    existingMap.set(key, b);
  });

  importedBooks.forEach((imp) => {
    const key = `${(imp.title || '').trim().toLowerCase()}|||${(imp.author || '').trim().toLowerCase()}`;
    if (existingMap.has(key)) {
      duplicates.push({
        imported: imp,
        existing: existingMap.get(key),
      });
    }
  });

  return duplicates;
}

/**
 * Bulk import books with per-book conflict resolution strategies:
 * conflictResolutions: Map<key, 'overwrite' | 'keep_both' | 'skip'>
 */
export async function importBooksWithResolutions(importedBooks, conflictResolutions = {}) {
  const existingBooks = await getAllBooks();
  const existingMap = new Map();
  existingBooks.forEach((b) => {
    const key = `${(b.title || '').trim().toLowerCase()}|||${(b.author || '').trim().toLowerCase()}`;
    existingMap.set(key, b);
  });

  const db = await openDB();
  const savedList = [];

  for (const item of importedBooks) {
    const key = `${(item.title || '').trim().toLowerCase()}|||${(item.author || '').trim().toLowerCase()}`;
    const existing = existingMap.get(key);

    let bookToSave = null;

    if (existing) {
      const resolution = conflictResolutions[key] || 'keep_both';
      if (resolution === 'skip') {
        continue;
      } else if (resolution === 'overwrite') {
        bookToSave = {
          ...item,
          id: existing.id, // keep existing ID to overwrite
          updated_at: new Date().toISOString(),
        };
      } else {
        // keep_both: generate new ID
        bookToSave = {
          ...item,
          id: `book_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          updated_at: new Date().toISOString(),
        };
      }
    } else {
      bookToSave = {
        ...item,
        id: item.id || `book_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        updated_at: new Date().toISOString(),
      };
    }

    if (bookToSave) {
      await saveBook(bookToSave);
      savedList.push(bookToSave);
    }
  }

  return savedList;
}
