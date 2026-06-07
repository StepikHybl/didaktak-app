# 🌸 Sakura Study Garden

![Build & Deploy](https://github.com/StepikHybl/didaktak-app/actions/workflows/deploy.yml/badge.svg)
![Pages](https://github.com/StepikHybl/didaktak-app/actions/workflows/deploy.yml/badge.svg)

Moderní webová aplikace pro přípravu na didaktické testy z českého a anglického jazyka. Projekt kombinuje chytrou gamifikaci, čistý Sakura Cyber-Cozy design a optimalizaci pro plynulé mobilní hraní.

---

## 🔗 Živé demo

Live demo:

- https://StepikHybl.github.io/didaktak-app

## 📥 Klonování projektu

Klonuj repozitář z GitHubu:

```bash
git clone https://github.com/StepikHybl/didaktak-app.git
cd didaktak-app
```

---

## ✨ Co dělá Sakura Study Garden výjimečnou

- Interaktivní vzdělávání v herním stylu.
- Inteligentní opakování otázek podle chybovosti.
- Focus Mode pro soustředěné testování bez rušivých prvků.
- Optimalizovaný výkon pro 60 FPS i na mobilních zařízeních.

## 🎮 Gamifikace a progres

- Lístky jako herní měna za správné odpovědi.
- Rostoucí Sakura: investuj odměny do růstu květiny.
- XP systém a denní streak pro pravidelný trénink.

## 🧠 Výukové moduly

Více než 150 otázek rozdělených do těchto témat:

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
- canvas-confetti pro oslavy úspěchů
- Web Storage API (LocalStorage) pro ukládání postupu a historie chyb

---

## 🚀 Spuštění lokálně

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

### Testování na telefonu/tabletu

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
- `main.js` – aplikace a logika
- `style.css` – Sakura design a animace
- `package.json` – konfigurace projektu
- `README.md` – dokumentace

---

## 📜 Licence

Tento projekt je open-source a je šířen pod licencí MIT.

