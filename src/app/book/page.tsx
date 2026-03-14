'use client'

import { useState, useEffect, useCallback } from 'react'
import { DayPicker, DateRange } from 'react-day-picker'
import 'react-day-picker/dist/style.css'
import { format, differenceInCalendarDays, startOfDay } from 'date-fns'
import dynamic from 'next/dynamic'

const StripePaymentForm = dynamic(() => import('@/components/StripePaymentForm'), {
  ssr: false,
  loading: () => (
    <div className="space-y-4 animate-pulse">
      <div className="h-12 bg-stone-100 rounded-lg" />
      <div className="h-12 bg-stone-100 rounded-lg" />
      <div className="h-12 bg-stone-100 rounded-lg" />
    </div>
  ),
})

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

interface AvailabilityData {
  blockedDates: Set<string>
  checkoutOnlyDates: Set<string>
  minNightsMap: Map<string, number>  // minNights per arrival date
}

function toDateStr(date: Date): string {
  return date.getFullYear() + '-' +
    String(date.getMonth() + 1).padStart(2, '0') + '-' +
    String(date.getDate()).padStart(2, '0')
}

export default function BookPage() {
  const [range, setRange] = useState<DateRange | undefined>()
  const [availability, setAvailability] = useState<AvailabilityData>({
    blockedDates: new Set(),
    checkoutOnlyDates: new Set(),
    minNightsMap: new Map(),
  })
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
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [creatingPayment, setCreatingPayment] = useState(false)
  const [paymentError, setPaymentError] = useState<string | null>(null)
  const [touched, setTouched] = useState<Partial<Record<keyof GuestForm, boolean>>>({})

  const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
  const isValidPhone = (phone: string) => /^[\+]?[\d\s\-\(\)]{7,15}$/.test(phone.trim())

  const emailError = touched.email && form.email && !isValidEmail(form.email) ? 'Please enter a valid email address' : null
  const phoneError = touched.phone && form.phone && !isValidPhone(form.phone) ? 'Please enter a valid phone number' : null

  useEffect(() => {
    fetch('/api/availability')
      .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json() })
      .then((days: { date: string; available: boolean; minNights?: number }[]) => {
        const blockedSet = new Set(days.filter(d => !d.available).map(d => d.date))
        const checkoutOnly = new Set<string>()
        const minNightsMap = new Map<string, number>()
        for (const d of days) {
          if (d.minNights && d.minNights > 1) minNightsMap.set(d.date, d.minNights)
          if (!d.available) {
            const [y, m, day] = d.date.split('-').map(Number)
            const prev = new Date(y, m - 1, day - 1)
            const prevStr = toDateStr(prev)
            if (!blockedSet.has(prevStr)) checkoutOnly.add(d.date)
          }
        }
        for (const d of checkoutOnly) blockedSet.delete(d)
        setAvailability({ blockedDates: blockedSet, checkoutOnlyDates: checkoutOnly, minNightsMap })
        setAvailabilityLoaded(true)
      })
      .catch(err => {
        console.error('Availability error:', err)
        setAvailabilityError('Could not load availability. Please refresh.')
        setAvailabilityLoaded(true)
      })
  }, [])

  const isDateDisabled = useCallback((date: Date): boolean => {
    const today = startOfDay(new Date())
    // Disable today and all past dates
    if (date <= today) return true

    const dateStr = toDateStr(date)

    // Picking check-in: disable all blocked + checkout-only days
    if (!range?.from || range.to) {
      return availability.blockedDates.has(dateStr) || availability.checkoutOnlyDates.has(dateStr)
    }

    // Picking check-out: must be after from
    if (date <= range.from) return true

    // Disable dates that don't meet minimum night requirement
    const nightsFromFrom = Math.round((date.getTime() - range.from.getTime()) / (1000 * 60 * 60 * 24))
    const minN = availability.minNightsMap.get(toDateStr(range.from)) ?? 1
    if (nightsFromFrom < minN) return true

    // Walk from range.from+1 up to and including date.
    // The first blocked or checkout-only day we hit defines the hard stop.
    const cursor = new Date(range.from)
    cursor.setDate(cursor.getDate() + 1)
    while (cursor <= date) {
      const curStr = toDateStr(cursor)
      if (availability.checkoutOnlyDates.has(curStr)) {
        // This day is valid as checkout but nothing beyond it
        if (cursor.getTime() === date.getTime()) return false
        return true
      }
      if (availability.blockedDates.has(curStr)) return true
      cursor.setDate(cursor.getDate() + 1)
    }

    return false
  }, [range, availability])

  const isCheckoutOnly = useCallback((date: Date): boolean => {
    if (range?.from && !range.to) return false
    return availability.checkoutOnlyDates.has(toDateStr(date))
  }, [range, availability])

  // Returns the minNights for the current from date (or 1 if none)
  const fromMinNights = range?.from
    ? (availability.minNightsMap.get(toDateStr(range.from)) ?? 1)
    : 1

  // True when picking departure and this date is too close to from
  const isTooFewNights = useCallback((date: Date): boolean => {
    if (!range?.from || range.to) return false
    const nights = Math.round((date.getTime() - range.from.getTime()) / (1000 * 60 * 60 * 24))
    return nights > 0 && nights < fromMinNights
  }, [range, fromMinNights])

  useEffect(() => {
    if (!range?.from || !range?.to) { setQuote(null); setQuoteError(null); return }
    setLoadingQuote(true)
    setQuoteError(null)
    const arrival   = format(range.from, 'yyyy-MM-dd')
    const departure = format(range.to,   'yyyy-MM-dd')
    fetch(`/api/quote?arrival=${arrival}&departure=${departure}&adults=${form.adults}&children=${form.children}`)
      .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json() })
      .then(data => { if (data.error) throw new Error(data.error); setQuote(data) })
      .catch(err => { console.error('Quote error:', err); setQuoteError('Could not load pricing. Try different dates.') })
      .finally(() => setLoadingQuote(false))
  }, [range, form.adults, form.children])

  const nights = range?.from && range?.to ? differenceInCalendarDays(range.to, range.from) : 0
  const guestCount = form.adults + form.children
  const guestCountValid = guestCount >= 1 && guestCount <= 6
  const canContinueFromDates   = range?.from && range?.to && nights > 0 && quote && !loadingQuote && guestCountValid
  const canContinueFromDetails = form.firstName && form.lastName && form.email && form.phone && isValidEmail(form.email) && isValidPhone(form.phone)

  const handleContinueToPayment = async () => {
    if (!range?.from || !range?.to || !quote) return
    setCreatingPayment(true)
    setPaymentError(null)
    try {
      const res = await fetch('/api/booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          arrival:   format(range.from, 'yyyy-MM-dd'),
          departure: format(range.to,   'yyyy-MM-dd'),
          adults:    form.adults,
          children:  form.children,
          guest: {
            firstName: form.firstName,
            lastName:  form.lastName,
            email:     form.email,
            phone:     form.phone,
            notes:     form.notes,
          },
        }),
      })
      const data = await res.json()
      if (!res.ok || data.error) throw new Error(data.error ?? 'Payment setup failed')
      setClientSecret(data.clientSecret)
      setStep('payment')
    } catch (err: any) {
      setPaymentError(err.message ?? 'Could not initialize payment. Please try again.')
    } finally {
      setCreatingPayment(false)
    }
  }

  const stepOrder = { dates: 0, details: 1, payment: 2 }
  const currentOrder = stepOrder[step]

  return (
    <div className="min-h-screen bg-stone-50">
      <style>{`
        .rdp-day_checkoutOnly {
          position: relative;
        }
        .rdp-day_checkoutOnly button,
        .rdp-day_checkoutOnly .rdp-day_button {
          position: relative !important;
          cursor: not-allowed !important;
          overflow: hidden !important;
          border-radius: 50% !important;
          color: #374151 !important;
          background: transparent !important;
        }
        .rdp-day_checkoutOnly button::before,
        .rdp-day_checkoutOnly .rdp-day_button::before {
          content: '' !important;
          position: absolute !important;
          inset: 0 !important;
          background: linear-gradient(
            to bottom right,
            #d1d5db 0%,
            #d1d5db 50%,
            transparent 50%,
            transparent 100%
          ) !important;
          border-radius: 50% !important;
          pointer-events: none !important;
          z-index: 0 !important;
        }
        .rdp-day_checkoutOnly button > *,
        .rdp-day_checkoutOnly .rdp-day_button > * {
          position: relative !important;
          z-index: 1 !important;
        }
        .rdp-day_checkoutOnly:hover::after {
          content: 'Checkout only';
          position: absolute;
          bottom: 110%;
          left: 50%;
          transform: translateX(-50%);
          background: #1c1917;
          color: white;
          font-size: 11px;
          white-space: nowrap;
          padding: 4px 8px;
          border-radius: 6px;
          z-index: 30;
          pointer-events: none;
        }
        /* Too-few-nights: show min stay tooltip */
        .rdp-day_tooFewNights {
          position: relative;
        }
        .rdp-day_tooFewNights:hover::after {
          content: attr(data-min-nights);
          position: absolute;
          bottom: 110%;
          left: 50%;
          transform: translateX(-50%);
          background: #1c1917;
          color: white;
          font-size: 11px;
          white-space: nowrap;
          padding: 4px 8px;
          border-radius: 6px;
          z-index: 30;
          pointer-events: none;
        }
      `}</style>

      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="mb-8">
          <a href="/" className="text-stone-500 text-sm hover:text-stone-700 transition-colors">← Bluff Haven Retreat</a>
          <h1 className="text-3xl font-bold text-stone-800 mt-3">Book your stay</h1>
          <p className="text-stone-500 mt-1">Best rate guaranteed — no service fees</p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-8">
          {(['dates', 'details', 'payment'] as const).map((s, i) => {
            const sOrder = stepOrder[s]
            const isActive = s === step
            const isDone = sOrder < currentOrder
            const labels = ['Dates', 'Details', 'Payment']
            return (
              <div key={s} className="flex items-center gap-2">
                <div className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${
                  isActive ? 'text-stone-800' : isDone ? 'text-stone-500' : 'text-stone-300'
                }`}>
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${
                    isDone ? 'bg-stone-800 text-white' :
                    isActive ? 'bg-stone-800 text-white' :
                    'bg-stone-200 text-stone-400'
                  }`}>
                    {isDone ? '✓' : i + 1}
                  </span>
                  {labels[i]}
                </div>
                {i < 2 && <div className={`w-8 h-px ${isDone ? 'bg-stone-400' : 'bg-stone-200'}`} />}
              </div>
            )
          })}
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-6">

            {/* Step 1: Calendar */}
            <div className="bg-white rounded-2xl border border-stone-100 p-6">
              <h2 className="font-semibold text-stone-800 mb-1">Select dates</h2>
              {!availabilityLoaded && <p className="text-stone-400 text-sm mb-4 animate-pulse">Loading availability...</p>}
              {availabilityError && <p className="text-red-500 text-sm mb-4">{availabilityError}</p>}
              <DayPicker
                mode="range"
                selected={range}
                onSelect={(newRange) => {
                  if (!newRange?.from || !newRange?.to) { setRange(newRange); return }
                  // Cap the to-date at the first blocked/checkoutOnly day after from
                  const cursor = new Date(newRange.from)
                  cursor.setDate(cursor.getDate() + 1)
                  let maxTo = newRange.to
                  while (cursor <= newRange.to) {
                    const curStr = toDateStr(cursor)
                    if (availability.checkoutOnlyDates.has(curStr)) {
                      maxTo = new Date(cursor); break
                    }
                    if (availability.blockedDates.has(curStr)) {
                      // cant check out on a fully blocked day either
                      cursor.setDate(cursor.getDate() - 1)
                      maxTo = new Date(cursor); break
                    }
                    cursor.setDate(cursor.getDate() + 1)
                  }
                  setRange({ from: newRange.from, to: maxTo })
                }}
                disabled={isDateDisabled}
                modifiers={{
                  checkoutOnly: (date) => isCheckoutOnly(date),
                  tooFewNights: (date) => isTooFewNights(date),
                }}
                modifiersClassNames={{
                  checkoutOnly: 'rdp-day_checkoutOnly',
                  tooFewNights: 'rdp-day_tooFewNights',
                }}
                numberOfMonths={2}
                pagedNavigation
                showOutsideDays={false}
                modifiersStyles={{
                  disabled:     { color: '#c4b8b0', cursor: 'not-allowed' },
                  selected:     { backgroundColor: '#292524', color: 'white', borderRadius: '100%' },
                  range_start:  { backgroundColor: '#292524', color: 'white', borderRadius: '100% 0 0 100%' },
                  range_end:    { backgroundColor: '#292524', color: 'white', borderRadius: '0 100% 100% 0' },
                  range_middle: { backgroundColor: '#f5f4f3', color: '#292524', borderRadius: 0 },
                  today:        { fontWeight: '700' },
                }}
              />
              {(range?.from || range?.to) && (
                <div className="mt-3 flex items-center justify-between p-3 bg-stone-50 rounded-lg text-sm text-stone-600">
                  <span>
                    {range.from && <span className="font-medium">{format(range.from, 'MMM d')}</span>}
                    {range.from && range.to && (
                      <>
                        {' → '}
                        <span className="font-medium">{format(range.to, 'MMM d, yyyy')}</span>
                        {' · '}
                        <span>{nights} night{nights !== 1 ? 's' : ''}</span>
                      </>
                    )}
                    {range.from && !range.to && (
                      <span className="text-stone-400 ml-1">
                        — select checkout date
                        {fromMinNights > 1 && (
                          <span className="ml-1 text-amber-600 font-medium">· {fromMinNights}-night minimum</span>
                        )}
                      </span>
                    )}
                  </span>
                  <button
                    onClick={() => { setRange(undefined); setQuote(null); setQuoteError(null) }}
                    className="text-stone-400 hover:text-stone-700 text-xs underline underline-offset-2 transition-colors ml-4 flex-shrink-0"
                  >
                    Clear dates
                  </button>
                </div>
              )}
            </div>

            {/* Guest count */}
            {range?.from && range?.to && (
              <div className="bg-white rounded-2xl border border-stone-100 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-semibold text-stone-800">Guests</h2>
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                    form.adults + form.children >= 6
                      ? 'bg-red-50 text-red-600'
                      : 'bg-stone-100 text-stone-500'
                  }`}>
                    {form.adults + form.children} / 6 max
                  </span>
                </div>
                <div className="flex gap-6">
                  <div>
                    <label className="text-sm text-stone-600 block mb-1">Adults</label>
                    <select
                      className="border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-stone-800"
                      value={form.adults}
                      onChange={e => {
                        const adults = parseInt(e.target.value)
                        const maxChildren = Math.max(0, 6 - adults)
                        setForm(f => ({
                          ...f,
                          adults,
                          children: Math.min(f.children, maxChildren),
                        }))
                      }}
                    >
                      {[1,2,3,4,5,6].map(n => (
                        <option key={n} value={n}>{n} adult{n !== 1 ? 's' : ''}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm text-stone-600 block mb-1">Children</label>
                    <select
                      className="border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-stone-800"
                      value={form.children}
                      onChange={e => setForm(f => ({ ...f, children: parseInt(e.target.value) }))}
                    >
                      {[0,1,2,3,4,5].map(n => {
                        const wouldExceed = form.adults + n > 6
                        return (
                          <option key={n} value={n} disabled={wouldExceed}>
                            {n} child{n !== 1 ? 'ren' : ''}{wouldExceed ? ' (max reached)' : ''}
                          </option>
                        )
                      })}
                    </select>
                  </div>
                </div>
                {form.adults + form.children >= 6 && (
                  <p className="mt-3 text-xs text-red-500">
                    Maximum occupancy is 6 guests. Please adjust your guest count.
                  </p>
                )}
              </div>
            )}

            {/* Step 2: Guest details */}
            {step !== 'dates' && (
              <div className="bg-white rounded-2xl border border-stone-100 p-6">
                <h2 className="font-semibold text-stone-800 mb-4">Your details</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-stone-600 block mb-1">First name</label>
                    <input className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-stone-800"
                      value={form.firstName} onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))} placeholder="Jane" />
                  </div>
                  <div>
                    <label className="text-sm text-stone-600 block mb-1">Last name</label>
                    <input className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-stone-800"
                      value={form.lastName} onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))} placeholder="Smith" />
                  </div>
                  <div>
                    <label className="text-sm text-stone-600 block mb-1">Email</label>
                    <input
                      type="email"
                      className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 transition-colors ${
                        emailError ? 'border-red-300 focus:ring-red-400' : 'border-stone-200 focus:ring-stone-800'
                      }`}
                      value={form.email}
                      onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                      onBlur={() => setTouched(t => ({ ...t, email: true }))}
                      placeholder="jane@example.com"
                    />
                    {emailError && <p className="mt-1 text-xs text-red-500">{emailError}</p>}
                  </div>
                  <div>
                    <label className="text-sm text-stone-600 block mb-1">Phone</label>
                    <input
                      type="tel"
                      className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 transition-colors ${
                        phoneError ? 'border-red-300 focus:ring-red-400' : 'border-stone-200 focus:ring-stone-800'
                      }`}
                      value={form.phone}
                      onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                      onBlur={() => setTouched(t => ({ ...t, phone: true }))}
                      placeholder="+1 (555) 000-0000"
                    />
                    {phoneError && <p className="mt-1 text-xs text-red-500">{phoneError}</p>}
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-sm text-stone-600 block mb-1">Special requests <span className="text-stone-400">(optional)</span></label>
                    <textarea rows={3} className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-stone-800 resize-none"
                      value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                      placeholder="Early check-in, anniversary, accessibility needs..." />
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Payment */}
            {step === 'payment' && clientSecret && (
              <div className="bg-white rounded-2xl border border-stone-100 p-6">
                <h2 className="font-semibold text-stone-800 mb-1">Payment</h2>
                <p className="text-stone-500 text-sm mb-6">
                  Your card will be charged ${quote?.total.toFixed(2)} once you confirm below.
                </p>
                <StripePaymentForm
                  clientSecret={clientSecret}
                  total={quote!.total}
                  arrival={format(range!.from!, 'yyyy-MM-dd')}
                  departure={format(range!.to!, 'yyyy-MM-dd')}
                  guestName={`${form.firstName} ${form.lastName}`}
                />
              </div>
            )}

            {/* Action buttons */}
            {step === 'dates' && (
              <button onClick={() => setStep('details')} disabled={!canContinueFromDates}
                className="w-full bg-stone-800 text-white font-semibold py-4 rounded-xl hover:bg-stone-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                {!range?.from ? 'Select check-in date' :
                 !range?.to   ? 'Select check-out date' :
                 loadingQuote  ? 'Calculating price...' :
                 quoteError    ? 'Select different dates' :
                                 'Continue to your details →'}
              </button>
            )}

            {step === 'details' && (
              <div className="space-y-3">
                {paymentError && (
                  <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
                    {paymentError}
                  </div>
                )}
                <button onClick={handleContinueToPayment} disabled={!canContinueFromDetails || creatingPayment}
                  className="w-full bg-stone-800 text-white font-semibold py-4 rounded-xl hover:bg-stone-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                  {creatingPayment ? (
                    <>
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                      </svg>
                      Setting up payment...
                    </>
                  ) : 'Continue to payment →'}
                </button>
              </div>
            )}
          </div>

          {/* Price summary sidebar */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-2xl border border-stone-100 p-6 sticky top-6">
              <h3 className="font-semibold text-stone-800 mb-4">Price summary</h3>
              {!range?.from && <p className="text-stone-400 text-sm">Select dates to see pricing</p>}
              {range?.from && loadingQuote && <p className="text-stone-400 text-sm animate-pulse">Calculating...</p>}
              {quoteError && <p className="text-red-500 text-sm">{quoteError}</p>}
              {quote && !loadingQuote && (() => {
                const cleaningFee = quote.fees?.find(f =>
                  f.name?.toLowerCase().includes('clean')
                )?.amount ?? 0
                const bakedRate = quote.base_rent + cleaningFee
                const otherFees = quote.fees?.filter(f =>
                  !f.name?.toLowerCase().includes('clean')
                ) ?? []
                const perNight = (bakedRate / quote.nights).toFixed(2)
                return (
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-stone-600">${perNight} × {quote.nights} night{quote.nights !== 1 ? 's' : ''}</span>
                      <span className="font-medium">${bakedRate?.toFixed(2)}</span>
                    </div>
                    {otherFees.map((f, i) => (
                      <div key={i} className="flex justify-between">
                        <span className="text-stone-600">{f.name}</span>
                        <span className={`font-medium ${f.amount < 0 ? 'text-green-600' : ''}`}>
                          {f.amount < 0 ? '-' : ''}${Math.abs(f.amount)?.toFixed(2)}
                        </span>
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
                )
              })()}
              {step !== 'dates' && range?.from && range?.to && (
                <div className="mt-6 pt-6 border-t border-stone-100">
                  <p className="text-xs text-stone-400 uppercase tracking-wide mb-3">Your stay</p>
                  <p className="text-sm font-medium text-stone-800">Bluff Haven Retreat</p>
                  <p className="text-xs text-stone-500 mt-1">{format(range.from, 'MMM d')} – {format(range.to, 'MMM d, yyyy')}</p>
                  <p className="text-xs text-stone-500">{nights} night{nights !== 1 ? 's' : ''} · {form.adults + form.children} guest{form.adults + form.children !== 1 ? 's' : ''}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}