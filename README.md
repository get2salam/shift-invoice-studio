# Shift Invoice Studio

A polished, contractor-friendly invoicing app for turning work logs into clean invoices.

Upload a photographed timesheet, review the extracted shifts, customise company and client details, then export the result as PDF, Excel, or CSV.

![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.3-38bdf8?logo=tailwindcss)
![Vitest](https://img.shields.io/badge/Tested_with-Vitest-6E9F18?logo=vitest)

## Why it is useful

Contractors and agency workers often get paid from handwritten or photographed shift logs.
This project makes that workflow easier by combining OCR-assisted extraction with manual cleanup and export-ready invoice outputs.

## Highlights

- OCR-assisted shift extraction with Tesseract.js
- Manual shift entry and editing
- Configurable business profile, client profile, and rates
- Draft persistence in local storage
- Validation hints before export
- Summary dashboard for pay period, hours, and totals
- PDF, Excel, and CSV export options
- Invoice notes and custom payment terms

## Tech stack

- Next.js 14 App Router
- React 18 + TypeScript
- Tailwind CSS
- Tesseract.js for OCR
- jsPDF + jspdf-autotable for PDF export
- SheetJS for Excel export
- Vitest for unit tests

## Local development

```bash
npm install
npm run dev
```

Open <http://localhost:3000>.

## Quality commands

```bash
npm run build
npm run lint
npm run typecheck
npm run test
```

## Project structure

```text
src/
  app/
  components/
  lib/
tests/
```

## Nice portfolio talking points

- Replaced hardcoded demo data with reusable, public-safe defaults
- Made invoice data configurable in the UI instead of buried in source files
- Added a persistent draft workflow for real daily use
- Added validation and summary layers so the app feels like a real tool, not just a demo
- Added multiple export formats for different bookkeeping workflows

## License

MIT
