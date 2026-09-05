import type { Env } from './types'

export interface EmailMessageInput { to: string; subject: string; text: string }
export interface EmailSender { send(message: EmailMessageInput): Promise<void> }

export class ConsoleEmailSender implements EmailSender {
  async send(message: EmailMessageInput): Promise<void> {
    console.log(`[email:console] to=${message.to} subject=${JSON.stringify(message.subject)}\n${message.text}`)
  }
}

export class ResendEmailSender implements EmailSender {
  constructor(private readonly apiKey: string, private readonly fromName: string, private readonly fromAddress: string) {}
  async send(message: EmailMessageInput): Promise<void> {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${this.apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: `${this.fromName} <${this.fromAddress}>`, to: [message.to], subject: message.subject, text: message.text }),
    })
    if (!res.ok) throw new Error(`Falha ao enviar e-mail (Resend ${res.status}).`)
  }
}

export function getEmailSender(env: Env): EmailSender {
  return env.RESEND_API_KEY
    ? new ResendEmailSender(env.RESEND_API_KEY, env.EMAIL_FROM_NAME, env.EMAIL_FROM_ADDRESS)
    : new ConsoleEmailSender()
}
