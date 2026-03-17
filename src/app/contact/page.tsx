'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function ContactPage() {
  const [form, setForm]     = useState({ name: '', email: '', message: '' })
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('sending')
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error()
      setStatus('sent')
      setForm({ name: '', email: '', message: '' })
    } catch {
      setStatus('error')
    }
  }

  return (
    <div style={{ background: '#faf7f2', minHeight: '100vh' }}>

      {/* Header */}
      <div style={{ background: '#1a2e1a' }} className="px-6 py-16">
        <div className="max-w-3xl mx-auto">
          <Link href="/"
            className="inline-flex items-center gap-2 text-sm font-light mb-8 transition-colors"
            style={{ color: 'rgba(201,168,76,0.7)' }}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/>
            </svg>
            Back to Bluff Haven
          </Link>
          <div className="h-px w-12 mb-6" style={{ background: '#c9a84c' }} />
          <h1 className="font-display text-4xl font-semibold text-white mb-3">Get in Touch</h1>
          <p className="font-light" style={{ color: 'rgba(255,255,255,0.5)' }}>
            Questions about the cabin? We'll get back to you within a few hours.
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-3xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-2 gap-12">

          {/* Form card */}
          <div className="md:col-span-1 bg-white rounded-sm border p-8"
            style={{ borderColor: 'rgba(139,111,71,0.15)' }}>

            {status === 'sent' ? (
              <div className="text-center py-8">
                <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4"
                  style={{ background: 'rgba(74,103,65,0.1)' }}>
                  <svg className="w-6 h-6" style={{ color: '#4a6741' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                  </svg>
                </div>
                <h3 className="font-display text-xl font-semibold mb-2" style={{ color: '#1a2e1a' }}>Message sent!</h3>
                <p className="text-sm font-light" style={{ color: '#6b5a3e' }}>We'll get back to you shortly.</p>
                <button onClick={() => setStatus('idle')}
                  className="mt-6 text-sm underline underline-offset-2 font-light"
                  style={{ color: '#4a6741' }}>
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-xs uppercase tracking-widest font-medium mb-2" style={{ color: '#6b5a3e' }}>
                    Your name
                  </label>
                  <input
                    type="text" required
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    className="w-full px-4 py-3 rounded-sm border text-sm font-light outline-none focus:border-[#c9a84c] transition-colors"
                    style={{ borderColor: 'rgba(139,111,71,0.25)', background: '#faf7f2', color: '#1a2e1a' }}
                    placeholder="e.g. Sarah Johnson"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-widest font-medium mb-2" style={{ color: '#6b5a3e' }}>
                    Email address
                  </label>
                  <input
                    type="email" required
                    value={form.email}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    className="w-full px-4 py-3 rounded-sm border text-sm font-light outline-none focus:border-[#c9a84c] transition-colors"
                    style={{ borderColor: 'rgba(139,111,71,0.25)', background: '#faf7f2', color: '#1a2e1a' }}
                    placeholder="you@example.com"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-widest font-medium mb-2" style={{ color: '#6b5a3e' }}>
                    Message
                  </label>
                  <textarea
                    required rows={5}
                    value={form.message}
                    onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                    className="w-full px-4 py-3 rounded-sm border text-sm font-light outline-none focus:border-[#c9a84c] transition-colors resize-none"
                    style={{ borderColor: 'rgba(139,111,71,0.25)', background: '#faf7f2', color: '#1a2e1a' }}
                    placeholder="Ask us anything about the cabin, dates, pricing..."
                  />
                </div>
                {status === 'error' && (
                  <p className="text-xs" style={{ color: '#c0392b' }}>Something went wrong. Please try again or email us directly.</p>
                )}
                <button type="submit" disabled={status === 'sending'}
                  className="w-full py-4 text-sm font-medium uppercase tracking-widest rounded-sm transition-all duration-300 disabled:opacity-50"
                  style={{ background: '#1a2e1a', color: '#c9a84c' }}>
                  {status === 'sending' ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            )}
          </div>

          {/* Info sidebar */}
          <div className="space-y-6">
            {[
              { icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z', label: 'Email', value: 'bluffhavenretreat@gmail.com' },
              { icon: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z', label: 'Address', value: '2439 Bruke Ave, Sevierville, TN 37876' },
              { icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z', label: 'Response time', value: 'Usually within a few hours' },
            ].map(item => (
              <div key={item.label} className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-sm flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(26,46,26,0.08)' }}>
                  <svg className="w-5 h-5" style={{ color: '#4a6741' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d={item.icon}/>
                  </svg>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-widest font-medium mb-1" style={{ color: '#9b8b7a' }}>{item.label}</p>
                  <p className="text-sm font-light" style={{ color: '#1a2e1a' }}>{item.value}</p>
                </div>
              </div>
            ))}

            <div className="pt-6 border-t" style={{ borderColor: 'rgba(139,111,71,0.15)' }}>
              <p className="text-xs uppercase tracking-widest font-medium mb-3" style={{ color: '#9b8b7a' }}>Ready to book?</p>
              <Link href="/book"
                className="inline-flex items-center gap-2 text-sm font-medium transition-colors"
                style={{ color: '#4a6741' }}>
                Check availability & book direct
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3"/>
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
