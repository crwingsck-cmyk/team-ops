import { Converter } from "opencc-js/t2cn";

const toSimplified = Converter({ from: "tw", to: "cn" });

export function normalizeForSearch(text) {
  if (!text) return "";
  return toSimplified(String(text)).toLowerCase();
}

export function chineseIncludes(haystack, needle) {
  if (!needle) return true;
  return normalizeForSearch(haystack).includes(normalizeForSearch(needle));
}
