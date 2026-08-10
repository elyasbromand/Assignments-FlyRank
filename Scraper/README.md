# Scraper — Target Classification

A polite, focused web scraper for the **Target Classification** assignment. It collects book data from the `Travel`, `Mystery`, and `Historical Fiction` sections of [`books.toscrape.com`](https://books.toscrape.com/) — a sandbox site that explicitly permits scraping and is purpose-built for testing crawlers.

---

## Why `books.toscrape.com`?

This site was designed to be scraped: it allows automated access, provides a stable and predictable structure, and exposes no rate-limiting or legal barriers. It is therefore an appropriate target for an assignment scraper that must fetch resources politely and without overburdening a live service.

---

## Target Sections

The scraper is scoped to three book sections (a.k.a. "target classes"):

- **Travel**
- **Mystery**
- **Historical Fiction**

Each section is scraped individually so that books can later be grouped and classified by section.

---

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/elyasbromand/Assignments-FlyRank.git
cd Assignments-FlyRank/Scraper
```

### 2. Install dependencies

```bash
npm install
```

### 3. Run the scraper

```bash
npm start
```

By default the scraper iterates over the three configured sections and writes the collected book records to `output/books.json`.

---

## Author

**Elyas Bromand**
