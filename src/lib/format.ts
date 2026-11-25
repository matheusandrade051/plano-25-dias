/**
 * Converte texto digitado (aceita vírgula ou ponto) em número.
 * Exemplos: "97,8" -> 97.8 | "97.8" -> 97.8 | "1.234,5" -> 1234.5
 * Retorna null se vazio ou inválido.
 */
export function parseDecimal(input: FormDataEntryValue | null | undefined): number | null {
  if (input === null || input === undefined) return null;
  let s = String(input).trim().replace(/\s/g, "");
  if (s === "") return null;
  if (s.includes(",")) {
    // vírgula é o separador decimal; pontos são milhares
    s = s.replace(/\./g, "").replace(",", ".");
  }
  if (!/^-?\d+(\.\d+)?$/.test(s)) return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

export function fmt(n: number, digits = 0): string {
  return new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(n);
}

export function fmtKg(n: number): string {
  return `${fmt(n, 2)} kg`;
}

/** Valor para preencher inputs de texto decimal, com vírgula. */
export function toInputDecimal(n: number | null | undefined, digits = 2): string {
  if (n === null || n === undefined) return "";
  return n.toFixed(digits).replace(".", ",");
}
