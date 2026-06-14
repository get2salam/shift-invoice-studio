const FORMULA_PREFIX_PATTERN = /^[\t\r\n ]*[=+\-@]/;

export function neutralizeSpreadsheetFormula(value: string): string {
  if (!FORMULA_PREFIX_PATTERN.test(value)) {
    return value;
  }

  return `'${value}`;
}
