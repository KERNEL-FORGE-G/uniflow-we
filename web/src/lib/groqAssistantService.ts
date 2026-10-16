import type { AssistantTurn } from './appwrite'

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions'
const GROQ_MODEL = 'llama-3.3-70b-versatile'

export interface GroqChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

/**
 * Service IA propulsé par Groq pour l'assistant Uni.
 * Utilise la clé API Groq (ultra-rapide, Llama 3.3 70B Versatile).
 */
export async function askGroq(
  messages: AssistantTurn[],
  systemPrompt?: string,
  apiKeyOverride?: string
): Promise<string> {
  const apiKey =
    apiKeyOverride ||
    (import.meta.env.VITE_GROQ_API_KEY as string | undefined) ||
    ''

  if (!apiKey) {
    throw new Error('Clé API Groq non configurée (VITE_GROQ_API_KEY).')
  }

  const formattedMessages: GroqChatMessage[] = []

  if (systemPrompt) {
    formattedMessages.push({ role: 'system', content: systemPrompt })
  } else {
    formattedMessages.push({
      role: 'system',
      content:
        "Tu es Uni, l'assistant d'apprentissage intelligent et bienveillant de la plateforme UniFlow, créée par la startup KERNEL FORGE. Tu aides les étudiants indépendants, les délégués et les enseignants dans l'organisation de leurs cours, devoirs, révisions et méthodes de travail. Réponds de façon concise, dynamique et chaleureuse en français.",
    })
  }

  for (const turn of messages) {
    formattedMessages.push({
      role: turn.role,
      content: turn.content,
    })
  }

  const res = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages: formattedMessages,
      temperature: 0.6,
      max_tokens: 1024,
      top_p: 0.95,
    }),
  })

  if (!res.ok) {
    const errorBody = await res.text()
    throw new Error(`Groq API error (${res.status}): ${errorBody.slice(0, 200)}`)
  }

  const data = await res.json()
  const reply = data.choices?.[0]?.message?.content
  if (!reply) {
    throw new Error('Réponse vide de Groq')
  }

  return reply.trim()
}
