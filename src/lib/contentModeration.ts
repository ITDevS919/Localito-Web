import Filter from "leo-profanity";

// Configure a shared profanity filter instance for the web client.
const profanityFilter = (() => {
  const f = Filter;
  f.clearList();
  f.add(f.getDictionary("en"));
  return f;
})();

export function containsObjectionableContent(text: string | null | undefined): boolean {
  if (!text) return false;
  return profanityFilter.check(text);
}

export function cleanObjectionableContent(text: string | null | undefined): string {
  if (!text) return "";
  return profanityFilter.clean(text);
}

