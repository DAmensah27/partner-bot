# Partner Bot

A React front end for the Gen AI MLT Partner Bot course. A user picks a company,
filing year, and period, asks a question about the company's quarterly (10-Q)
filing, and sees an LLM-generated answer.

Built with Vite + React + TypeScript, Amplify UI components, and an Amplify
Gen 2 backend (Cognito auth). Hosted on AWS Amplify.

## Status

- **Chat form** — done. Four inputs (company, year, period, question) compose a
  request body that conforms to the Lambda Contract and render the answer.
- **Handler** — currently a stub in `src/App.tsx` (`submitQuery`) that logs the
  request body and returns a fake response. The live API Gateway + Lambda
  integration replaces it in a later module.
- **Auth** — Cognito User Pool is defined in `amplify/auth/resource.ts`, wired
  into the UI in a later module.

## Develop

```bash
npm install
npm run dev            # Vite dev server on http://localhost:5173
```

The app runs against the stub handler with no backend required. Open the browser
console and submit the form to see the contract-shaped request body logged.

## Amplify backend (sandbox)

```bash
npx ampx sandbox       # deploys a personal cloud sandbox, writes amplify_outputs.json
```

`amplify_outputs.json` is generated and gitignored. `src/main.tsx` configures
Amplify from it automatically when present, and falls back to the stub when it
is absent (so the app builds and runs without a deployed backend).

## Contract

Request body sent to the inference Lambda:

```json
{
  "question": "What were the key revenue drivers this quarter?",
  "ticker": "MSFT",
  "year": 2024,
  "period": "Q2"
}
```

Response shape:

```json
{ "answer": "...", "meta": {} }
```

Company display names map to tickers in `COMPANIES` (`src/App.tsx`); `period` is
one of `Q1 Q2 Q3 Q4 FY`; `year` is submitted as an integer.
