export const isValidEmail   = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
export const isNotEmpty     = (v) => v?.trim().length > 0;
export const isPositiveNum  = (v) => !isNaN(v) && Number(v) > 0;
