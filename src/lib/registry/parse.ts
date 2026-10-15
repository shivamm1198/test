import type { RegisteredMemberInput } from "@/lib/content/schema";

export type ParsedImport = {
  rows: RegisteredMemberInput[];
  skipped: { line: number; text: string }[];
};

/** Splits one CSV line, honouring "quoted, values". */
function splitCsv(line: string) {
  const out: string[] = [];
  let cell = "";
  let quoted = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (quoted) {
      if (ch === '"' && line[i + 1] === '"') {
        cell += '"';
        i++;
      } else if (ch === '"') quoted = false;
      else cell += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === ",") {
      out.push(cell);
      cell = "";
    } else cell += ch;
  }
  out.push(cell);
  return out.map((c) => c.trim());
}

const looksLikeId = (v: string) => /^[A-Za-z]{1,6}[-/]?\d{1,8}$/.test(v.trim());

const HEADERS = {
  name: /^(full\s*)?name$/i,
  location: /^(location|place|city|state|district|address)$/i,
  code: /^(id|member\s*id|membership\s*(id|no\.?|number)|code|member\s*code|reg(istration)?\s*(id|no\.?))$/i,
};

/**
 * Reads a pasted list or CSV file into members. Accepts:
 *  - spreadsheet rows copied from Excel / Google Sheets (tab separated)
 *  - CSV with or without a header row (name, location, id)
 *  - plain "Name, City, State, VES-0001" lines (the ID is optional)
 */
export function parseMemberList(text: string): ParsedImport {
  const lines = text.replace(/\r\n?/g, "\n").split("\n");
  const rows: RegisteredMemberInput[] = [];
  const skipped: ParsedImport["skipped"] = [];

  const cellsOf = (line: string) =>
    line.includes("\t") ? line.split("\t").map((c) => c.trim()) : splitCsv(line);

  // Optional header row: map columns by name.
  let start = 0;
  let columns: { name: number; location: number; code: number } | null = null;
  const firstIndex = lines.findIndex((l) => l.trim() !== "");
  if (firstIndex >= 0) {
    const head = cellsOf(lines[firstIndex]);
    const find = (re: RegExp) => head.findIndex((c) => re.test(c));
    const name = find(HEADERS.name);
    if (name >= 0) {
      columns = { name, location: find(HEADERS.location), code: find(HEADERS.code) };
      start = firstIndex + 1;
    }
  }

  for (let i = start; i < lines.length; i++) {
    const raw = lines[i];
    if (!raw.trim()) continue;
    const cells = cellsOf(raw);
    let name = "";
    let location = "";
    let code = "";

    if (columns) {
      name = cells[columns.name] ?? "";
      location = columns.location >= 0 ? (cells[columns.location] ?? "") : "";
      code = columns.code >= 0 ? (cells[columns.code] ?? "") : "";
    } else {
      const parts = cells.filter((c, idx) => c !== "" || idx === 0);
      // An ID may come first or last: "VES-0001, Name, City" or "Name, City, VES-0001".
      if (parts.length > 1 && looksLikeId(parts[0])) code = parts.shift()!;
      else if (parts.length > 1 && looksLikeId(parts[parts.length - 1])) code = parts.pop()!;
      name = parts.shift() ?? "";
      location = parts.join(", ");
    }

    name = name.trim().slice(0, 200);
    if (!name) {
      skipped.push({ line: i + 1, text: raw.slice(0, 80) });
      continue;
    }
    rows.push({
      name,
      location: location.trim().slice(0, 200),
      member_code: code.trim().slice(0, 40),
    });
  }
  return { rows, skipped };
}

/** One CSV line with quotes where needed. */
const csvCell = (v: string) => (/[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v);

export function toCsv(members: { code: string; name: string; location: string }[]) {
  return [
    "ID,Name,Location",
    ...members.map((m) => [m.code, m.name, m.location].map(csvCell).join(",")),
  ].join("\n");
}
