import type { Category } from "@/api/types";

export function flattenCategories(
  categories: Category[],
  depth = 0,
  excludeIds?: Set<string>
): { id: string; label: string }[] {
  const result: { id: string; label: string }[] = [];
  for (const category of categories) {
    if (excludeIds?.has(category.id)) continue;
    result.push({
      id: category.id,
      label: `${"— ".repeat(depth)}${category.name}`,
    });
    if (category.children?.length) {
      result.push(...flattenCategories(category.children, depth + 1, excludeIds));
    }
  }
  return result;
}

export function collectCategoryIds(category: Category): string[] {
  return [category.id, ...(category.children ?? []).flatMap(collectCategoryIds)];
}

export function findCategory(categories: Category[], id: string): Category | undefined {
  for (const category of categories) {
    if (category.id === id) return category;
    const nested = findCategory(category.children ?? [], id);
    if (nested) return nested;
  }
}

export function slugifyCategory(name: string): string {
  const map: Record<string, string> = {
    а: "a",
    б: "b",
    в: "v",
    г: "g",
    д: "d",
    е: "e",
    ё: "e",
    ж: "zh",
    з: "z",
    и: "i",
    й: "i",
    к: "k",
    л: "l",
    м: "m",
    н: "n",
    о: "o",
    п: "p",
    р: "r",
    с: "s",
    т: "t",
    у: "u",
    ф: "f",
    х: "h",
    ц: "ts",
    ч: "ch",
    ш: "sh",
    щ: "sch",
    ъ: "",
    ы: "y",
    ь: "",
    э: "e",
    ю: "yu",
    я: "ya",
  };

  return name
    .toLowerCase()
    .split("")
    .map((char) => map[char] ?? char)
    .join("")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
