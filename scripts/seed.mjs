// scripts/seed.mjs — `npm run seed`
// Resetea la tabla `books` de la DB local (data/local/libros.db) y carga ~20 libros de prueba
// con tapas SVG generadas localmente en public/covers/. Idempotente.

import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dbDir = path.join(root, "data", "local");
const coverDir = path.join(root, "public", "covers");

fs.mkdirSync(dbDir, { recursive: true });
fs.mkdirSync(coverDir, { recursive: true });

const db = new Database(path.join(dbDir, "libros.db"));
db.pragma("journal_mode = WAL");
db.exec(fs.readFileSync(path.join(root, "db", "schema.sqlite.sql"), "utf8"));

const COLORS = [
  ["#7a1f2b", "#f4d9b5"], ["#2f4a3c", "#f1e6c8"], ["#1f3a5f", "#f3e3c3"], ["#6b4a1f", "#f7ecd2"],
  ["#4a2f5f", "#f0e0f0"], ["#8a3b12", "#fbe9cf"], ["#14504a", "#e8f1e4"], ["#3a3a3a", "#f1ead9"],
];

const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function wrap(text, max) {
  const words = text.split(" ");
  const lines = [];
  let cur = "";
  for (const w of words) {
    if ((cur + " " + w).trim().length > max) {
      if (cur) lines.push(cur);
      cur = w;
    } else cur = (cur + " " + w).trim();
  }
  if (cur) lines.push(cur);
  return lines;
}

function coverSvg(title, author, [bg, fg]) {
  const tLines = wrap(title, 16);
  const aLines = wrap(author, 22);
  const tStart = 200 - ((tLines.length - 1) * 38) / 2;
  const t = tLines
    .map((l, i) => `<text x="150" y="${tStart + i * 38}" text-anchor="middle" font-family="Georgia, serif" font-size="30" font-weight="bold" fill="${fg}">${esc(l)}</text>`)
    .join("");
  const a = aLines
    .map((l, i) => `<text x="150" y="${400 + i * 22}" text-anchor="middle" font-family="Arial, sans-serif" font-size="16" letter-spacing="1.5" fill="${fg}" opacity="0.85">${esc(l.toUpperCase())}</text>`)
    .join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 450" width="300" height="450"><rect width="300" height="450" fill="${bg}"/><rect x="14" y="14" width="272" height="422" fill="none" stroke="${fg}" stroke-opacity="0.45" stroke-width="2"/><rect x="0" y="0" width="12" height="450" fill="#000" opacity="0.18"/><line x1="90" y1="${tStart - 50}" x2="210" y2="${tStart - 50}" stroke="${fg}" stroke-opacity="0.6" stroke-width="2"/>${t}${a}</svg>`;
}

// [title, author, publisher, isbn, genre, condition, condition_detail, price, stock, year, pages, featured, description]
const BOOKS = [
  ["Cien años de soledad", "Gabriel García Márquez", "Sudamericana", "9789500755924", "Novela", "nuevo", null, 24500, 5, 2007, 471, 1, "La saga de la familia Buendía en Macondo. Edición de bolsillo."],
  ["El Principito", "Antoine de Saint-Exupéry", "Emecé", "9789500427760", "Infantil", "nuevo", null, 12900, 8, 2014, 96, 1, "El clásico de la literatura universal con las ilustraciones originales del autor."],
  ["Ficciones", "Jorge Luis Borges", "Debolsillo", "9789873752087", "Novela", "usado", "muy bueno", 8500, 1, 2011, 192, 1, "Cuentos fundamentales de Borges. Ejemplar con mínimas marcas de uso."],
  ["Rayuela", "Julio Cortázar", "Alfaguara", "9789505117505", "Novela", "usado", "bueno", 9800, 1, 2009, 600, 0, "Tapa con leve desgaste en las esquinas, interior limpio."],
  ["Los siete pilares de la sabiduría", "T. E. Lawrence", "Booket", null, "Biografías", "usado", "bueno", 6000, 1, 2005, 780, 0, "Memorias de la Revuelta Árabe. Lomo firme."],
  ["Harry Potter y la piedra filosofal", "J. K. Rowling", "Salamandra", "9788478884957", "Juvenil", "usado", "como nuevo", 11000, 1, 2015, 256, 1, "Primer libro de la saga. Prácticamente sin uso."],
  ["El poder del hábito", "Charles Duhigg", "Urano", "9788479538989", "Autoayuda", "nuevo", null, 19800, 3, 2019, 400, 0, "Por qué hacemos lo que hacemos en la vida y en las empresas."],
  ["El libro de Doña Petrona", "Petrona C. de Gandulfo", "Atlántida", null, "Cocina", "usado", "aceptable", 5500, 1, 1990, 600, 0, "Recetario clásico. Hojas amarillentas, lomo firme."],
  ["Martín Fierro", "José Hernández", "Kapelusz", null, "Escolar/Texto", "nuevo", null, 9800, 0, 2018, 220, 0, "Edición escolar con notas y vocabulario."],
  ["La ciudad y los perros", "Mario Vargas Llosa", "Alfaguara", "9788420471839", "Novela", "nuevo", null, 21500, 2, 2012, 408, 0, "Novela sobre la vida en el Colegio Militar Leoncio Prado."],
  ["Sapiens: de animales a dioses", "Yuval Noah Harari", "Debate", "9789873752889", "Historia", "nuevo", null, 32900, 4, 2018, 496, 1, "Breve historia de la humanidad."],
  ["Argentina: una historia", "Felipe Pigna", "Planeta", null, "Historia", "usado", "muy bueno", 7200, 1, 2010, 352, 0, "Ejemplar muy cuidado, sin subrayados."],
  ["Mafalda 10", "Quino", "De la Flor", null, "Infantil", "usado", "bueno", 4800, 1, 2003, 96, 0, "Tiras de Mafalda. Tapa con leve desgaste."],
  ["Papelitos: fantasías y recuerdos", "Silvia Schujer", "Alfaguara Infantil", null, "Infantil", "nuevo", null, 8900, 6, 2016, 64, 0, "Cuentos cortos ilustrados para chicos."],
  ["Matemática 8", "Equipo Kapelusz", "Kapelusz", null, "Escolar/Texto", "usado", "aceptable", 3500, 1, 2012, 280, 0, "Libro de texto con algunas actividades resueltas a lápiz."],
  ["Antología de arte argentino", "Varios autores", "Fundación Espigas", null, "Arte", "usado", "como nuevo", 15500, 1, 2008, 240, 0, "Edición ilustrada a color, tapa dura."],
  ["Las 48 leyes del poder", "Robert Greene", "Océano", "9786074004762", "Ensayo", "nuevo", null, 27400, 0, 2017, 480, 0, "Estrategia y poder. Sin stock momentáneamente."],
  ["La Biblia de Jerusalén", "Varios autores", "Desclée De Brouwer", null, "Religión", "usado", "muy bueno", 18000, 1, 2001, 1800, 0, "Edición de estudio con notas. Tapa dura."],
  ["Pedro Páramo", "Juan Rulfo", "RM", "9788492480319", "Novela", "nuevo", null, 14300, 3, 2005, 152, 0, "La novela breve que cambió la literatura latinoamericana."],
  ["Diario de Ana Frank", "Ana Frank", "Debolsillo", "9789873752094", "Biografías", "usado", "muy bueno", 6500, 2, 2012, 352, 1, "Dos ejemplares disponibles en muy buen estado."],
];

const insert = db.prepare(`
  INSERT INTO books (id, title, author, publisher, isbn, genre, condition, condition_detail, price, stock,
    images, description, year, language, pages, featured, active, created_at, updated_at)
  VALUES (@id, @title, @author, @publisher, @isbn, @genre, @condition, @condition_detail, @price, @stock,
    @images, @description, @year, 'Español', @pages, @featured, 1, @ts, @ts)
`);

const run = db.transaction(() => {
  db.prepare("DELETE FROM books").run();
  const now = Date.now();
  BOOKS.forEach(([title, author, publisher, isbn, genre, condition, cd, price, stock, year, pages, featured, description], i) => {
    const file = `seed-${String(i + 1).padStart(2, "0")}.svg`;
    fs.writeFileSync(path.join(coverDir, file), coverSvg(title, author, COLORS[i % COLORS.length]));
    insert.run({
      id: randomUUID(), title, author, publisher, isbn, genre, condition, condition_detail: cd, price, stock,
      images: JSON.stringify([`/covers/${file}`]), description, year, pages, featured,
      // más nuevo primero: el primero de la lista es el más reciente
      ts: new Date(now - i * 3600_000).toISOString(),
    });
  });
});
run();

const n = db.prepare("SELECT COUNT(*) AS n FROM books").get().n;
console.log(`Seed OK: ${n} libros cargados en data/local/libros.db (tapas en public/covers/).`);
db.close();
