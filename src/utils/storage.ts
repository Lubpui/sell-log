export const DETAILS_STORAGE_KEY = "available_details";
export const FILTERS_STORAGE_KEY = "app_filters";

export const extractDetailsFromItems = (items: any[]): string[] => {
  const details = new Set<string>();

  items.forEach((item) => {
    if (item.detail) {
      const parts = item.detail.split(",").map((p: string) => p.trim());
      parts.forEach((part: string) => {
        if (part) details.add(part);
      });
    }
  });

  return Array.from(details).sort();
};

export const saveDetailsToStorage = (details: string[]): void => {
  localStorage.setItem(DETAILS_STORAGE_KEY, JSON.stringify(details));
};

export const getDetailsFromStorage = (): string[] => {
  const stored = localStorage.getItem(DETAILS_STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
};

export const updateDetailsStorage = (items: any[]): void => {
  const details = extractDetailsFromItems(items);
  saveDetailsToStorage(details);
};

// Filter storage functions
export const saveFiltersToStorage = (filters: any): void => {
  localStorage.setItem(FILTERS_STORAGE_KEY, JSON.stringify(filters));
};

export const getFiltersFromStorage = (): any => {
  const stored = localStorage.getItem(FILTERS_STORAGE_KEY);
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      // Convert date strings back to Date objects if needed
      if (parsed.createdAtRange) {
        parsed.createdAtRange = [new Date(parsed.createdAtRange[0]), new Date(parsed.createdAtRange[1])];
      }
      return parsed;
    } catch {
      return null;
    }
  }
  return null;
};
