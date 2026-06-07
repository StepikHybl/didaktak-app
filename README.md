# 🌸 Eko Akademie — Sakura Cyber-Cozy Edition

Interaktivní webová aplikace pro přípravu na didaktické testy z českého a anglického jazyka. Projekt spojuje silnou gamifikaci, estetický Sakura Cyber-Cozy styl a rychlou mobilní optimalizaci.

---

## 🔗 Živé demo

Live demo:

- https://StepikHybl.github.io/didaktak-app

> Pokud používáš Vercel nebo jinou platformu pro nasazení, aktualizuj tento odkaz na svůj oficiální web.

## 📥 Klonování projektu

Klonuj repozitář s reálným GitHub účtem:

```bash
git clone https://github.com/StepikHybl/didaktak-app.git
cd didaktak-app
```

---

## ✨ Hlavní vlastnosti

- Herní příprava: Testy jsou zpracovány jako interaktivní kvízy s odměnami.
- Smart opakování: aplikace preferuje otázky, kde uživatel dříve chyboval.
- Focus Mode: při testu se skrývají rozptylující panely a obsah se centrovaně vyrovná.
- Optimalizace: navrženo pro 60 FPS a plynulé chování i na mobilu.

## 🎮 Gamifikace & meta-hra

- Ekonomika lístků: správné odpovědi přidávají herní měnu.
- Sakura zahrada: nasbírané lístky lze investovat do růstu rostliny.
- XP systém a denní streak: motivuje pravidelné opakování a zvyšování úrovně.

## 🧠 Výukové moduly

Aplikace obsahuje 150+ otázek inspirovaných reálnými didaktickými testy, rozdělených do těchto modulů:

- Pravopis
- Lexikologie
- Syntax
- Porozumění textu
- Stylistika
- Literatura

---

## ⚙️ Použité technologie

- HTML5, CSS3 (Custom Properties, Flexbox, Keyframes)
- JavaScript (ES6 moduly)
- Vite
- canvas-confetti pro vizuální efekty
- Web Storage API (LocalStorage) pro uložení postupu a historie chyb

---

## 🚀 Spuštění místně

1. Ujisti se, že máš nainstalovaný Node.js.
2. Nainstaluj závislosti:

```bash
npm install
```

3. Spusť vývojový server:

```bash
npm run dev
```

4. Otevři v prohlížeči:

```text
http://localhost:5173
```

### Testování na mobilu/tabletu

```bash
npm run dev -- --host
```

Poté otevři adresu `Network` (např. `http://192.168.1.XX:5173`) ve svém telefonu připojeném do stejné sítě.

---

## 📁 Struktura projektu

- `data_cj/` – české moduly
  - `data_cj_lexikologie.js`
  - `data_cj_literatura.js`
  - `data_cj_porozumeni.js`
  - `data_cj_pravopis.js`
  - `data_cj_stylistika.js`
  - `data_cj_syntax.js`
- `data_en.js` – anglická databáze
- `index.html` – hlavní stránka
- `main.js` – core logika a stav
- `style.css` – Sakura Cyber-Cozy design a animace
- `package.json` – konfigurace projektu
- `README.md` – dokumentace

---

## 📜 Licence

Tento projekt je open-source a je šířen pod licencí MIT.
