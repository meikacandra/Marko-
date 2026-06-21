// Angka Kecukupan Gizi harian rata-rata untuk mahasiswa (dewasa 19-29 th)
export const DAILY_TARGETS = {
  calories: 2000,  // kkal
  protein:  60,    // gram
  carbs:    300,   // gram
  fat:      65,    // gram
  fiber:    25,    // gram
};

// Warna progress bar per makronutrien
export const MACRO_COLORS = {
  calories: 'bg-orange-400',
  protein:  'bg-blue-400',
  carbs:    'bg-yellow-400',
  fat:      'bg-red-400',
  fiber:    'bg-green-400',
};

// Label & satuan
export const MACRO_LABELS = {
  calories: { label: 'Kalori',  unit: 'kkal' },
  protein:  { label: 'Protein', unit: 'g'    },
  carbs:    { label: 'Karbo',   unit: 'g'    },
  fat:      { label: 'Lemak',   unit: 'g'    },
  fiber:    { label: 'Serat',   unit: 'g'    },
};

// Kategori olahraga
export const EXERCISE_TYPES = ['Kardio', 'Kekuatan', 'Fleksibilitas', 'HIIT'];
