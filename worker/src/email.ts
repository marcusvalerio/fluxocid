import type { Env } from './types'

export interface EmailMessageInput {
  to: string
  subject: string
  text: string
}

export interface EmailSender {
  send(message: EmailMessageInput): Promise<void>
}

/**
 * Dev/fallback sender — logs to the Worker console instead of delivering anything. Used whenever
 * no real email provider is configured, so local development and tests never depend on external
 * infrastructure, and a missing secret fails loudly (in logs) rather than pretending to work.
 */
export class ConsoleEmailSender implements EmailSender {
  async send(message: EmailMessageInput): Promise<void> {
    console.log(`[email:console] to=${message.to} subject=${JSON.stringify(message.subject)}\n${message.text}`)
  }
}

/**
 * Real transactional email via Resend's HTTP API (https://resend.com) — chosen because it's a
 * plain fetch() call with no SDK, works natively from Workers, and has a free tier suitable for
 * an app this size. This is NOT the Cloudflare Email Routing `send_email` binding: that binding
 * only delivers to a fixed, pre-verified destination address configured in the dashboard, so it
 * cannot send to arbitrary user-supplied signup addresses — the wrong tool for auth email. See
 * docs/DEPLOYMENT.md § E-mail transacional for exactly what manual setup this requires
 * (Resend account, verified sending domain, RESEND_API_KEY secret) and how to swap providers.
 */
export class ResendEmailSender implements EmailSender {
  constructor(
    private readonly apiKey: string,
    private readonly fromName: string,
    private readonly fromAddress: string,
  ) {}

  async send(message: EmailMessageInput): Promise<void> {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: `${this.fromName} <${this.fromAddress}>`,
        to: [message.to],
        subject: message.subject,
        text: message.text,
      }),
    })
    if (!res.ok) {
      const body = await res.text().catch(() => '')
      throw new Error(`Falha ao enviar e-mail (Resend ${res.status}): ${body}`)
    }
  }
}

export function getEmailSender(env: Env): EmailSender {
  if (env.RESEND_API_KEY) {
    return new ResendEmailSender(env.RESEND_API_KEY, env.EMAIL_FROM_NAME, env.EMAIL_FROM_ADDRESS)
  }
  return new ConsoleEmailSender()
}
