import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useUserRecipes } from '../../hooks/useUserRecipes';
import { ROUTES } from '../../constants/routes';
import { CATEGORIES, DIET_TAGS } from '../../constants/config';

// ── Helpers ───────────────────────────────────────────────────────────────────

const inputBase = 'w-full px-3 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-1 transition';
const inputOk   = `${inputBase} border-gray-200 focus:border-green-400 focus:ring-green-200`;
const inputErr  = `${inputBase} border-red-300 focus:border-red-400 focus:ring-red-100`;

function Field({ label, required, hint, error, children }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        {label}
        {required && <span className="text-red-400 ml-0.5">*</span>}
        {!required && <span className="text-xs font-normal text-gray-400 ml-1">(opsional)</span>}
      </label>
      {children}
      {hint  && !error && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}

function SectionTitle({ icon, title, subtitle }) {
  return (
    <div className="flex items-center gap-2 pb-2 border-b border-gray-100 mb-4">
      <span className="text-base">{icon}</span>
      <div>
        <p className="text-sm font-bold text-gray-700">{title}</p>
        {subtitle && <p className="text-xs text-gray-400">{subtitle}</p>}
      </div>
    </div>
  );
}

// ── Default values ────────────────────────────────────────────────────────────

const defaultIngredient = () => ({ id: crypto.randomUUID(), name: '', amount: '' });
const defaultStep       = () => ({ id: crypto.randomUUID(), text: '' });

const defaultForm = {
  title:        '',
  category:     '',
  thumbnail:    '',
  dietTags:     [],
  ingredients:  [defaultIngredient()],
  instructions: [defaultStep()],
  nutrition: {
    calories: '',
    protein:  '',
    carbs:    '',
    fat:      '',
    fiber:    '',
  },
};

// ── Main ──────────────────────────────────────────────────────────────────────

export default function RecipeFormPage() {
  const { id }     = useParams();
  const navigate   = useNavigate();
  const isEdit     = !!id;

  const { addRecipe, updateRecipe, getRecipeById } = useUserRecipes();

  const [form,    setForm]    = useState(defaultForm);
  const [errors,  setErrors]  = useState({});
  const [loading, setLoading] = useState(false);
  const [thumbErr,setThumbErr]= useState(false);

  // Populate form when editing
  useEffect(() => {
    if (!isEdit) return;
    const recipe = getRecipeById(id);
    if (!recipe) { navigate(ROUTES.MY_RECIPES, { replace: true }); return; }

    setForm({
      title:        recipe.title        ?? '',
      category:     recipe.category     ?? '',
      thumbnail:    recipe.thumbnail    ?? '',
      dietTags:     recipe.dietTags     ?? [],
      ingredients:  (recipe.ingredients ?? []).length > 0
                      ? recipe.ingredients.map((i) => ({ ...i, id: crypto.randomUUID() }))
                      : [defaultIngredient()],
      instructions: (recipe.instructions ?? []).length > 0
                      ? recipe.instructions.map((t) => ({ id: crypto.randomUUID(), text: t }))
                      : [defaultStep()],
      nutrition: {
        calories: recipe.nutrition?.calories ?? '',
        protein:  recipe.nutrition?.protein  ?? '',
        carbs:    recipe.nutrition?.carbs    ?? '',
        fat:      recipe.nutrition?.fat      ?? '',
        fiber:    recipe.nutrition?.fiber    ?? '',
      },
    });
  }, [id, isEdit]);

  // ── Field setters ─────────────────────────────────────────────────────────

  const set = (key) => (e) => {
    setForm((p) => ({ ...p, [key]: e.target.value }));
    setErrors((p) => ({ ...p, [key]: '' }));
  };

  const toggleTag = (tag) => {
    setForm((p) => ({
      ...p,
      dietTags: p.dietTags.includes(tag)
        ? p.dietTags.filter((t) => t !== tag)
        : [...p.dietTags, tag],
    }));
  };

  // ── Ingredients ───────────────────────────────────────────────────────────

  const setIngredient = (rowId, key, val) =>
    setForm((p) => ({
      ...p,
      ingredients: p.ingredients.map((i) => i.id === rowId ? { ...i, [key]: val } : i),
    }));

  const addIngredient = () =>
    setForm((p) => ({ ...p, ingredients: [...p.ingredients, defaultIngredient()] }));

  const removeIngredient = (rowId) =>
    setForm((p) => ({ ...p, ingredients: p.ingredients.filter((i) => i.id !== rowId) }));

  // ── Instructions ──────────────────────────────────────────────────────────

  const setStep = (rowId, val) =>
    setForm((p) => ({
      ...p,
      instructions: p.instructions.map((s) => s.id === rowId ? { ...s, text: val } : s),
    }));

  const addStep = () =>
    setForm((p) => ({ ...p, instructions: [...p.instructions, defaultStep()] }));

  const removeStep = (rowId) =>
    setForm((p) => ({ ...p, instructions: p.instructions.filter((s) => s.id !== rowId) }));

  // ── Nutrition ─────────────────────────────────────────────────────────────

  const setNutrition = (key) => (e) =>
    setForm((p) => ({ ...p, nutrition: { ...p.nutrition, [key]: e.target.value } }));

  // ── Validation ────────────────────────────────────────────────────────────

  const validate = () => {
    const e = {};
    if (!form.title.trim())    e.title    = 'Judul resep wajib diisi.';
    if (!form.category)        e.category = 'Pilih kategori.';

    const validIngredients = form.ingredients.filter((i) => i.name.trim());
    if (validIngredients.length === 0) e.ingredients = 'Minimal 1 bahan harus diisi.';

    const validSteps = form.instructions.filter((s) => s.text.trim());
    if (validSteps.length === 0) e.instructions = 'Minimal 1 langkah harus diisi.';

    const { calories, protein, carbs, fat, fiber } = form.nutrition;
    if (calories && (isNaN(calories) || Number(calories) < 0)) e.calories = 'Nilai tidak valid.';
    if (protein  && (isNaN(protein)  || Number(protein)  < 0)) e.protein  = 'Nilai tidak valid.';
    if (carbs    && (isNaN(carbs)    || Number(carbs)    < 0)) e.carbs    = 'Nilai tidak valid.';
    if (fat      && (isNaN(fat)      || Number(fat)      < 0)) e.fat      = 'Nilai tidak valid.';
    if (fiber    && (isNaN(fiber)    || Number(fiber)    < 0)) e.fiber    = 'Nilai tidak valid.';

    return e;
  };

  // ── Submit ────────────────────────────────────────────────────────────────

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    const payload = {
      title:        form.title.trim(),
      category:     form.category,
      thumbnail:    form.thumbnail.trim(),
      dietTags:     form.dietTags,
      ingredients:  form.ingredients
                      .filter((i) => i.name.trim())
                      .map(({ name, amount }) => ({ name: name.trim(), amount: amount.trim() })),
      instructions: form.instructions
                      .filter((s) => s.text.trim())
                      .map((s) => s.text.trim()),
      nutrition: {
        calories: form.nutrition.calories !== '' ? Number(form.nutrition.calories) : null,
        protein:  form.nutrition.protein  !== '' ? Number(form.nutrition.protein)  : null,
        carbs:    form.nutrition.carbs    !== '' ? Number(form.nutrition.carbs)    : null,
        fat:      form.nutrition.fat      !== '' ? Number(form.nutrition.fat)      : null,
        fiber:    form.nutrition.fiber    !== '' ? Number(form.nutrition.fiber)    : null,
      },
    };

    if (isEdit) updateRecipe(id, payload);
    else        addRecipe(payload);

    navigate(ROUTES.MY_RECIPES);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 pb-20">

      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors font-semibold"
        >
          ←
        </button>
        <div>
          <h1 className="text-xl font-bold text-gray-800">
            {isEdit ? 'Edit Resep' : 'Buat Resep Baru'}
          </h1>
          <p className="text-sm text-gray-400 mt-0.5">
            {isEdit ? 'Perbarui detail resepmu' : 'Tambahkan resepmu sendiri'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-8">

        {/* ── Seksi 1: Info Dasar ─────────────────────────────────────── */}
        <div className="space-y-4">
          <SectionTitle icon="📋" title="Info Resep" />

          <Field label="Judul Resep" required error={errors.title}>
            <input
              type="text"
              value={form.title}
              onChange={set('title')}
              placeholder="Contoh: Salad Tuna Lemon Segar"
              className={errors.title ? inputErr : inputOk}
            />
          </Field>

          <Field label="Kategori" required error={errors.category}>
            <select
              value={form.category}
              onChange={set('category')}
              className={errors.category ? inputErr : inputOk}
            >
              <option value="">— Pilih Kategori —</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </Field>

          <Field
            label="URL Foto"
            hint="Tempel link gambar dari internet (opsional)"
          >
            <input
              type="url"
              value={form.thumbnail}
              onChange={(e) => { set('thumbnail')(e); setThumbErr(false); }}
              placeholder="https://example.com/foto-resep.jpg"
              className={inputOk}
            />
            {form.thumbnail && !thumbErr && (
              <div className="mt-2 rounded-xl overflow-hidden border border-gray-100 aspect-video bg-gray-100">
                <img
                  src={form.thumbnail}
                  alt="preview"
                  className="w-full h-full object-cover"
                  onError={() => setThumbErr(true)}
                />
              </div>
            )}
            {form.thumbnail && thumbErr && (
              <p className="text-xs text-red-400 mt-1">❌ URL gambar tidak dapat dimuat.</p>
            )}
          </Field>

          <Field label="Tag Diet">
            <div className="flex flex-wrap gap-2 mt-1">
              {DIET_TAGS.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-colors ${
                    form.dietTags.includes(tag)
                      ? 'bg-green-500 text-white border-green-500'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-green-300'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </Field>
        </div>

        {/* ── Seksi 2: Bahan-bahan ────────────────────────────────────── */}
        <div>
          <SectionTitle icon="🥕" title="Bahan-bahan" subtitle="Minimal 1 bahan" />
          {errors.ingredients && (
            <p className="text-xs text-red-500 mb-3">{errors.ingredients}</p>
          )}

          <div className="space-y-2.5">
            {form.ingredients.map((ing, idx) => (
              <div key={ing.id} className="flex gap-2 items-center">
                <span className="flex-shrink-0 w-6 h-6 bg-green-100 text-green-600 rounded-full text-[10px] font-bold flex items-center justify-center">
                  {idx + 1}
                </span>
                <input
                  type="text"
                  value={ing.name}
                  onChange={(e) => setIngredient(ing.id, 'name', e.target.value)}
                  placeholder="Nama bahan"
                  className={`flex-[3] ${inputOk}`}
                />
                <input
                  type="text"
                  value={ing.amount}
                  onChange={(e) => setIngredient(ing.id, 'amount', e.target.value)}
                  placeholder="Takaran"
                  className={`flex-[2] ${inputOk}`}
                />
                {form.ingredients.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeIngredient(ing.id)}
                    className="flex-shrink-0 w-8 h-8 flex items-center justify-center text-gray-300 hover:text-red-400 hover:bg-red-50 rounded-lg transition-colors text-sm"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={addIngredient}
            className="mt-3 flex items-center gap-1.5 text-sm text-green-600 font-medium hover:bg-green-50 px-3 py-1.5 rounded-lg transition-colors"
          >
            + Tambah Bahan
          </button>
        </div>

        {/* ── Seksi 3: Langkah Memasak ────────────────────────────────── */}
        <div>
          <SectionTitle icon="👨‍🍳" title="Cara Memasak" subtitle="Minimal 1 langkah" />
          {errors.instructions && (
            <p className="text-xs text-red-500 mb-3">{errors.instructions}</p>
          )}

          <div className="space-y-3">
            {form.instructions.map((step, idx) => (
              <div key={step.id} className="flex gap-2.5 items-start">
                <span className="flex-shrink-0 w-7 h-7 bg-green-500 text-white rounded-full text-xs font-bold flex items-center justify-center mt-2">
                  {idx + 1}
                </span>
                <textarea
                  value={step.text}
                  onChange={(e) => setStep(step.id, e.target.value)}
                  placeholder={`Langkah ${idx + 1}...`}
                  rows={2}
                  className={`flex-1 ${inputOk} resize-none`}
                />
                {form.instructions.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeStep(step.id)}
                    className="flex-shrink-0 w-8 h-8 flex items-center justify-center text-gray-300 hover:text-red-400 hover:bg-red-50 rounded-lg transition-colors text-sm mt-1.5"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={addStep}
            className="mt-3 flex items-center gap-1.5 text-sm text-green-600 font-medium hover:bg-green-50 px-3 py-1.5 rounded-lg transition-colors"
          >
            + Tambah Langkah
          </button>
        </div>

        {/* ── Seksi 4: Info Nutrisi ───────────────────────────────────── */}
        <div>
          <SectionTitle
            icon="📊"
            title="Info Nutrisi"
            subtitle="Opsional — diperlukan agar bisa dilacak di Tracker"
          />

          <div className="grid grid-cols-2 gap-3">
            {[
              { key: 'calories', label: 'Kalori',      unit: 'kkal', placeholder: '350'  },
              { key: 'protein',  label: 'Protein',     unit: 'g',    placeholder: '25'   },
              { key: 'carbs',    label: 'Karbohidrat', unit: 'g',    placeholder: '40'   },
              { key: 'fat',      label: 'Lemak',       unit: 'g',    placeholder: '12'   },
              { key: 'fiber',    label: 'Serat',       unit: 'g',    placeholder: '5'    },
            ].map(({ key, label, unit, placeholder }) => (
              <Field
                key={key}
                label={label}
                error={errors[key]}
              >
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    value={form.nutrition[key]}
                    onChange={setNutrition(key)}
                    placeholder={placeholder}
                    className={`${errors[key] ? inputErr : inputOk} pr-12`}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 pointer-events-none">
                    {unit}
                  </span>
                </div>
              </Field>
            ))}
          </div>

          <div className="mt-3 bg-blue-50 border border-blue-100 rounded-xl px-3 py-2.5 text-xs text-blue-600">
            💡 Info nutrisi per sajian. Kosongkan jika tidak diketahui — bisa diisi nanti.
          </div>
        </div>

        {/* ── Submit ──────────────────────────────────────────────────── */}
        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex-1 py-3 border border-gray-200 text-gray-600 font-semibold rounded-xl text-sm hover:bg-gray-50 transition-colors"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-[2] py-3 bg-green-500 hover:bg-green-600 disabled:opacity-60 text-white font-semibold rounded-xl text-sm transition-colors"
          >
            {loading ? 'Menyimpan...' : isEdit ? '💾 Simpan Perubahan' : '✨ Buat Resep'}
          </button>
        </div>
      </form>
    </div>
  );
}
