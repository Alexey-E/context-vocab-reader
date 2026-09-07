const UCD_BASE_URL = "https://www.unicode.org/Public";
const POSTGRES_UNICODE_VERSION = "15.1.0";
const RUNTIME_UNICODE_VERSION = "17.0.0";

async function readUnicodeFile(version, path) {
  const url = `${UCD_BASE_URL}/${version}/ucd/${path}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Unable to download ${url}: HTTP ${response.status}`);
  }

  return response.text();
}

function parseRanges(contents, valuePattern) {
  const values = new Map();

  for (const line of contents.split("\n")) {
    const match = line.match(
      new RegExp(
        `^([0-9A-F]+)(?:\\.\\.([0-9A-F]+))?\\s*;\\s*(${valuePattern})`,
      ),
    );

    if (!match) {
      continue;
    }

    const start = Number.parseInt(match[1], 16);
    const end = Number.parseInt(match[2] ?? match[1], 16);

    for (let codePoint = start; codePoint <= end; codePoint += 1) {
      values.set(codePoint, match[3]);
    }
  }

  return values;
}

function groupRanges(entries, readValue) {
  const groups = new Map();

  for (const [codePoint, rawValue] of entries) {
    const value = readValue(rawValue);
    const ranges = groups.get(value) ?? [];
    const previous = ranges.at(-1);

    if (previous?.end === codePoint) {
      previous.end += 1;
    } else {
      ranges.push({ end: codePoint + 1, start: codePoint });
    }

    groups.set(value, ranges);
  }

  return groups;
}

function sqlMultirange(ranges) {
  return `{${ranges.map(({ end, start }) => `[${start},${end})`).join(", ")}}`;
}

function sqlUnicodeLiteral(field) {
  const escapes = field
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((hex) => {
      const codePoint = Number.parseInt(hex, 16);
      return codePoint <= 0xffff
        ? `\\${codePoint.toString(16).toUpperCase().padStart(4, "0")}`
        : `\\+${codePoint.toString(16).toUpperCase().padStart(6, "0")}`;
    })
    .join("");

  return `U&'${escapes}'`;
}

const [
  postgresCombiningData,
  runtimeCombiningData,
  ageData,
  normalizationData,
] = await Promise.all([
  readUnicodeFile(
    POSTGRES_UNICODE_VERSION,
    "extracted/DerivedCombiningClass.txt",
  ),
  readUnicodeFile(
    RUNTIME_UNICODE_VERSION,
    "extracted/DerivedCombiningClass.txt",
  ),
  readUnicodeFile(RUNTIME_UNICODE_VERSION, "DerivedAge.txt"),
  readUnicodeFile(RUNTIME_UNICODE_VERSION, "NormalizationTest.txt"),
]);

const postgresCombiningClasses = parseRanges(postgresCombiningData, "\\d+");
const runtimeCombiningClasses = parseRanges(runtimeCombiningData, "\\d+");
const ages = parseRanges(ageData, "[0-9.]+");
const nonZeroClasses = [...runtimeCombiningClasses].filter(
  ([, value]) => Number(value) !== 0,
);
const classGroups = groupRanges(nonZeroClasses, Number);
const changedClasses = nonZeroClasses.filter(
  ([codePoint, value]) => postgresCombiningClasses.get(codePoint) !== value,
);
const changedCodePoints = new Set(
  changedClasses.map(([codePoint]) => codePoint),
);
const changedGroups = groupRanges(changedClasses, () => "delta");

const conformanceRows = normalizationData
  .split("\n")
  .filter((line) => /^[0-9A-F]/.test(line))
  .map((line) => line.split(";").slice(0, 5))
  .filter((columns) =>
    columns.some((column) =>
      column
        .trim()
        .split(/\s+/)
        .some((hex) => changedCodePoints.has(Number.parseInt(hex, 16))),
    ),
  );
const post151Rows = normalizationData
  .split("\n")
  .filter((line) => /^[0-9A-F]/.test(line))
  .map((line) => line.split(";").slice(0, 5))
  .filter((columns) =>
    columns.some((column) =>
      column
        .trim()
        .split(/\s+/)
        .some(
          (hex) => (Number(ages.get(Number.parseInt(hex, 16))) || 0) > 15.1,
        ),
    ),
  );

const output = [
  `-- Unicode ${RUNTIME_UNICODE_VERSION} non-zero canonical combining classes`,
  `combining_class_values constant integer[] := array[${[...classGroups.keys()].join(", ")}];`,
  "combining_class_ranges constant int4multirange[] := array[",
  ...[...classGroups].map(
    ([value, ranges], index, groups) =>
      `  '${sqlMultirange(ranges)}'::int4multirange${index + 1 === groups.length ? "" : ","} -- ${value}`,
  ),
  "];",
  "",
  `post_15_1_combining_marks constant int4multirange := '${sqlMultirange(changedGroups.get("delta"))}'::int4multirange;`,
  "",
  `-- ${conformanceRows.length} combining-class conformance rows`,
  ...conformanceRows.map(
    (columns) =>
      `(${sqlUnicodeLiteral(columns[0])}, ${sqlUnicodeLiteral(columns[3])})`,
  ),
  "",
  `-- ${post151Rows.length} total normalization rows containing Unicode 16/17 characters`,
];

process.stdout.write(`${output.join("\n")}\n`);
