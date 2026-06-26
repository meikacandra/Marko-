# Dokumentasi Public API – Aplikasi Marko

Aplikasi **Marko** mengintegrasikan API eksternal gratis untuk menyediakan database resep masakan sehat internasional dari seluruh dunia secara dinamis.

---

## 🌐 Informasi Umum API

*   **Nama Layanan:** TheMealDB API
*   **Deskripsi:** Database terbuka untuk resep makanan, bahan, dan kategori hidangan global.
*   **Base URL:** `https://www.themealdb.com/api/json/v1/1`
*   **Autentikasi:** Tanpa Kunci API (Menggunakan API Key publik default `1` untuk tujuan pembelajaran/non-komersial).

---

## 🔌 Daftar Endpoint yang Digunakan

Aplikasi Marko menggunakan 6 endpoint utama untuk mendukung fitur penelusuran resep, detail resep, pencarian kategori, dan rekomendasi acak:

### 1. Pencarian Resep Berdasarkan Nama
Mencari daftar makanan berdasarkan kata kunci nama menu.
*   **Method:** `GET`
*   **Path:** `/search.php`
*   **Query Parameter:** `s` (string) – Nama masakan (misal: `chicken`, `salmon`, dll).
*   **Fungsi di Kode:** `searchMealsByName(name)` di `src/services/mealdb/api.js`.
*   **Contoh Response Singkat:**
    ```json
    {
      "meals": [
        {
          "idMeal": "52772",
          "strMeal": "Teriyaki Chicken Casserole",
          "strCategory": "Chicken",
          "strArea": "Japanese",
          "strInstructions": "Preheat oven to 350 degrees F (175 degrees C)...",
          "strMealThumb": "https://www.themealdb.com/images/media/meals/wvpsxx1468256321.jpg",
          "strTags": "Meat,Casserole",
          "strYoutube": "https://www.youtube.com/watch?v=4aZr5hZXP_s",
          "strIngredient1": "soy sauce",
          "strMeasure1": "3/4 cup"
        }
      ]
    }
    ```

### 2. Detail Resep Berdasarkan ID
Mengambil data detail lengkap masakan berdasarkan ID unik hidangan.
*   **Method:** `GET`
*   **Path:** `/lookup.php`
*   **Query Parameter:** `i` (number/string) – ID masakan (misal: `52772`).
*   **Fungsi di Kode:** `getMealById(id)` di `src/services/mealdb/api.js`.
*   **Contoh Response Singkat:**
    ```json
    {
      "meals": [
        {
          "idMeal": "52772",
          "strMeal": "Teriyaki Chicken Casserole",
          "strCategory": "Chicken",
          "strArea": "Japanese",
          "strInstructions": "...",
          "strMealThumb": "..."
        }
      ]
    }
    ```

### 3. Filter Resep Berdasarkan Kategori
Mengambil daftar makanan yang dikelompokkan dalam kategori bahan tertentu.
*   **Method:** `GET`
*   **Path:** `/filter.php`
*   **Query Parameter:** `c` (string) – Kategori makanan (misal: `Seafood`, `Beef`, `Vegetarian`).
*   **Fungsi di Kode:** `getMealsByCategory(cat)` di `src/services/mealdb/api.js`.
*   **Contoh Response Singkat:**
    ```json
    {
      "meals": [
        {
          "strMeal": "Baked Salmon with Fennel & Tomatoes",
          "strMealThumb": "https://www.themealdb.com/images/media/meals/1548772327.jpg",
          "idMeal": "52959"
        }
      ]
    }
    ```

### 4. Filter Resep Berdasarkan Area/Negara
Mengambil daftar makanan berdasarkan wilayah geografis asal kuliner tersebut.
*   **Method:** `GET`
*   **Path:** `/filter.php`
*   **Query Parameter:** `a` (string) – Area/negara asal (misal: `Italian`, `Chinese`, `Mexican`).
*   **Fungsi di Kode:** `getMealsByArea(area)` di `src/services/mealdb/api.js`.
*   **Contoh Response Singkat:**
    ```json
    {
      "meals": [
        {
          "strMeal": "Lasagne",
          "strMealThumb": "https://www.themealdb.com/images/media/meals/wtsvtp1511606214.jpg",
          "idMeal": "52844"
        }
      ]
    }
    ```

### 5. Mengambil Semua Kategori Makanan
Mengambil semua daftar kategori yang tersedia di dalam database beserta deskripsi dan gambar ikon kategori.
*   **Method:** `GET`
*   **Path:** `/categories.php`
*   **Query Parameter:** Tidak ada.
*   **Fungsi di Kode:** `getAllCategories()` di `src/services/mealdb/api.js`.
*   **Contoh Response Singkat:**
    ```json
    {
      "categories": [
        {
          "idCategory": "1",
          "strCategory": "Beef",
          "strCategoryThumb": "https://www.themealdb.com/images/category/beef.png",
          "strCategoryDescription": "Beef is the culinary name for meat from cattle..."
        }
      ]
    }
    ```

### 6. Rekomendasi Makanan Acak (Random Meal)
Mendapatkan resep masakan secara acak untuk fitur saran menu sehat harian.
*   **Method:** `GET`
*   **Path:** `/random.php`
*   **Query Parameter:** Tidak ada.
*   **Fungsi di Kode:** `getRandomMeal()` di `src/services/mealdb/api.js`.
*   **Contoh Response Singkat:** Sama seperti `/lookup.php`, mengembalikan array `meals` berisi tepat satu masakan acak.
