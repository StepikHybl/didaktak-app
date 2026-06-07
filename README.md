# 🌸 Eko Akademie — Sakura Cyber-Cozy Edition

Interaktivní webová aplikace pro efektivní přípravu na didaktické testy z českého a anglického jazyka. Projekt kombinuje hlubokou **gamifikaci (škola hrou)** s unikátní, vysoce estetickou **Sakura Cyber-Cozy** arkádovou vizuální identitou. 

Aplikace je od základu navržena pro nekompromisní výkon (60 FPS) jak na stolních počítačích, tak na mobilních zařízeních a tabletech díky eliminaci výpočetně náročných grafických filtrů.

---

## 🚀 Živé demo (Spuštění)
Aplikaci si můžete okamžitě vyzkoušet na následujícím odkazu:
👉 **[ZDE VLOŽ SVŮJ ODKAZ NAPŘ. Z VERCELU / GITHUB PAGES]**

---

## ✨ Klíčové funkce a mechaniky

### 1. Výukové moduly & Smart Algoritmus
* **Kompletní příprava na CERMAT:** Databáze obsahuje 150+ komplexních otázek inspirovaných reálnými didaktickými testy, které jsou rozdělené do 6 samostatných modulů (*Pravopis, Lexikologie, Syntax, Porozumění textu, Stylistika, Literatura*).
* **Spaced Repetition (Chytré opakování):** Algoritmus na pozadí analyzuje historii odpovědí. Otázky, ve kterých uživatel dříve chyboval, se v testu objevují prioritně, dokud nedojde k jejich stoprocentnímu zafixování.
* **Focus Mode (Soustředěný režim):** Při spuštění kvízu se postranní panely automaticky skryjí a rozvržení se symetricky vycentruje, aby se maximalizovalo soustředění na text.

### 2. Gamifikace a Meta-hra
* **Ekonomika lístků (Měna):** Za každou správnou odpověď uživatel získává lístky, které slouží jako platidlo v herním obchodě.
* **Zahrada a pěstování Sakury:** Za nasbírané lístky lze postupně dokupovat vývojová stádia rostoucí květiny (*Květináč ➔ Stonek ➔ Listy ➔ Poupě ➔ Plný květ*). Květina je vykreslována v reálném čase pomocí dynamických SVG vektorů.
* **XP Systém & Denní Streak:** Sběr zkušeností plní ukazatel úrovně (Level) a odemyká čestné hodnosti (*Učeň, Zahradník, Eko Farmář, Mistr*). Systém zároveň hlídá pravidelnost pomocí počítadla denní aktivity.

### 3. Technologická optimalizace
* **Pružná hmatová odezva (Tactile Feel):** Všechny ovládací prvky a tlačítka mají upravené chování na kliknutí a dotyk (pružný zpětný ráz pomocí CSS transformací).
* **Syntetizované audio:** Zvukové efekty (kliknutí, správná odpověď, chyba) jsou generovány v reálném čase přes nativní `AudioContext` bez nutnosti stahovat externí MP3 soubory.
* **No-Scroll mřížka:** Rozvržení je fixováno na výšku obrazovky. Dlouhé textové ukázky mají vlastní vnitřní izolovaný posuvník, což eliminuje otravné posouvání celé stránky na mobilech.

---

## 🛠️ Použité technologie

* **Frontend:** HTML5, CSS3 (Custom Properties, Flexbox, Keyframes)
* **Logika:** Pure JavaScript (ES6+ Moduly, Asynchronní operace)
* **Build nástroj / Bundler:** Vite
* **Knihovny:** `canvas-confetti` (efekt při stoprocentní úspěšnosti)
* **Úložiště:** `Web Storage API (LocalStorage)` pro trvalé ukládání herního postupu a historie chyb.

---

## 💻 Instalace a lokální spuštění

Pro spuštění projektu na svém počítači se ujistěte, že máte nainstalovaný **Node.js**.

1. **Klonování repozitáře:**
   ```bash
   git clone [https://github.com/TVOJE-UZIVATELSKE-JMENO/NAZEV-REPOZITARE.git](https://github.com/TVOJE-UZIVATELSKE-JMENO/NAZEV-REPOZITARE.git)
   cd NAZEV-REPOZITARE