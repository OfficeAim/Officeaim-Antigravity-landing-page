import React, { useState, useEffect, useRef } from 'react';
import {
  BookOpen,
  Camera,
  Upload,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet,
  Download,
  Plus,
  UserCheck,
  RotateCcw,
  Settings,
  Trash2,
  Search,
  Key,
  X,
  ChevronDown,
  ChevronRight,
  HelpCircle,
  Globe,
  ExternalLink,
} from 'lucide-react';
import toast from 'react-hot-toast';
import {
  getAllBooks,
  saveBook,
  deleteBook,
  getCustomGenres,
  saveCustomGenre,
  findDuplicateBooks,
  importBooksWithResolutions,
  DEFAULT_GENRES,
} from '../services/libraryDb';
import { analyzeBookCovers } from '../services/geminiVision';
import { exportLibraryToExcel, parseExcelFile } from '../services/excelEngine';

// --- INTERNATIONALIZATION (i18n) DICTIONARY ---
const TRANSLATIONS = {
  en: {
    title: 'OfficeAIM Library & Loan Tracker',
    subtitle: 'AI Vision Inventory Management, Student Loan Tracking, and Multi-Sheet Excel Export.',
    apiKeyBtn: 'Configure API Key',
    importExcelBtn: 'Import Excel',
    downloadExcelBtn: 'Download Excel (.xlsx)',
    totalBooks: 'Total Books',
    currentlyLoaned: 'Currently Loaned',
    unclassified: 'Unclassified / Review',
    ingestTitle: '1. AI Vision Book Scanner',
    ingestSubtitle: 'Upload cover photos (mandatory front cover + optional back cover for genre icon detection).',
    manualEntryBtn: 'Manual Entry (No AI)',
    frontCoverLabel: 'Front Cover (Mandatory)',
    frontCoverSub: 'Title & Author',
    frontCoverDrop: 'Drag or select Front Cover',
    frontCoverTypes: 'Supports JPG, PNG, WEBP',
    backCoverLabel: 'Back Cover / Spine (Optional)',
    backCoverSub: 'Genre Icon or Summary',
    backCoverDrop: 'Drag or select Back Cover',
    backCoverTypes: 'Helps classify genre by icon',
    clearImages: 'Clear images',
    scanningProgress1: 'Scanning cover text (OCR)...',
    scanningProgress2: 'Identifying genre & icons...',
    scanningProgress3: 'Formatting author names (Surname, First)...',
    scanBtn: 'Scan with Vision AI',
    scanningBtn: 'Scanning...',
    inventoryTitle: '2. Interactive Inventory & Loan Registry',
    inventorySubtitle: 'Edit cells directly, manage genres, and track student loans.',
    searchPlaceholder: 'Search by title, author, or student...',
    allGenres: 'All Genres',
    addGenreBtn: '+ Add Custom Genre',
    noBooksTitle: 'No books registered yet',
    noBooksSub: 'Scan book covers or add entries manually to build your inventory.',
    colTitle: 'Title',
    colAuthor: 'Author (Surname, First)',
    colGenre: 'Genre',
    colLoanStatus: 'Loan Status',
    colBorrower: 'Loaned to',
    colLoanDate: 'Loan Date',
    colActions: 'Actions',
    statusAvailable: 'Available',
    statusLoaned: 'Loaned',
    btnBorrow: 'Borrow out (Leen uit)',
    btnReturn: 'Returned (Inleveren)',
    verifyTitle: 'Verification Step (Confirm AI Extracted Data)',
    verifyPhoto: 'Scanned Photo:',
    verifyNoPreview: 'No preview',
    verifyTitleLabel: 'Book Title:',
    verifyAuthorLabel: 'Author (Surname, First Name):',
    verifyGenreLabel: 'Assigned Genre:',
    verifyConfirmBtn: 'Confirm & Save to Inventory',
    verifyCancelBtn: 'Cancel',
    loanTitle: 'Register Book Loan (Leen uit)',
    loanBookSelected: 'Selected Book:',
    loanStudentLabel: 'Student / User Name:',
    loanStudentPlaceholder: 'e.g. Lucas Rodríguez',
    loanDateLabel: 'Loan Date:',
    loanConfirmBtn: 'Confirm Loan',
    conflictTitle: 'Duplicate Conflict on Excel Import',
    conflictSub: 'book(s) detected in Excel that already exist in database (same Title + Author).',
    conflictChoose: 'Select how to resolve duplicates:',
    conflictKeepBoth: 'Keep both as separate entries (Recommended)',
    conflictOverwrite: 'Overwrite existing data in database',
    conflictSkip: 'Skip duplicates (Do not import existing records)',
    conflictProcessBtn: 'Process Import',
    addGenreTitle: 'Add Custom Genre',
    addGenreLabel: 'New category name:',
    addGenrePlaceholder: 'e.g. Philosophy, Art, Mythology...',
    addGenreSaveBtn: 'Save Genre',
    manualTitle: 'Manual Book Entry',
    manualTitleLabel: 'Book Title:',
    manualAuthorLabel: 'Author (Surname, First):',
    manualGenreLabel: 'Genre:',
    manualSaveBtn: 'Save to Inventory',
    apiKeyTitle: 'Gemini API Key Configuration',
    apiKeySub: 'The vision feature uses Google Gemini free API (gemini-3.6-flash / gemini-3.5-flash). Get your free key at',
    apiKeyLabel: 'Google Gemini API Key:',
    apiKeyPrivacy: '🔒 Total Privacy: Your key is stored exclusively in your browser (localStorage). It is never sent to intermediate servers.',
    apiKeySaveBtn: 'Save API Key',
    unreadable: '[unreadable]',
    unclassifiedTag: 'Unclassified',
    genres: {
      'Sin clasificar': 'Unclassified',
      Aventura: 'Adventure',
      'Ciencia Ficción': 'Science Fiction',
      Fantasía: 'Fantasy',
      'Misterio/Suspenso': 'Mystery & Thriller',
      Romance: 'Romance',
      Historia: 'History',
      'Literatura Infantil': "Children's Books",
      'No Ficción': 'Non-Fiction',
      'Cómics/Novela Gráfica': 'Comics & Graphic Novels',
      Poesía: 'Poetry',
      Biografía: 'Biography',
    },
  },
  nl: {
    title: 'OfficeAIM Library & Loan Tracker',
    subtitle: 'AI Vision voorraadbeheer, uitleenadministratie voor leerlingen en Excel-export met meerdere tabbladen.',
    apiKeyBtn: 'API-sleutel instellen',
    importExcelBtn: 'Excel importeren',
    downloadExcelBtn: 'Excel downloaden (.xlsx)',
    totalBooks: 'Totaal aantal boeken',
    currentlyLoaned: 'Momenteel uitgeleend',
    unclassified: 'Niet ingedeeld / Controleren',
    ingestTitle: '1. AI Vision Boekscanner',
    ingestSubtitle: 'Upload omslagfoto\'s (verplichte voorkant + optionele achterkant voor genre-icoondetectie).',
    manualEntryBtn: 'Handmatig invoeren (zonder AI)',
    frontCoverLabel: 'Voorkant omslag (Verplicht)',
    frontCoverSub: 'Titel & Auteur',
    frontCoverDrop: 'Sleep of selecteer de voorkant',
    frontCoverTypes: 'Ondersteunt JPG, PNG, WEBP',
    backCoverLabel: 'Achterkant / Rug (Optioneel)',
    backCoverSub: 'Genre-icoon of samenvatting',
    backCoverDrop: 'Sleep of selecteer de achterkant',
    backCoverTypes: 'Helpt genre te classificeren op pictogram',
    clearImages: 'Afbeeldingen wissen',
    scanningProgress1: 'Omslagtekst scannen (OCR)...',
    scanningProgress2: 'Genre & pictogrammen identificeren...',
    scanningProgress3: 'Auteursnamen formatteren (Achternaam, Voornaam)...',
    scanBtn: 'Scannen met Vision AI',
    scanningBtn: 'Scannen...',
    inventoryTitle: '2. Interactieve Inventaris & Uitleenregister',
    inventorySubtitle: 'Bewerk cellen rechtstreeks, beheers genres en houd uitleningen aan leerlingen bij.',
    searchPlaceholder: 'Zoek op titel, auteur of leerling...',
    allGenres: 'Alle genres',
    addGenreBtn: '+ Aangepast genre toevoegen',
    noBooksTitle: 'Nog geen boeken geregistreerd',
    noBooksSub: 'Scan boekomslagen of voeg handmatig invoer toe om uw inventaris op te bouwen.',
    colTitle: 'Titel',
    colAuthor: 'Schrijver (Achternaam, Voornaam)',
    colGenre: 'Genre',
    colLoanStatus: 'Uitleenstatus',
    colBorrower: 'Uitgeleend aan',
    colLoanDate: 'Uitleendatum',
    colActions: 'Acties',
    statusAvailable: 'Beschikbaar',
    statusLoaned: 'Uitgeleend',
    btnBorrow: 'Leen uit',
    btnReturn: 'Ingeleverd',
    verifyTitle: 'Verificatiestap (Bevestig door AI geëxtraheerde gegevens)',
    verifyPhoto: 'Gescande foto:',
    verifyNoPreview: 'Geen voorbeeld',
    verifyTitleLabel: 'Boektitel:',
    verifyAuthorLabel: 'Schrijver (Achternaam, Voornaam):',
    verifyGenreLabel: 'Toegewezen genre:',
    verifyConfirmBtn: 'Bevestigen & opslaan in inventaris',
    verifyCancelBtn: 'Annuleren',
    loanTitle: 'Boek lenen (Leen uit)',
    loanBookSelected: 'Geselecteerd boek:',
    loanStudentLabel: 'Naam leerling / gebruiker:',
    loanStudentPlaceholder: 'bijv. Lucas Rodríguez',
    loanDateLabel: 'Uitleendatum:',
    loanConfirmBtn: 'Lening bevestigen',
    conflictTitle: 'Dubbel conflict bij Excel-import',
    conflictSub: 'boek(en) gedetecteerd in Excel die al in de database bestaan (dezelfde Titel + Schrijver).',
    conflictChoose: 'Selecteer hoe dubbelen moeten worden opgelost:',
    conflictKeepBoth: 'Beide behouden als afzonderlijke vermeldingen (Aanbevolen)',
    conflictOverwrite: 'Bestaande gegevens in database overschrijven',
    conflictSkip: 'Dubbelen overslaan (Bestaande records niet importeren)',
    conflictProcessBtn: 'Import verwerken',
    addGenreTitle: 'Aangepast genre toevoegen',
    addGenreLabel: 'Nieuwe categorienaam:',
    addGenrePlaceholder: 'bijv. Filosofie, Kunst, Mythologie...',
    addGenreSaveBtn: 'Genre opslaan',
    manualTitle: 'Handmatige boekinvoer',
    manualTitleLabel: 'Boektitel:',
    manualAuthorLabel: 'Schrijver (Achternaam, Voornaam):',
    manualGenreLabel: 'Genre:',
    manualSaveBtn: 'Opslaan in inventaris',
    apiKeyTitle: 'Gemini API-sleutel configuratie',
    apiKeySub: 'De visiefunctie maakt gebruik van Google Gemini gratis API (gemini-3.6-flash / gemini-3.5-flash). Haal uw gratis sleutel op via',
    apiKeyLabel: 'Google Gemini API-sleutel:',
    apiKeyPrivacy: '🔒 Totale privacy: Uw sleutel wordt uitsluitend opgeslagen in uw browser (localStorage). Deze wordt nooit naar tussenliggende servers verzonden.',
    apiKeySaveBtn: 'API-sleutel opslaan',
    unreadable: '[onleesbaar]',
    unclassifiedTag: 'Niet ingedeeld',
    genres: {
      'Sin clasificar': 'Niet ingedeeld',
      Aventura: 'Avontuur',
      'Ciencia Ficción': 'Sciencefiction',
      Fantasía: 'Fantasie',
      'Misterio/Suspenso': 'Mysterie & Thriller',
      Romance: 'Romantiek',
      Historia: 'Geschiedenis',
      'Literatura Infantil': 'Kinderboeken',
      'No Ficción': 'Non-fictie',
      'Cómics/Novela Gráfica': 'Stripboeken & Graphic Novels',
      Poesía: 'Poëzie',
      Biografía: 'Biografie',
    },
  },
};

export default function LibraryTracker({ standalone = false }) {
  // --- Language State (Default: English) ---
  const [lang, setLang] = useState('en');

  // --- State Management ---
  const [books, setBooks] = useState([]);
  const [customGenres, setCustomGenres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterGenre, setFilterGenre] = useState('all');

  // API Key drawer / settings
  const [apiKey, setApiKey] = useState('');
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  // Ingest state
  const [frontImage, setFrontImage] = useState(null);
  const [frontPreview, setFrontPreview] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanStepText, setScanStepText] = useState('');

  // Verification Modal State
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [pendingBook, setPendingBook] = useState(null);

  // Loan Modal State
  const [showLoanModal, setShowLoanModal] = useState(false);
  const [loanBookTarget, setLoanBookTarget] = useState(null);
  const [borrowerName, setBorrowerName] = useState('');
  const [loanDate, setLoanDate] = useState(new Date().toISOString().split('T')[0]);

  // Custom Genre Modal State
  const [showGenreModal, setShowGenreModal] = useState(false);
  const [newGenreName, setNewGenreName] = useState('');

  // Excel Import Conflict Resolution Modal State
  const [showConflictModal, setShowConflictModal] = useState(false);
  const [importDuplicates, setImportDuplicates] = useState([]);
  const [allImportedBooks, setAllImportedBooks] = useState([]);
  const [globalConflictStrategy, setGlobalConflictStrategy] = useState('keep_both');

  // Manual Add Modal State
  const [showManualModal, setShowManualModal] = useState(false);
  const [manualForm, setManualForm] = useState({
    title: '',
    author: '',
    genre: 'Sin clasificar',
  });

  // Collapsible Genre Groups
  const [collapsedGenres, setCollapsedGenres] = useState({});

  const frontInputRef = useRef(null);
  const excelInputRef = useRef(null);

  // Helper i18n translation accessor
  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;

  const translateGenre = (genreKey) => {
    return t.genres[genreKey] || genreKey;
  };

  // Combine Default Genres + User Custom Genres
  const allGenreOptions = Array.from(new Set([...DEFAULT_GENRES, ...customGenres]));

  // Active Key Check (Optional user-provided override key; falls back to server-side /.netlify/functions/gemini)
  const currentActiveKey = apiKey || localStorage.getItem('OFFICEAIM_LIBRARY_GEMINI_KEY') || '';
  const hasValidApiKey = Boolean(currentActiveKey && currentActiveKey.trim().length >= 15);

  // --- Initial Load ---
  useEffect(() => {
    loadLibraryData();
    const storedKey = localStorage.getItem('OFFICEAIM_LIBRARY_GEMINI_KEY') || '';
    setApiKey(storedKey);
    const savedLang = localStorage.getItem('OFFICEAIM_LIBRARY_LANG') || 'en';
    setLang(savedLang);
  }, []);

  const handleLanguageChange = (newLang) => {
    setLang(newLang);
    localStorage.setItem('OFFICEAIM_LIBRARY_LANG', newLang);
    toast.success(newLang === 'nl' ? 'Taal ingesteld op Nederlands' : 'Language set to English');
  };

  const loadLibraryData = async () => {
    setLoading(true);
    try {
      const storedBooks = await getAllBooks();
      const storedCustomGenres = await getCustomGenres();
      setBooks(storedBooks);
      setCustomGenres(storedCustomGenres);
    } catch (err) {
      console.error('Error loading database:', err);
      toast.error('Error loading local IndexedDB database.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveApiKey = () => {
    localStorage.setItem('OFFICEAIM_LIBRARY_GEMINI_KEY', apiKey.trim());
    setShowSettingsModal(false);
    toast.success(lang === 'nl' ? 'API-sleutel opgeslagen in localStorage.' : 'API Key saved in localStorage.');
  };

  // --- Photo Ingest & Vision AI Scanning ---
  const handleFrontImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFrontImage(file);
      setFrontPreview(URL.createObjectURL(file));
    }
  };

  const handleClearImages = () => {
    setFrontImage(null);
    setFrontPreview(null);
  };

  const handleStartScan = async () => {
    if (!frontImage) {
      toast.error(lang === 'nl' ? 'Selecteer ten minste de foto van de voorkant.' : 'Select at least the front cover photo.');
      return;
    }

    const currentKey = (apiKey || localStorage.getItem('OFFICEAIM_LIBRARY_GEMINI_KEY') || '').trim();

    setIsScanning(true);
    setScanStepText(t.scanningProgress1);

    let t1 = null;
    let t2 = null;

    try {
      t1 = setTimeout(() => {
        setScanStepText(t.scanningProgress2);
      }, 1200);

      t2 = setTimeout(() => {
        setScanStepText(t.scanningProgress3);
      }, 2400);

      const filesToProcess = [frontImage];
      const aiResult = await analyzeBookCovers(filesToProcess, currentKey, allGenreOptions);

      setPendingBook({
        id: `book_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        title: aiResult.title === '[ilegible]' ? t.unreadable : aiResult.title,
        author: aiResult.author === '[ilegible]' ? t.unreadable : aiResult.author,
        genre: aiResult.genre,
        status: 'disponible',
        borrower: '',
        loan_date: '',
        image_thumbnail: frontPreview,
        raw_ai_reading: aiResult.raw_ai_reading,
        surname_uncertain: aiResult.surname_uncertain,
        low_confidence_fields: aiResult.low_confidence_fields,
      });

      setShowVerifyModal(true);
      toast.success(lang === 'nl' ? 'Analyse voltooid. Controleer de geëxtraheerde gegevens.' : 'Scan complete. Please verify extracted data.');
    } catch (err) {
      console.error('Scan error:', err);
      toast.error(err.message || 'Vision AI scan failed.');
    } finally {
      if (t1) clearTimeout(t1);
      if (t2) clearTimeout(t2);
      setIsScanning(false);
      setScanStepText('');
    }
  };

  // --- Confirm Book in Verification Modal ---
  const handleConfirmVerification = async () => {
    if (!pendingBook) return;

    try {
      const saved = await saveBook(pendingBook);
      setBooks((prev) => [saved, ...prev.filter((b) => b.id !== saved.id)]);
      setShowVerifyModal(false);
      setPendingBook(null);
      handleClearImages();
      toast.success(lang === 'nl' ? 'Boek geverifieerd en opgeslagen.' : 'Book verified and saved to inventory.');
    } catch (err) {
      toast.error('IndexedDB Save Error: ' + err.message);
    }
  };

  // --- Quick Loan Management ---
  const handleOpenLoanModal = (book) => {
    setLoanBookTarget(book);
    setBorrowerName(book.borrower || '');
    setLoanDate(book.loan_date || new Date().toISOString().split('T')[0]);
    setShowLoanModal(true);
  };

  const handleConfirmLoan = async () => {
    if (!loanBookTarget) return;
    if (!borrowerName.trim()) {
      toast.error(lang === 'nl' ? 'Voer de naam van de leerling of gebruiker in.' : 'Enter student or user name.');
      return;
    }

    const updated = {
      ...loanBookTarget,
      status: 'prestado',
      borrower: borrowerName.trim(),
      loan_date: loanDate,
    };

    try {
      await saveBook(updated);
      setBooks((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
      setShowLoanModal(false);
      setLoanBookTarget(null);
      setBorrowerName('');
      toast.success(lang === 'nl' ? `Boek uitgeleend aan ${borrowerName.trim()}.` : `Book loaned out to ${borrowerName.trim()}.`);
    } catch {
      toast.error('Loan Record Error');
    }
  };

  const handleReturnBook = async (book) => {
    const updated = {
      ...book,
      status: 'disponible',
      borrower: '',
      loan_date: '',
    };

    try {
      await saveBook(updated);
      setBooks((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
      toast.success(lang === 'nl' ? 'Boek ingeleverd en beschikbaar.' : 'Book returned to available status.');
    } catch {
      toast.error('Return Error');
    }
  };

  const handleDeleteBook = async (bookId) => {
    const confirmMsg = lang === 'nl' ? 'Weet u zeker dat u dit boek wilt verwijderen?' : 'Are you sure you want to delete this book from inventory?';
    if (!window.confirm(confirmMsg)) return;

    try {
      await deleteBook(bookId);
      setBooks((prev) => prev.filter((b) => b.id !== bookId));
      toast.success(lang === 'nl' ? 'Boek verwijderd.' : 'Book deleted.');
    } catch {
      toast.error('Delete Error');
    }
  };

  // --- Add Custom Genre ---
  const handleAddCustomGenre = async () => {
    const name = newGenreName.trim();
    if (!name) {
      toast.error(lang === 'nl' ? 'Voer de categorienaam in.' : 'Enter category name.');
      return;
    }

    try {
      await saveCustomGenre(name);
      setCustomGenres((prev) => [...new Set([...prev, name])]);
      setNewGenreName('');
      setShowGenreModal(false);
      toast.success(lang === 'nl' ? `Genre "${name}" toegevoegd.` : `Genre "${name}" added successfully.`);
    } catch {
      toast.error('Genre Save Error');
    }
  };

  // --- Add Manual Book ---
  const handleSaveManualBook = async () => {
    if (!manualForm.title.trim() || !manualForm.author.trim()) {
      toast.error(lang === 'nl' ? 'Vul titel en auteur in.' : 'Fill in title and author.');
      return;
    }

    const newBook = {
      title: manualForm.title.trim(),
      author: manualForm.author.trim(),
      genre: manualForm.genre,
      status: 'disponible',
    };

    try {
      const saved = await saveBook(newBook);
      setBooks((prev) => [saved, ...prev]);
      setShowManualModal(false);
      setManualForm({ title: '', author: '', genre: 'Sin clasificar' });
      toast.success(lang === 'nl' ? 'Boek handmatig geregistreerd.' : 'Book registered manually.');
    } catch {
      toast.error('Manual Save Error');
    }
  };

  // --- Excel Import & Conflict Handling ---
  const handleFileImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const parsed = await parseExcelFile(file);
      if (parsed.length === 0) {
        toast.error(lang === 'nl' ? 'Geen boeken gevonden in het Excel-bestand.' : 'No book records found in Excel file.');
        return;
      }

      const duplicates = await findDuplicateBooks(parsed);

      if (duplicates.length > 0) {
        setAllImportedBooks(parsed);
        setImportDuplicates(duplicates);
        setShowConflictModal(true);
      } else {
        const saved = await importBooksWithResolutions(parsed);
        loadLibraryData();
        toast.success(lang === 'nl' ? `Import geslaagd! ${saved.length} boeken geladen.` : `Import successful! ${saved.length} books loaded.`);
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      e.target.value = '';
    }
  };

  const handleConfirmImportConflict = async () => {
    const resolutionsMap = {};
    importDuplicates.forEach((dup) => {
      const key = `${(dup.imported.title || '').trim().toLowerCase()}|||${(dup.imported.author || '').trim().toLowerCase()}`;
      resolutionsMap[key] = globalConflictStrategy;
    });

    try {
      const saved = await importBooksWithResolutions(allImportedBooks, resolutionsMap);
      await loadLibraryData();
      setShowConflictModal(false);
      setAllImportedBooks([]);
      setImportDuplicates([]);
      toast.success(lang === 'nl' ? `Import voltooid (${saved.length} records verwerkt).` : `Import finished (${saved.length} records processed).`);
    } catch {
      toast.error('Import Error');
    }
  };

  // --- Excel Export ---
  const handleExportExcel = () => {
    if (books.length === 0) {
      toast.error(lang === 'nl' ? 'Geen boeken om te exporteren.' : 'No books in inventory to export.');
      return;
    }
    exportLibraryToExcel(books, customGenres);
    toast.success(lang === 'nl' ? 'Excel-bestand gedownload.' : 'Excel file downloaded successfully.');
  };

  // --- Inline Field Edit in Grid ---
  const handleUpdateBookField = async (bookId, field, value) => {
    const target = books.find((b) => b.id === bookId);
    if (!target) return;

    const updated = { ...target, [field]: value };
    try {
      await saveBook(updated);
      setBooks((prev) => prev.map((b) => (b.id === bookId ? updated : b)));
    } catch {
      toast.error('Update Error');
    }
  };

  // --- Computed Metrics ---
  const totalBooksCount = books.length;
  const totalLoanedCount = books.filter((b) => b.status === 'prestado').length;
  const totalUnclassifiedCount = books.filter((b) => b.genre === 'Sin clasificar' || !b.genre).length;

  // Filtered & Grouped Books
  const filteredBooks = books.filter((b) => {
    const matchesSearch =
      (b.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (b.author || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (b.borrower || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesGenre = filterGenre === 'all' || b.genre === filterGenre;
    return matchesSearch && matchesGenre;
  });

  // Group by Genre
  const groupedBooks = {};
  filteredBooks.forEach((b) => {
    const g = b.genre || 'Sin clasificar';
    if (!groupedBooks[g]) groupedBooks[g] = [];
    groupedBooks[g].push(b);
  });

  const sortedGenreKeys = Object.keys(groupedBooks).sort((a, b) => {
    if (a === 'Sin clasificar') return -1;
    if (b === 'Sin clasificar') return 1;
    return a.localeCompare(b);
  });

  const toggleGenreCollapse = (genreName) => {
    setCollapsedGenres((prev) => ({ ...prev, [genreName]: !prev[genreName] }));
  };

  const containerClasses = standalone
    ? 'min-h-screen bg-[#070A12] p-4 md:p-10 space-y-8 text-white font-plus-jakarta max-w-7xl mx-auto'
    : 'p-4 md:p-8 max-w-7xl mx-auto space-y-8 text-white font-plus-jakarta';

  return (
    <div className={containerClasses}>
      {/* --- HEADER TITLE BAR & LANGUAGE TOGGLE --- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-card p-6 border-cyan-500/20 bg-[#070A12]/80 backdrop-blur-xl rounded-2xl shadow-[0_0_30px_rgba(34,211,238,0.15)]">
        <div>
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-3 bg-gradient-to-br from-cyan-500/20 to-amber-500/20 border border-cyan-400/30 rounded-xl">
              <BookOpen className="w-8 h-8 text-cyan-400" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white flex items-center gap-2">
                OfficeAIM <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-amber-400">Library & Loan Tracker</span>
              </h1>
              <p className="text-xs text-text-muted italic">{t.subtitle}</p>
            </div>
          </div>
        </div>

        {/* Action Controls & Language Switcher */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Language Switcher Toggle */}
          <div className="flex items-center bg-white/5 border border-white/10 rounded-xl p-1 text-xs">
            <Globe className="w-4 h-4 text-cyan-400 ml-2 mr-1" />
            <button
              onClick={() => handleLanguageChange('en')}
              className={`px-3 py-1 rounded-lg font-extrabold transition ${
                lang === 'en' ? 'bg-cyan-500 text-black shadow-[0_0_10px_rgba(34,211,238,0.4)]' : 'text-white/60 hover:text-white'
              }`}
            >
              🇬🇧 EN
            </button>
            <button
              onClick={() => handleLanguageChange('nl')}
              className={`px-3 py-1 rounded-lg font-extrabold transition ${
                lang === 'nl' ? 'bg-amber-500 text-black shadow-[0_0_10px_rgba(249,115,22,0.4)]' : 'text-white/60 hover:text-white'
              }`}
            >
              🇳🇱 NL
            </button>
          </div>

          {hasValidApiKey ? (
            <button
              onClick={() => setShowSettingsModal(true)}
              className="px-4 py-2.5 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-[0_0_12px_rgba(16,185,129,0.2)]"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>{lang === 'nl' ? '🔑 API Geconfigureerd' : '🔑 API Connected'}</span>
            </button>
          ) : (
            <button
              onClick={() => setShowSettingsModal(true)}
              className="px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl text-xs font-bold transition flex items-center gap-2"
            >
              <Settings className="w-4 h-4 text-cyan-400" />
              <span>{t.apiKeyBtn}</span>
            </button>
          )}

          <button
            onClick={() => excelInputRef.current?.click()}
            className="px-4 py-2.5 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 rounded-xl text-xs font-bold transition flex items-center gap-2"
          >
            <Upload className="w-4 h-4" />
            <span>{t.importExcelBtn}</span>
          </button>
          <input type="file" ref={excelInputRef} onChange={handleFileImport} accept=".xlsx, .xls" className="hidden" />

          <button
            onClick={handleExportExcel}
            className="px-4 py-2.5 bg-gradient-to-r from-cyan-500 to-amber-500 hover:from-cyan-400 hover:to-amber-400 text-black font-extrabold rounded-xl text-xs transition shadow-[0_0_15px_rgba(34,211,238,0.3)] flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            <span>{t.downloadExcelBtn}</span>
          </button>
        </div>
      </div>

      {/* --- LIVE COUNTERS BAR --- */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-card p-5 border-cyan-500/20 rounded-2xl flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-wider text-text-muted">{t.totalBooks}</p>
            <h3 className="text-3xl font-black text-white mt-1">{totalBooksCount}</h3>
          </div>
          <div className="p-3 bg-cyan-500/10 border border-cyan-500/30 rounded-xl text-cyan-400">
            <BookOpen className="w-6 h-6" />
          </div>
        </div>

        <div className="glass-card p-5 border-amber-500/30 rounded-2xl flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-wider text-amber-400">{t.currentlyLoaned}</p>
            <h3 className="text-3xl font-black text-amber-300 mt-1">{totalLoanedCount}</h3>
          </div>
          <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-400">
            <UserCheck className="w-6 h-6" />
          </div>
        </div>

        <div className="glass-card p-5 border-rose-500/30 rounded-2xl flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-wider text-rose-400">{t.unclassified}</p>
            <h3 className="text-3xl font-black text-rose-300 mt-1">{totalUnclassifiedCount}</h3>
          </div>
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* --- INGEST PANEL (SCAN WITH GEMINI VISION) --- */}
      <div className="glass-card p-6 border-cyan-500/20 bg-[#070A12]/90 backdrop-blur-xl rounded-2xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Camera className="w-5 h-5 text-cyan-400" />
              <span>{t.ingestTitle}</span>
            </h2>
            <p className="text-xs text-text-muted mt-0.5">{t.ingestSubtitle}</p>
          </div>

          <button
            onClick={() => setShowManualModal(true)}
            className="px-3.5 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 text-xs font-bold rounded-xl flex items-center gap-2 transition"
          >
            <Plus className="w-4 h-4 text-amber-400" />
            <span>{t.manualEntryBtn}</span>
          </button>
        </div>

        {/* Single Upload Area */}
        <div className="max-w-xl mx-auto space-y-2">
          <label className="text-xs font-bold text-cyan-300 flex items-center justify-between">
            <span>{t.frontCoverLabel}</span>
            <span className="text-[10px] text-text-muted">{t.frontCoverSub}</span>
          </label>

          <div
            onClick={() => frontInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition flex flex-col items-center justify-center min-h-[200px] ${
              frontPreview ? 'border-cyan-400 bg-cyan-500/5' : 'border-white/15 hover:border-cyan-400/50 bg-white/5'
            }`}
          >
            {frontPreview ? (
              <div className="relative group w-full flex flex-col items-center">
                <img src={frontPreview} alt="Book Cover" className="h-44 object-contain rounded-lg shadow-lg border border-cyan-500/30" />
                <p className="text-xs text-cyan-400 mt-3 font-bold">Click to change photo</p>
              </div>
            ) : (
              <>
                <Upload className="w-10 h-10 text-cyan-400 mb-3 animate-bounce" />
                <p className="text-sm font-bold text-white">{t.frontCoverDrop}</p>
                <p className="text-xs text-text-muted mt-1">{t.frontCoverTypes}</p>
              </>
            )}
          </div>
          <input type="file" ref={frontInputRef} onChange={handleFrontImageSelect} accept="image/*" className="hidden" />
        </div>

        {/* Scan Actions & Progress */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          {frontPreview && (
            <button onClick={handleClearImages} className="text-xs text-rose-400 hover:underline flex items-center gap-1">
              <Trash2 className="w-3.5 h-3.5" /> {t.clearImages}
            </button>
          )}

          <div className="flex-1 text-center sm:text-right">
            {isScanning && (
              <div className="inline-flex items-center gap-3 px-4 py-2 bg-cyan-500/10 border border-cyan-500/30 rounded-xl text-cyan-300 text-xs font-bold animate-pulse">
                <Sparkles className="w-4 h-4 animate-spin text-cyan-400" />
                <span>{scanStepText}</span>
              </div>
            )}
          </div>

          <button
            onClick={handleStartScan}
            disabled={isScanning || !frontImage}
            className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-cyan-500 to-amber-500 hover:from-cyan-400 hover:to-amber-400 text-black font-black rounded-xl text-xs transition shadow-[0_0_20px_rgba(34,211,238,0.4)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>{isScanning ? t.scanningBtn : t.scanBtn}</span>
          </button>
        </div>
      </div>

      {/* --- SPREADSHEET INVENTORY GRID VIEW --- */}
      <div className="glass-card p-6 border-white/10 bg-[#070A12]/90 backdrop-blur-xl rounded-2xl space-y-6">
        {/* Controls Toolbar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/10">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-cyan-400" />
              <span>{t.inventoryTitle}</span>
            </h2>
            <p className="text-xs text-text-muted mt-0.5">{t.inventorySubtitle}</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Search input */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-3 text-text-muted" />
              <input
                type="text"
                placeholder={t.searchPlaceholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-white placeholder-text-muted focus:outline-none focus:border-cyan-400 w-64"
              />
            </div>

            {/* Genre filter */}
            <select
              value={filterGenre}
              onChange={(e) => setFilterGenre(e.target.value)}
              className="px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-400"
            >
              <option value="all" className="bg-[#070A12]">{t.allGenres}</option>
              {allGenreOptions.map((g) => (
                <option key={g} value={g} className="bg-[#070A12]">
                  {translateGenre(g)}
                </option>
              ))}
            </select>

            {/* Add Custom Genre button */}
            <button
              onClick={() => setShowGenreModal(true)}
              className="px-3.5 py-2 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-bold rounded-xl flex items-center gap-1.5 transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{t.addGenreBtn}</span>
            </button>
          </div>
        </div>

        {/* Inventory Grouped Tables */}
        {loading ? (
          <div className="p-12 text-center text-text-muted text-xs font-bold animate-pulse">Loading database...</div>
        ) : sortedGenreKeys.length === 0 ? (
          <div className="p-12 text-center glass-card border-white/5 rounded-xl">
            <BookOpen className="w-12 h-12 text-text-muted mx-auto mb-3 opacity-40" />
            <h4 className="text-white font-bold text-sm">{t.noBooksTitle}</h4>
            <p className="text-xs text-text-muted mt-1 max-w-sm mx-auto">{t.noBooksSub}</p>
          </div>
        ) : (
          <div className="space-y-6">
            {sortedGenreKeys.map((genre) => {
              const genreBooksList = groupedBooks[genre];
              const isCollapsed = collapsedGenres[genre];
              const isUnclassifiedGroup = genre === 'Sin clasificar';
              const translatedGroupTitle = translateGenre(genre);

              return (
                <div
                  key={genre}
                  className={`rounded-2xl overflow-hidden border transition ${
                    isUnclassifiedGroup ? 'border-amber-500/40 bg-amber-500/5' : 'border-white/10 bg-white/5'
                  }`}
                >
                  {/* Genre Group Header */}
                  <div
                    onClick={() => toggleGenreCollapse(genre)}
                    className="p-4 flex items-center justify-between cursor-pointer select-none bg-white/5 hover:bg-white/10 transition"
                  >
                    <div className="flex items-center space-x-3">
                      {isCollapsed ? <ChevronRight className="w-4 h-4 text-cyan-400" /> : <ChevronDown className="w-4 h-4 text-cyan-400" />}
                      <h3 className={`font-bold text-sm flex items-center gap-2 ${isUnclassifiedGroup ? 'text-amber-300 font-black' : 'text-white'}`}>
                        <span>{translatedGroupTitle}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-white/80 font-mono">
                          {genreBooksList.length}
                        </span>
                      </h3>
                    </div>

                    {isUnclassifiedGroup && (
                      <span className="text-[10px] font-bold text-amber-400 flex items-center gap-1 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/30">
                        <AlertTriangle className="w-3 h-3" /> {t.unclassified}
                      </span>
                    )}
                  </div>

                  {/* Genre Group Table */}
                  {!isCollapsed && (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs text-white">
                        <thead className="bg-black/40 text-[10px] font-black uppercase text-text-muted tracking-wider border-y border-white/10">
                          <tr>
                            <th className="p-3">{t.colTitle}</th>
                            <th className="p-3">{t.colAuthor}</th>
                            <th className="p-3">{t.colGenre}</th>
                            <th className="p-3">{t.colLoanStatus}</th>
                            <th className="p-3">{t.colBorrower}</th>
                            <th className="p-3">{t.colLoanDate}</th>
                            <th className="p-3 text-right">{t.colActions}</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {genreBooksList.map((book) => {
                            const isLoaned = book.status === 'prestado';
                            const hasIlegible = (book.title || '').includes('[ilegible]') || (book.author || '').includes('[ilegible]') || (book.title || '').includes('[unreadable]');

                            return (
                              <tr key={book.id} className={`hover:bg-white/5 transition ${hasIlegible ? 'bg-rose-500/5' : ''}`}>
                                {/* Title cell */}
                                <td className="p-3 font-bold">
                                  <input
                                    type="text"
                                    value={book.title}
                                    onChange={(e) => handleUpdateBookField(book.id, 'title', e.target.value)}
                                    className={`bg-transparent border-b border-transparent hover:border-cyan-400/50 focus:border-cyan-400 focus:bg-black/50 px-1 py-0.5 rounded w-full focus:outline-none ${
                                      book.title === t.unreadable || book.title === '[ilegible]' ? 'text-rose-400 font-mono italic' : 'text-white'
                                    }`}
                                  />
                                </td>

                                {/* Author cell */}
                                <td className="p-3">
                                  <input
                                    type="text"
                                    value={book.author}
                                    onChange={(e) => handleUpdateBookField(book.id, 'author', e.target.value)}
                                    className={`bg-transparent border-b border-transparent hover:border-cyan-400/50 focus:border-cyan-400 focus:bg-black/50 px-1 py-0.5 rounded w-full focus:outline-none ${
                                      book.author === t.unreadable || book.author === '[ilegible]' ? 'text-rose-400 font-mono italic' : 'text-text-muted'
                                    }`}
                                  />
                                </td>

                                {/* Genre dropdown cell */}
                                <td className="p-3">
                                  <select
                                    value={book.genre || 'Sin clasificar'}
                                    onChange={(e) => handleUpdateBookField(book.id, 'genre', e.target.value)}
                                    className={`bg-black/40 border border-white/10 rounded px-2 py-1 text-xs focus:outline-none focus:border-cyan-400 ${
                                      book.genre === 'Sin clasificar' ? 'text-amber-400 font-bold' : 'text-cyan-300'
                                    }`}
                                  >
                                    {allGenreOptions.map((g) => (
                                      <option key={g} value={g} className="bg-[#070A12]">
                                        {translateGenre(g)}
                                      </option>
                                    ))}
                                  </select>
                                </td>

                                {/* Loan status badge */}
                                <td className="p-3">
                                  {isLoaned ? (
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold text-[10px] shadow-[0_0_10px_rgba(249,115,22,0.2)]">
                                      <UserCheck className="w-3 h-3" /> {t.statusLoaned}
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold text-[10px]">
                                      <CheckCircle2 className="w-3 h-3" /> {t.statusAvailable}
                                    </span>
                                  )}
                                </td>

                                {/* Borrower */}
                                <td className="p-3 text-text-muted italic">{book.borrower || '-'}</td>

                                {/* Loan date */}
                                <td className="p-3 text-text-muted font-mono text-[11px]">{book.loan_date || '-'}</td>

                                {/* Actions */}
                                <td className="p-3 text-right space-x-2">
                                  {isLoaned ? (
                                    <button
                                      onClick={() => handleReturnBook(book)}
                                      className="px-2.5 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 rounded-lg text-[11px] font-bold transition inline-flex items-center gap-1"
                                      title={t.btnReturn}
                                    >
                                      <RotateCcw className="w-3 h-3" /> {t.btnReturn}
                                    </button>
                                  ) : (
                                    <button
                                      onClick={() => handleOpenLoanModal(book)}
                                      className="px-2.5 py-1 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 rounded-lg text-[11px] font-bold transition inline-flex items-center gap-1"
                                    >
                                      <UserCheck className="w-3 h-3" /> {t.btnBorrow}
                                    </button>
                                  )}

                                  <button
                                    onClick={() => handleDeleteBook(book.id)}
                                    className="p-1 hover:bg-rose-500/20 text-rose-400 rounded transition inline-block"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* --- MODAL 1: SIDE-BY-SIDE VERIFICATION STEP --- */}
      {showVerifyModal && pendingBook && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="glass-card max-w-3xl w-full border-cyan-500/30 bg-[#070A12] rounded-2xl p-6 space-y-6 shadow-[0_0_50px_rgba(34,211,238,0.2)]">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-cyan-400" />
                <span>{t.verifyTitle}</span>
              </h3>
              <button onClick={() => setShowVerifyModal(false)} className="text-text-muted hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Photo Thumbnail */}
              <div className="space-y-2">
                <p className="text-xs font-bold text-text-muted">{t.verifyPhoto}</p>
                <div className="border border-white/10 rounded-xl p-2 bg-black/40 flex items-center justify-center min-h-[220px]">
                  {pendingBook.image_thumbnail ? (
                    <img src={pendingBook.image_thumbnail} alt="Thumbnail" className="max-h-60 object-contain rounded" />
                  ) : (
                    <p className="text-xs text-text-muted">{t.verifyNoPreview}</p>
                  )}
                </div>
              </div>

              {/* Data Extraction Form */}
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-cyan-300 block mb-1">{t.verifyTitleLabel}</label>
                  <input
                    type="text"
                    value={pendingBook.title}
                    onChange={(e) => setPendingBook({ ...pendingBook, title: e.target.value })}
                    className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                  />
                  {(pendingBook.title === t.unreadable || pendingBook.title === '[ilegible]') && (
                    <p className="text-[10px] text-rose-400 mt-1 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" /> Unreadable title. Enter manually if possible.
                    </p>
                  )}
                </div>

                <div>
                  <label className="text-xs font-bold text-cyan-300 block mb-1">{t.verifyAuthorLabel}</label>
                  <input
                    type="text"
                    value={pendingBook.author}
                    onChange={(e) => setPendingBook({ ...pendingBook, author: e.target.value })}
                    className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                  />
                  {pendingBook.surname_uncertain && (
                    <p className="text-[10px] text-amber-400 mt-1 flex items-center gap-1">
                      <HelpCircle className="w-3 h-3" /> Please confirm compound surname formatting.
                    </p>
                  )}
                </div>

                <div>
                  <label className="text-xs font-bold text-cyan-300 block mb-1">{t.verifyGenreLabel}</label>
                  <select
                    value={pendingBook.genre}
                    onChange={(e) => setPendingBook({ ...pendingBook, genre: e.target.value })}
                    className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                  >
                    {allGenreOptions.map((g) => (
                      <option key={g} value={g} className="bg-[#070A12]">
                        {translateGenre(g)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
              <button
                onClick={() => setShowVerifyModal(false)}
                className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs font-bold"
              >
                {t.verifyCancelBtn}
              </button>
              <button
                onClick={handleConfirmVerification}
                className="px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-amber-500 hover:from-cyan-400 hover:to-amber-400 text-black font-extrabold rounded-xl text-xs transition shadow-[0_0_15px_rgba(34,211,238,0.3)]"
              >
                {t.verifyConfirmBtn}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL 2: QUICK LOAN MANAGER (LEEN UIT) --- */}
      {showLoanModal && loanBookTarget && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="glass-card max-w-md w-full border-amber-500/30 bg-[#070A12] rounded-2xl p-6 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <h3 className="text-lg font-bold text-amber-300 flex items-center gap-2">
                <UserCheck className="w-5 h-5" />
                <span>{t.loanTitle}</span>
              </h3>
              <button onClick={() => setShowLoanModal(false)} className="text-text-muted hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                <p className="text-[10px] text-text-muted font-bold uppercase">{t.loanBookSelected}</p>
                <p className="text-xs font-bold text-white">{loanBookTarget.title}</p>
                <p className="text-[11px] text-text-muted">{loanBookTarget.author}</p>
              </div>

              <div>
                <label className="text-xs font-bold text-white block mb-1">{t.loanStudentLabel}</label>
                <input
                  type="text"
                  placeholder={t.loanStudentPlaceholder}
                  value={borrowerName}
                  onChange={(e) => setBorrowerName(e.target.value)}
                  className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-white block mb-1">{t.loanDateLabel}</label>
                <input
                  type="date"
                  value={loanDate}
                  onChange={(e) => setLoanDate(e.target.value)}
                  className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
              <button onClick={() => setShowLoanModal(false)} className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs font-bold">
                {t.verifyCancelBtn}
              </button>
              <button
                onClick={handleConfirmLoan}
                className="px-5 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black font-extrabold rounded-xl text-xs shadow-[0_0_15px_rgba(249,115,22,0.3)]"
              >
                {t.loanConfirmBtn}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL 3: EXCEL IMPORT CONFLICT RESOLUTION --- */}
      {showConflictModal && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="glass-card max-w-xl w-full border-amber-500/40 bg-[#070A12] rounded-2xl p-6 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <h3 className="text-lg font-bold text-amber-300 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
                <span>{t.conflictTitle}</span>
              </h3>
            </div>

            <p className="text-xs text-text-muted">
              <span className="text-amber-300 font-bold">{importDuplicates.length}</span> {t.conflictSub}
            </p>

            <div className="space-y-3 bg-black/50 p-4 rounded-xl border border-white/10 max-h-48 overflow-y-auto divide-y divide-white/5">
              {importDuplicates.map((dup, idx) => (
                <div key={idx} className="pt-2 first:pt-0">
                  <p className="text-xs font-bold text-white">{dup.imported.title}</p>
                  <p className="text-[11px] text-text-muted">Author: {dup.imported.author} | Genre: {translateGenre(dup.imported.genre)}</p>
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-white block">{t.conflictChoose}</label>
              <div className="space-y-2 text-xs">
                <label className="flex items-center gap-2 cursor-pointer p-3 bg-white/5 rounded-xl border border-white/10 hover:border-amber-400">
                  <input
                    type="radio"
                    name="conflictStrategy"
                    value="keep_both"
                    checked={globalConflictStrategy === 'keep_both'}
                    onChange={() => setGlobalConflictStrategy('keep_both')}
                  />
                  <span>{t.conflictKeepBoth}</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer p-3 bg-white/5 rounded-xl border border-white/10 hover:border-amber-400">
                  <input
                    type="radio"
                    name="conflictStrategy"
                    value="overwrite"
                    checked={globalConflictStrategy === 'overwrite'}
                    onChange={() => setGlobalConflictStrategy('overwrite')}
                  />
                  <span>{t.conflictOverwrite}</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer p-3 bg-white/5 rounded-xl border border-white/10 hover:border-amber-400">
                  <input
                    type="radio"
                    name="conflictStrategy"
                    value="skip"
                    checked={globalConflictStrategy === 'skip'}
                    onChange={() => setGlobalConflictStrategy('skip')}
                  />
                  <span>{t.conflictSkip}</span>
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
              <button
                onClick={handleConfirmImportConflict}
                className="px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-amber-500 text-black font-extrabold rounded-xl text-xs"
              >
                {t.conflictProcessBtn}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL 4: ADD CUSTOM GENRE --- */}
      {showGenreModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="glass-card max-w-md w-full border-cyan-500/30 bg-[#070A12] rounded-2xl p-6 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-cyan-400" />
                <span>{t.addGenreTitle}</span>
              </h3>
              <button onClick={() => setShowGenreModal(false)} className="text-text-muted hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="text-xs font-bold text-white block mb-1">{t.addGenreLabel}</label>
              <input
                type="text"
                placeholder={t.addGenrePlaceholder}
                value={newGenreName}
                onChange={(e) => setNewGenreName(e.target.value)}
                className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
              <button onClick={() => setShowGenreModal(false)} className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs font-bold">
                {t.verifyCancelBtn}
              </button>
              <button
                onClick={handleAddCustomGenre}
                className="px-5 py-2 bg-gradient-to-r from-cyan-500 to-amber-500 text-black font-extrabold rounded-xl text-xs shadow-[0_0_15px_rgba(34,211,238,0.3)]"
              >
                {t.addGenreSaveBtn}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL 5: MANUAL BOOK ADD FALLBACK --- */}
      {showManualModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="glass-card max-w-md w-full border-white/20 bg-[#070A12] rounded-2xl p-6 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-amber-400" />
                <span>{t.manualTitle}</span>
              </h3>
              <button onClick={() => setShowManualModal(false)} className="text-text-muted hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-white block mb-1">{t.manualTitleLabel}</label>
                <input
                  type="text"
                  placeholder="e.g. Cien Años de Soledad"
                  value={manualForm.title}
                  onChange={(e) => setManualForm({ ...manualForm, title: e.target.value })}
                  className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-white block mb-1">{t.manualAuthorLabel}</label>
                <input
                  type="text"
                  placeholder="e.g. García Márquez, Gabriel"
                  value={manualForm.author}
                  onChange={(e) => setManualForm({ ...manualForm, author: e.target.value })}
                  className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-white block mb-1">{t.manualGenreLabel}</label>
                <select
                  value={manualForm.genre}
                  onChange={(e) => setManualForm({ ...manualForm, genre: e.target.value })}
                  className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                >
                  {allGenreOptions.map((g) => (
                    <option key={g} value={g} className="bg-[#070A12]">
                      {translateGenre(g)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
              <button onClick={() => setShowManualModal(false)} className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs font-bold">
                {t.verifyCancelBtn}
              </button>
              <button
                onClick={handleSaveManualBook}
                className="px-5 py-2 bg-gradient-to-r from-cyan-500 to-amber-500 text-black font-extrabold rounded-xl text-xs shadow-[0_0_15px_rgba(34,211,238,0.3)]"
              >
                {t.manualSaveBtn}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL 6: SETTINGS & GEMINI API KEY DRAWER --- */}
      {showSettingsModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="glass-card max-w-md w-full border-cyan-500/30 bg-[#070A12] rounded-2xl p-6 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Key className="w-5 h-5 text-cyan-400" />
                <span>{t.apiKeyTitle}</span>
              </h3>
              <button onClick={() => setShowSettingsModal(false)} className="text-text-muted hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <p className="text-xs text-text-muted">
                {t.apiKeySub}{' '}
                <a href="https://aistudio.google.com" target="_blank" rel="noreferrer" className="text-cyan-400 underline inline-flex items-center gap-1">
                  aistudio.google.com <ExternalLink className="w-3 h-3" />
                </a>
              </p>

              <div>
                <label className="text-xs font-bold text-white block mb-1">{t.apiKeyLabel}</label>
                <input
                  type="password"
                  placeholder="AIzaSy..."
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400 font-mono"
                />
              </div>

              <div className="p-3 bg-cyan-500/10 rounded-xl border border-cyan-500/20 text-[11px] text-cyan-300">
                {t.apiKeyPrivacy}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
              <button onClick={() => setShowSettingsModal(false)} className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs font-bold">
                {t.verifyCancelBtn}
              </button>
              <button
                onClick={handleSaveApiKey}
                className="px-5 py-2 bg-gradient-to-r from-cyan-500 to-amber-500 text-black font-extrabold rounded-xl text-xs shadow-[0_0_15px_rgba(34,211,238,0.3)]"
              >
                {t.apiKeySaveBtn}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
