import { QUOTES, type Quote } from '#shared/quotes'

const shuffle = (items: Quote[]) => {
  const next = [...items]
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    const left = next[i]
    const right = next[j]
    if (!left || !right) continue
    next[i] = right
    next[j] = left
  }
  return next
}

export const useQuoteStore = () => {
  const deck = useState<Quote[]>('quote-deck', () => [])

  const draw = (except: string[] = []): Quote => {
    const blocked = new Set(except)
    deck.value = deck.value.filter((quote) => !blocked.has(quote.id))
    if (!deck.value.length) {
      const refill = shuffle(QUOTES.filter((quote) => !blocked.has(quote.id)))
      deck.value = refill.length ? refill : shuffle(QUOTES)
    }
    const next = deck.value.pop()
    if (!next) {
      return QUOTES[0] as Quote
    }
    return next
  }

  return {
    quotes: QUOTES,
    draw,
  }
}
