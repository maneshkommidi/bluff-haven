'use client'

import { useState, useEffect } from 'react'
import { DayPicker, DateRange } from 'react-day-picker'
import 'react-day-picker/dist/style.css'
import { format, differenceInCalendarDays, isBefore, startOfDay } from 'date-fns'

interface Quote {
  total: number
  base_rent: number
  nights: number
  fees: { name: string; amount: number }[]
  taxes: { name: string; amount: number }[]
  currency: string
}

interface GuestForm {
  firstName: string
  lastName: string
  email: string
  phone: string
  adults: number
  children: number
  notes: string
}

export default function BookPage() {
  const [range, setRange] = useState<DateRange | undefined>()
  const [disabledDays, setDisabledDays] = useState<Date[]>([])
  const [availabilityLoaded, setAvailabilityLoaded] = useState(false)
  const [availabilityError, setAvailabilityError] = useState<string | null>(null)
  const [quote, setQuote] = useState<Quote | null>(null)
  const [quoteError, setQuoteError] = useState<string | null>(null)
  const [loadingQuote, setLoadingQuote] = useState(false)
  const [step, setStep] = useState<'dates' | 'details' | 'payment'>('dates')
  const [form, setForm] = useState<GuestForm>({
    firstName: '', lastName: '', email: '', phone: '',
    adults: 2, children: 0, notes: '',
  })

  // Load blocked dates from OwnerRez
  useEffect(() => {
    fetch('/api/availability')
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json()
      })
      .then((days: { date: string; available: boolean }[]) => {
        const today = startOfDay(new Date())
        const blocked = days
          .filter(d => !d.available)
          .map(d => {
            const [year, month, day] = d.date.split('-').map(Number)
            return new Date(year, month - 1, day)
          })
          .filter(d => !isBefore(d, today))
        setDisabledDays(blocked)
        setAvailabilityLoaded(true)
      })
      .catch(err => {
        console.error('Availability error:', err)
        setAvailabilityError('Could not load availability. Please refresh.')
        setAvailabilityLoaded(true)
      })
  }, [])

  // Fetch quote whenever dates or guest count changes
  useEffect(() => {
    if (!range?.from || !range?.to) {
      setQuote(null)
      setQuoteError(null)
      return
    }
    setLoadingQuote(true)
    setQuoteError(null)
    const arrival   = format(range.from, 'yyyy-MM-dd')
    const departure = format(range.to,   'yyyy-MM-dd')
    fetch(`/api/quote?arrival=${arrival}&departure=${departure}&adults=${form.adults}&children=${form.children}`)
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json()
      })
      .then(data => {
        if (data.error) throw new Error(data.error)
        setQuote(data)
      })
      .catch(err => {
        console.error('Quote error:', err)
        setQuoteError('Could not load pricing. Please try different dates.')
      })
      .finally(() => setLoadingQuote(false))
  }, [range, form.adults, form.children])

  const nights = range?.from && range?.to
    ? differenceInCalendarDays(range.to, range.from)
    : 0

  const canContinueFromDates = range?.from && range?.to && nights > 0 && quote && !loadingQuote
  const canContinueFromDetails = form.firstName && form.lastName && form.email && form.phone

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="max-w-5xl mx-auto px-6 py-12">

        <div className="mb-10">
          <a href="/" className="text-stone-500 text-sm hover:text-stone-700">← Bluff Haven Retreat</a>
          <h1 className="text-3xl font-bold text-stone-800 mt-3">Book your stay</h1>
          <p className="text-stone-500 mt-1">Best rate guaranteed — no service fees</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-6">

            {/* Step 1: Calendar */}
            <div className="bg-white rounded-2xl border border-stone-100 p-6">
              <h2 className="font-semibold text-stone-800 mb-1">1. Select dates</h2>

              {!availabilityLoaded && (
                <p className="text-stone-400 text-sm mb-4 animate-pulse">Loading availability...</p>
              )}
              {availabilityError && (
                <p className="text-red-500 text-sm mb-4">{availabilityError}</p>
              )}
              {availabilityLoaded && !availabilityError && (
                <p className="text-stone-400 text-xs mb-4">Strikethrough dates are already booked</p>
              )}

              <DayPicker
                mode="range"
                selected={range}
                onSelect={setRange}
                disabled={[{ before: new Date() }, ...disabledDays]}
                numberOfMonths={2}
                pagedNavigation
                showOutsideDays={false}
                modifiersStyles={{
                  disabled: { textDecoration: 'line-through', opacity: 0.35 },
                  selected: { backgroundColor: '#292524', color: 'white' },
                  range_middle: { backgroundColor: '#e7e5e4', color: '#292524' },
                  today: { fontWeight: 'bold' },
                }}
              />

              {range?.from && range?.to && (
                <div className="mt-3 p-3 bg-stone-50 rounded-lg text-sm text-stone-600">
                  <span className="font-medium">{format(range.from, 'MMM d')}</span>
                  {' → '}
                  <span className="font-medium">{format(range.to, 'MMM d, yyyy')}</span>
                  {' · '}
                  <span>{nights} night{nights !== 1 ? 's' : ''}</span>
                </div>
              )}
            </div>

            {/* Guest count */}
            {range?.from && range?.to && (
              <div className="bg-white rounded-2xl border border-stone-100 p-6">
                <h2 className="font-semibold text-stone-800 mb-4">Guests</h2>
                <div className="flex gap-6">
                  <div>
                    <label className="text-sm text-stone-600 block mb-1">Adults</label>
                    <select
                      className="border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-stone-800"
                      value={form.adults}
                      onChange={e => setForm(f => ({ ...f, adults: parseInt(e.target.value) }))}
                    >
                      {[1,2,3,4,5,6].map(n => <option key={n} value={n}>{n} adult{n !== 1 ? 's' : ''}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm text-stone-600 block mb-1">Children</label>
                    <select
                      className="border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-stone-800"
                      value={form.children}
                      onChange={e => setForm(f => ({ ...f, children: parseInt(e.target.value) }))}
                    >
                      {[0,1,2,3,4].map(n => <option key={n} value={n}>{n} child{n !== 1 ? 'ren' : ''}</option>)}
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Guest details */}
            {step !== 'dates' && (
              <div className="bg-white rounded-2xl border border-stone-100 p-6">
                <h2 className="font-semibold text-stone-800 mb-4">2. Your details</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-stone-600 block mb-1">First name</label>
                    <input
                      className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-stone-800"
                      value={form.firstName}
                      onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))}
                      placeholder="Jane"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-stone-600 block mb-1">Last name</label>
                    <input
                      className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-stone-800"
                      value={form.lastName}
                      onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))}
                      placeholder="Smith"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-stone-600 block mb-1">Email</label>
                    <input
                      type="email"
                      className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-stone-800"
                      value={form.email}
                      onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                      placeholder="jane@example.com"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-stone-600 block mb-1">Phone</label>
                    <input
                      type="tel"
                      className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-stone-800"
                      value={form.phone}
                      onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                      placeholder="+1 (555) 000-0000"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-sm text-stone-600 block mb-1">
                      Special requests <span className="text-stone-400">(optional)</span>
                    </label>
                    <textarea
                      rows={3}
                      className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-stone-800 resize-none"
                      value={form.notes}
                      onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                      placeholder="Early check-in, anniversary, accessibility needs..."
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Payment */}
            {step === 'payment' && (
              <div className="bg-white rounded-2xl border border-stone-100 p-6">
                <h2 className="font-semibold text-stone-800 mb-4">3. Payment</h2>
                <div className="bg-stone-50 rounded-xl p-6 text-center text-stone-400 text-sm">
                  Stripe payment form — coming in next step
                </div>
              </div>
            )}

            {/* Action buttons */}
            {step === 'dates' && (
              <button
                onClick={() => setStep('details')}
                disabled={!canContinueFromDates}
                className="w-full bg-stone-800 text-white font-semibold py-4 rounded-xl hover:bg-stone-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {!range?.from         ? 'Select check-in date' :
                 !range?.to           ? 'Select check-out date' :
                 loadingQuote          ? 'Calculating price...' :
                 quoteError            ? 'Select different dates' :
                                        'Continue to your details →'}
              </button>
            )}

            {step === 'details' && (
              <button
                onClick={() => setStep('payment')}
                disabled={!canContinueFromDetails}
                className="w-full bg-stone-800 text-white font-semibold py-4 rounded-xl hover:bg-stone-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Continue to payment →
              </button>
            )}

            {step === 'payment' && (
              <button className="w-full bg-stone-800 text-white font-semibold py-4 rounded-xl hover:bg-stone-700 transition-colors">
                Pay ${quote?.total?.toFixed(2)} now →
              </button>
            )}
          </div>

          {/* Price summary sidebar */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-2xl border border-stone-100 p-6 sticky top-6">
              <h3 className="font-semibold text-stone-800 mb-4">Price summary</h3>

              {!range?.from && (
                <p className="text-stone-400 text-sm">Select dates to see pricing</p>
              )}

              {range?.from && loadingQuote && (
                <p className="text-stone-400 text-sm animate-pulse">Calculating...</p>
              )}

              {quoteError && (
                <p className="text-red-500 text-sm">{quoteError}</p>
              )}

              {quote && !loadingQuote && (
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-stone-600">Rent × {quote.nights} nights</span>
                    <span className="font-medium">${quote.base_rent?.toFixed(2)}</span>
                  </div>
                  {quote.fees?.map((f, i) => (
                    <div key={i} className="flex justify-between">
                      <span className="text-stone-600">{f.name}</span>
                      <span className="font-medium">${f.amount?.toFixed(2)}</span>
                    </div>
                  ))}
                  {quote.taxes?.map((t, i) => (
                    <div key={i} className="flex justify-between">
                      <span className="text-stone-600">{t.name}</span>
                      <span className="font-medium">${t.amount?.toFixed(2)}</span>
                    </div>
                  ))}
                  <div className="border-t border-stone-100 pt-3 flex justify-between font-semibold text-base">
                    <span>Total</span>
                    <span>${quote.total?.toFixed(2)}</span>
                  </div>
                  <p className="text-xs text-stone-400 pt-1">No Airbnb or VRBO service fees</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
