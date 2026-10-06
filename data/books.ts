// data/books.ts
// Modelo de libro, géneros y catálogo local de respaldo (se usa si Supabase no está configurado o no responde).

export type Condition = "nuevo" | "usado";
export type ConditionDetail = "como nuevo" | "muy bueno" | "bueno" | "aceptable";

export type Book = {
  id: string;
  title: string;
  author: string;
  /** Editorial. */
  publisher?: string;
  isbn?: string;
  genre: string;
  condition: Condition;
  /** Solo para usados; null/undefined en nuevos. */
  conditionDetail?: ConditionDetail | null;
  /** Precio en pesos argentinos. */
  price: number;
  stock: number;
  /** URLs de imágenes (la primera es la tapa). */
  images: string[];
  description?: string;
  year?: number;
  language: string;
  pages?: number;
  featured: boolean;
  /** Si false, no se muestra en el catálogo público. */
  active?: boolean;
  createdAt?: string;
};

export const GENRES = [
  "Novela",
  "Infantil",
  "Juvenil",
  "Autoayuda",
  "Historia",
  "Biografías",
  "Escolar/Texto",
  "Cocina",
  "Arte",
  "Religión",
  "Ensayo",
  "Otros",
] as const;

export const CONDITION_DETAILS: ConditionDetail[] = [
  "como nuevo",
  "muy bueno",
  "bueno",
  "aceptable",
];

export const DEFAULT_LANGUAGE = "Español";

/** Tope de unidades por libro = stock disponible. */
export function maxOrderQuantity(book: Book): number {
  return Math.max(0, Math.floor(Number(book.stock)) || 0);
}

export function isOutOfStock(book: Book): boolean {
  return maxOrderQuantity(book) <= 0;
}

export function conditionLabel(book: Pick<Book, "condition" | "conditionDetail">): string {
  if (book.condition === "nuevo") return "Nuevo";
  return book.conditionDetail ? `Usado (${book.conditionDetail})` : "Usado";
}

export const FALLBACK_BOOKS: Book[] = [
  {
    id: "fallback-1",
    title: "Cien años de soledad",
    author: "Gabriel García Márquez",
    publisher: "Sudamericana",
    isbn: "9789500755924",
    genre: "Novela",
    condition: "nuevo",
    conditionDetail: null,
    price: 24500,
    stock: 4,
    images: ["/covers/seed-01.svg"],
    description: "La saga de los Buendía en Macondo. Edición de bolsillo.",
    year: 2007,
    language: "Español",
    pages: 471,
    featured: true,
  },
  {
    id: "fallback-2",
    title: "El Principito",
    author: "Antoine de Saint-Exupéry",
    publisher: "Emecé",
    isbn: "9789500427760",
    genre: "Infantil",
    condition: "nuevo",
    conditionDetail: null,
    price: 12900,
    stock: 6,
    images: ["/covers/seed-02.svg"],
    description: "El clásico de la literatura universal con las ilustraciones originales.",
    year: 2014,
    language: "Español",
    pages: 96,
    featured: true,
  },
  {
    id: "fallback-3",
    title: "Ficciones",
    author: "Jorge Luis Borges",
    publisher: "Debolsillo",
    genre: "Novela",
    condition: "usado",
    conditionDetail: "muy bueno",
    price: 8500,
    stock: 1,
    images: ["/covers/seed-03.svg"],
    description: "Cuentos fundamentales de Borges. Ejemplar con mínimas marcas de uso.",
    year: 2011,
    language: "Español",
    pages: 192,
    featured: true,
  },
  {
    id: "fallback-4",
    title: "Los siete pilares de la sabiduría",
    author: "T. E. Lawrence",
    publisher: "Booket",
    genre: "Biografías",
    condition: "usado",
    conditionDetail: "bueno",
    price: 6000,
    stock: 1,
    images: ["/covers/seed-05.svg"],
    description: "Memorias de la Revuelta Árabe. Tapa con desgaste leve.",
    year: 2005,
    language: "Español",
    pages: 780,
    featured: false,
  },
  {
    id: "fallback-5",
    title: "Harry Potter y la piedra filosofal",
    author: "J. K. Rowling",
    publisher: "Salamandra",
    isbn: "9788478884957",
    genre: "Juvenil",
    condition: "usado",
    conditionDetail: "como nuevo",
    price: 11000,
    stock: 1,
    images: ["/covers/seed-06.svg"],
    description: "Primer libro de la saga. Prácticamente sin uso.",
    year: 2015,
    language: "Español",
    pages: 256,
    featured: true,
  },
  {
    id: "fallback-6",
    title: "El poder del hábito",
    author: "Charles Duhigg",
    publisher: "Urano",
    genre: "Autoayuda",
    condition: "nuevo",
    conditionDetail: null,
    price: 19800,
    stock: 3,
    images: ["/covers/seed-07.svg"],
    description: "Por qué hacemos lo que hacemos en la vida y en las empresas.",
    year: 2019,
    language: "Español",
    pages: 400,
    featured: false,
  },
  {
    id: "fallback-7",
    title: "El libro de Doña Petrona",
    author: "Petrona C. de Gandulfo",
    publisher: "Atlántida",
    genre: "Cocina",
    condition: "usado",
    conditionDetail: "aceptable",
    price: 5500,
    stock: 1,
    images: ["/covers/seed-08.svg"],
    description: "Recetario clásico. Hojas amarillentas, lomo firme.",
    year: 1990,
    language: "Español",
    pages: 600,
    featured: false,
  },
  {
    id: "fallback-8",
    title: "Martín Fierro",
    author: "José Hernández",
    publisher: "Kapelusz",
    genre: "Escolar/Texto",
    condition: "nuevo",
    conditionDetail: null,
    price: 9800,
    stock: 0,
    images: ["/covers/seed-09.svg"],
    description: "Edición escolar con notas y vocabulario.",
    year: 2018,
    language: "Español",
    pages: 220,
    featured: false,
  },
];
