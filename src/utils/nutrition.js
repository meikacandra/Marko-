// ── Kalkulasi BMR (Harris-Benedict) ──────────────────────────────────────────
// gender: 'male' | 'female', weight: kg, height: cm, age: tahun
export const calcBMR = (gender, weight, height, age) =>
  gender === 'male'
    ? 88.362 + 13.397 * weight + 4.799 * height - 5.677 * age
    : 447.593 + 9.247 * weight + 3.098 * height - 4.330 * age;

// ── TDEE (Total Daily Energy Expenditure) ────────────────────────────────────
const ACTIVITY = {
  sedentary:   1.2,   // jarang olahraga
  light:       1.375, // 1-3x/minggu
  moderate:    1.55,  // 3-5x/minggu
  active:      1.725, // 6-7x/minggu
  very_active: 1.9,   // 2x/hari
};
export const calcTDEE = (bmr, activity = 'moderate') => Math.round(bmr * (ACTIVITY[activity] ?? 1.55));

// ── Target makro dari total kalori ───────────────────────────────────────────
// Proporsi: protein 25%, karbo 50%, lemak 25%
export const calcMacroTargets = (calories) => ({
  calories,
  protein: Math.round((calories * 0.25) / 4),  // 4 kkal/g
  carbs:   Math.round((calories * 0.50) / 4),  // 4 kkal/g
  fat:     Math.round((calories * 0.25) / 9),  // 9 kkal/g
});

// ── Jumlahkan nutrisi dari array log makanan ──────────────────────────────────
export const sumNutrition = (logs) =>
  logs.reduce(
    (acc, item) => ({
      calories: acc.calories + (item.calories ?? 0),
      protein:  acc.protein  + (item.protein  ?? 0),
      carbs:    acc.carbs    + (item.carbs    ?? 0),
      fat:      acc.fat      + (item.fat      ?? 0),
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 },
  );

// ── Persentase progress (cap 100) ────────────────────────────────────────────
export const pct = (value, target) =>
  target > 0 ? Math.min(100, Math.round((value / target) * 100)) : 0;
