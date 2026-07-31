import { useState, type FormEvent } from 'react'
import {
  Button,
  Heading,
  SelectField,
  TextField,
  View,
  Text,
  Loader,
  Alert,
} from '@aws-amplify/ui-react'
import './App.css'

// Display name -> stock ticker. The select shows the keys; the request body
// carries the ticker. Add companies here as your Lambda supports them.
const COMPANIES: Record<string, string> = {
  Apple: 'AAPL',
  Amazon: 'AMZN',
  Microsoft: 'MSFT',
  Google: 'GOOGL',
  Nvidia: 'NVDA',
}

// Exactly the period values defined in the Lambda Contract.
const PERIODS = ['Q1', 'Q2', 'Q3', 'Q4', 'FY'] as const

// Last five years, newest first, generated so the form stays current.
const currentYear = new Date().getFullYear()
const YEARS = Array.from({ length: 5 }, (_, i) => currentYear - i)

// Shapes from the Lambda Contract.
interface RequestBody {
  question: string
  ticker: string
  year: number
  period: string
}
interface ResponseBody {
  answer: string
  meta: Record<string, unknown>
}

// Calls the deployed inference API (API Gateway -> Lambda). The endpoint URL
// comes from a Vite env var (VITE_INFERENCE_API), never hardcoded.
async function submitQuery(body: RequestBody): Promise<ResponseBody> {
  const endpoint = import.meta.env.VITE_INFERENCE_API
  if (!endpoint) {
    throw new Error('VITE_INFERENCE_API is not set. Add it to .env.local.')
  }

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    // The Lambda returns { error, message } for validation/other failures.
    throw new Error(data.message || data.error || `Request failed (${response.status}).`)
  }
  return data as ResponseBody
}

export default function App() {
  const companyNames = Object.keys(COMPANIES)

  const [company, setCompany] = useState(companyNames[0])
  const [year, setYear] = useState(String(YEARS[0]))
  const [period, setPeriod] = useState<string>(PERIODS[0])
  const [question, setQuestion] = useState('')

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [answer, setAnswer] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setLoading(true)
    setError(null)
    setAnswer(null)

    // Map the display name to a ticker and coerce year to an integer
    // before building the contract-conforming body.
    const body: RequestBody = {
      question,
      ticker: COMPANIES[company],
      year: Number(year),
      period,
    }

    try {
      const response = await submitQuery(body)
      setAnswer(response.answer)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <View className="app">
      <Heading level={1}>Partner Bot</Heading>
      <Text className="subtitle">
        Ask a question about a company's quarterly (10-Q) filing.
      </Text>

      <View as="form" className="form" onSubmit={handleSubmit}>
        <SelectField
          label="Company"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
        >
          {companyNames.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </SelectField>

        <SelectField
          label="Year"
          value={year}
          onChange={(e) => setYear(e.target.value)}
        >
          {YEARS.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </SelectField>

        <SelectField
          label="Period"
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
        >
          {PERIODS.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </SelectField>

        <TextField
          label="Question"
          placeholder="What were the key revenue drivers this quarter?"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          required
        />

        <Button type="submit" variation="primary" isLoading={loading}>
          Ask
        </Button>
      </View>

      {loading && (
        <View className="status">
          <Loader />
          <Text>Thinking…</Text>
        </View>
      )}

      {error && (
        <Alert variation="error" heading="Request failed" className="status">
          {error}
        </Alert>
      )}

      {answer && !loading && (
        <View className="answer">
          <Heading level={3}>Answer</Heading>
          <Text>{answer}</Text>
        </View>
      )}
    </View>
  )
}
