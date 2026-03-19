'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { DayPicker, DateRange } from 'react-day-picker'
import 'react-day-picker/dist/style.css'
import { format, startOfDay } from 'date-fns'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

interface AvailabilityData {
  blockedDates: Set<string>
  checkoutOnlyDates: Set<string>
  minNightsMap: Map<string, number>
  rateMap: Map<string, number>
}

function toDateStr(d: Date): string {
  return d.getFullYear() + '-' +
    String(d.getMonth() + 1).padStart(2, '0') + '-' +
    String(d.getDate()).padStart(2, '0')
}

const OR_PROPERTY_ID  = '8dff8078067343349a22031a4afc719e'
const OR_WIDGET_ID    = '6aafaaafd1c941dbacf4b9990f9681ef'

function BookPageInner() {
  const searchParams = useSearchParams()
  const orArrival    = searchParams.get('or_arrival')   ?? ''
  const orDeparture  = searchParams.get('or_departure') ?? ''

  // If URL has or_arrival/or_departure, we're in widget mode
  const hasOrParams  = !!(orArrival && orDeparture)

  const [range, setRange]               = useState<DateRange | undefined>()
  const [availability, setAvailability] = useState<AvailabilityData>({
    blockedDates: new Set(), checkoutOnlyDates: new Set(), minNightsMap: new Map(), rateMap: new Map(),
  })
  const [availabilityLoaded, setAvailabilityLoaded] = useState(false)
  const [availabilityError, setAvailabilityError]   = useState<string | null>(null)
  const [isMobile, setIsMobile] = useState(false)
  const widgetContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  // Load availability
  useEffect(() => {
    fetch('/api/availability')
      .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json() })
      .then((days: { date: string; available: boolean; minNights?: number; rate?: number }[]) => {
        const blockedSet   = new Set(days.filter(d => !d.available).map(d => d.date))
        const checkoutOnly = new Set<string>()
        const minNightsMap = new Map<string, number>()
        const rateMap = new Map<string, number>()
        for (const d of days) {
          if (d.minNights && d.minNights > 1) minNightsMap.set(d.date, d.minNights)
          if (d.rate && d.rate > 0) rateMap.set(d.date, d.rate)
          if (!d.available) {
            const [y, m, day] = d.date.split('-').map(Number)
            const prev = new Date(y, m - 1, day - 1)
            if (!blockedSet.has(toDateStr(prev))) checkoutOnly.add(d.date)
          }
        }
        checkoutOnly.forEach(d => blockedSet.delete(d))
        setAvailability({ blockedDates: blockedSet, checkoutOnlyDates: checkoutOnly, minNightsMap, rateMap })
        setAvailabilityLoaded(true)
      })
      .catch(() => {
        setAvailabilityError('Could not load availability. Please refresh.')
        setAvailabilityLoaded(true)
      })
  }, [])

  // Inject widget.js when OR params are present — script reads or_arrival/or_departure from URL
  useEffect(() => {
    if (!hasOrParams || !widgetContainerRef.current) return

    const container = widgetContainerRef.current
    container.innerHTML = ''

    // Create widget div
    const widgetDiv = document.createElement('div')
    widgetDiv.className = 'ownerrez-widget'
    widgetDiv.setAttribute('data-propertyid', OR_PROPERTY_ID)
    widgetDiv.setAttribute('data-widget-type', 'Booking/Inquiry')
    widgetDiv.setAttribute('data-widgetid', OR_WIDGET_ID)
    container.appendChild(widgetDiv)

    // Remove old script + globals
    document.getElementById('or-widget-script')?.remove()
    try { delete (window as any).OwnerRezWidgets } catch {}
    try { delete (window as any).OwnerRez } catch {}

    // Inject fresh script — it reads or_arrival/or_departure from window.location
    const script = document.createElement('script')
    script.id    = 'or-widget-script'
    script.src   = 'https://app.ownerrez.com/widget.js'
    script.async = true
    script.onload = () => {
      let tries = 0
      const poll = setInterval(() => {
        tries++
        if ((window as any).OwnerRezWidgets) {
          clearInterval(poll)
          ;(window as any).OwnerRezWidgets.initialize()
        }
        if (tries > 40) clearInterval(poll)
      }, 100)
    }
    document.body.appendChild(script)

    // Scroll to widget
    setTimeout(() => container.scrollIntoView({ behavior: 'smooth', block: 'start' }), 300)

    return () => { document.getElementById('or-widget-script')?.remove() }
  }, [hasOrParams, orArrival, orDeparture])


  // Inject nightly rate labels into calendar day buttons after render
  useEffect(() => {
    if (availability.rateMap.size === 0) return
    const timer = setTimeout(() => {
      // react-day-picker renders buttons with aria-label like "April 20, 2026"
      document.querySelectorAll('.rdp-button[name]').forEach((btn: any) => {
        const name = btn.getAttribute('name') // format: "2026-04-20"
        if (!name) return
        const rate = availability.rateMap.get(name)
        // Remove old label
        btn.querySelector('.or-rate-label')?.remove()
        if (rate && rate > 0) {
          const span = document.createElement('span')
          span.className = 'or-rate-label'
          span.textContent = '$' + Math.round(rate)
          btn.appendChild(span)
        }
      })
    }, 50)
    return () => clearTimeout(timer)
  }, [availability.rateMap, range])

  const isDateDisabled = useCallback((date: Date): boolean => {
    const today = startOfDay(new Date())
    if (date <= today) return true
    const dateStr = toDateStr(date)
    if (!range?.from || range.to) {
      return availability.blockedDates.has(dateStr) || availability.checkoutOnlyDates.has(dateStr)
    }
    if (date <= range.from) return true
    const nightsFromFrom = Math.round((date.getTime() - range.from.getTime()) / (1000 * 60 * 60 * 24))
    const minN = availability.minNightsMap.get(toDateStr(range.from)) ?? 1
    if (nightsFromFrom < minN) return true
    const cursor = new Date(range.from)
    cursor.setDate(cursor.getDate() + 1)
    while (cursor <= date) {
      const curStr = toDateStr(cursor)
      if (availability.checkoutOnlyDates.has(curStr)) return cursor.getTime() !== date.getTime()
      if (availability.blockedDates.has(curStr)) return true
      cursor.setDate(cursor.getDate() + 1)
    }
    return false
  }, [range, availability])

  const isCheckoutOnly = useCallback((date: Date): boolean => {
    if (range?.from && !range.to) return false
    return availability.checkoutOnlyDates.has(toDateStr(date))
  }, [range, availability])

  const isTooFewNights = useCallback((date: Date): boolean => {
    if (!range?.from || range.to) return false
    const nights = Math.round((date.getTime() - range.from.getTime()) / (1000 * 60 * 60 * 24))
    return nights > 0 && nights < (availability.minNightsMap.get(toDateStr(range.from)) ?? 1)
  }, [range, availability])

  const fromMinNights = range?.from
    ? (availability.minNightsMap.get(toDateStr(range.from)) ?? 1) : 1

  const handleRangeSelect = useCallback((newRange: DateRange | undefined) => {
    if (!newRange?.from || !newRange?.to) { setRange(newRange); return }
    const cursor = new Date(newRange.from)
    cursor.setDate(cursor.getDate() + 1)
    let maxTo = newRange.to
    while (cursor <= newRange.to) {
      const curStr = toDateStr(cursor)
      if (availability.checkoutOnlyDates.has(curStr)) { maxTo = new Date(cursor); break }
      if (availability.blockedDates.has(curStr)) { cursor.setDate(cursor.getDate() - 1); maxTo = new Date(cursor); break }
      cursor.setDate(cursor.getDate() + 1)
    }
    setRange({ from: newRange.from, to: maxTo })
  }, [availability])

  // When guest clicks Book — navigate to same page with OR params in URL
  const handleBook = useCallback(() => {
    if (!range?.from || !range?.to) return
    const arrival   = format(range.from, 'yyyy-MM-dd')
    const departure = format(range.to,   'yyyy-MM-dd')
    window.location.href = `/book?or_arrival=${arrival}&or_departure=${departure}`
  }, [range])

  const nights  = range?.from && range?.to
    ? Math.round((range.to.getTime() - range.from.getTime()) / (1000 * 60 * 60 * 24)) : 0
  const canBook = !!(range?.from && range?.to && nights > 0)

  // Parse OR params back into display dates
  const displayArrival   = orArrival   ? new Date(orArrival   + 'T00:00:00') : null
  const displayDeparture = orDeparture ? new Date(orDeparture + 'T00:00:00') : null
  const displayNights    = displayArrival && displayDeparture
    ? Math.round((displayDeparture.getTime() - displayArrival.getTime()) / (1000 * 60 * 60 * 24)) : 0

  return (
    <div className="min-h-screen bg-stone-50">
      <style>{`
        .rdp-day_checkoutOnly { position: relative; }
        .rdp-day_checkoutOnly button, .rdp-day_checkoutOnly .rdp-day_button {
          position: relative !important; cursor: not-allowed !important;
          overflow: hidden !important; border-radius: 50% !important;
          color: #374151 !important; background: transparent !important;
        }
        .rdp-day_checkoutOnly button::before, .rdp-day_checkoutOnly .rdp-day_button::before {
          content: '' !important; position: absolute !important; inset: 0 !important;
          background: linear-gradient(to bottom right, #d1d5db 50%, transparent 50%) !important;
          border-radius: 50% !important; pointer-events: none !important; z-index: 0 !important;
        }
        .rdp-day_checkoutOnly button > *, .rdp-day_checkoutOnly .rdp-day_button > * {
          position: relative !important; z-index: 1 !important;
        }
        .rdp-day_checkoutOnly:hover::after {
          content: 'Checkout only'; position: absolute; bottom: 110%; left: 50%;
          transform: translateX(-50%); background: #1c1917; color: white;
          font-size: 11px; white-space: nowrap; padding: 4px 8px; border-radius: 6px;
          z-index: 30; pointer-events: none;
        }
        .rdp-day_tooFewNights { position: relative; }
        /* Nightly rate label below date number */
        .or-rate-label {
          display: block;
          font-size: 8px;
          font-weight: 600;
          color: #4a6741;
          text-align: center;
          line-height: 1;
          margin-top: 1px;
          pointer-events: none;
        }
        .rdp-day_selected .or-rate-label,
        .rdp-day_range_start .or-rate-label,
        .rdp-day_range_end .or-rate-label,
        .rdp-day_range_middle .or-rate-label {
          color: rgba(255,255,255,0.75);
        }
        .rdp-day_disabled .or-rate-label {
          display: none;
        }
        .rdp-button { height: auto !important; min-height: 40px; padding: 4px 0 !important; }
        .rdp-day { height: auto !important; }
        .rdp-cell { height: auto !important; }
        .rdp-day_tooFewNights:hover::after {
          content: 'Min stay not met'; position: absolute; bottom: 110%; left: 50%;
          transform: translateX(-50%); background: #1c1917; color: white;
          font-size: 11px; white-space: nowrap; padding: 4px 8px; border-radius: 6px;
          z-index: 30; pointer-events: none;
        }
      `}</style>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12">

        {/* Header */}
        <div className="mb-8">
          <a href="/" className="text-stone-500 text-sm hover:text-stone-700 transition-colors">
            &larr; Bluff Haven Retreat
          </a>
          <h1 className="text-2xl sm:text-3xl font-bold text-stone-800 mt-3">Book your stay</h1>
          <p className="text-stone-500 mt-1">Best rate guaranteed &mdash; no service fees</p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-8">
          <div className="flex items-center gap-1.5 text-sm font-medium text-stone-500">
            <span className="w-5 h-5 rounded-full bg-stone-800 text-white flex items-center justify-center text-xs">
              {hasOrParams ? '✓' : '1'}
            </span>
            Dates
          </div>
          <div className={`w-8 h-px ${hasOrParams ? 'bg-stone-400' : 'bg-stone-200'}`} />
          <div className={`flex items-center gap-1.5 text-sm font-medium ${hasOrParams ? 'text-stone-800' : 'text-stone-300'}`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${hasOrParams ? 'bg-stone-800 text-white' : 'bg-stone-200 text-stone-400'}`}>
              2
            </span>
            Details &amp; Payment
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-5">

            {/* Step 1: Calendar — hidden once dates are confirmed */}
            {!hasOrParams && (
              <>
                <div className="bg-white rounded-2xl border border-stone-100 p-5 sm:p-6">
                  <h2 className="font-semibold text-stone-800 mb-4">Select dates</h2>
                  {!availabilityLoaded && <p className="text-stone-400 text-sm mb-4 animate-pulse">Loading availability...</p>}
                  {availabilityError  && <p className="text-red-500 text-sm mb-4">{availabilityError}</p>}
                  <DayPicker
                    mode="range"
                    selected={range}
                    onSelect={handleRangeSelect}
                    disabled={isDateDisabled}
                    modifiers={{ checkoutOnly: isCheckoutOnly, tooFewNights: isTooFewNights }}
                    modifiersClassNames={{ checkoutOnly: 'rdp-day_checkoutOnly', tooFewNights: 'rdp-day_tooFewNights' }}
                    numberOfMonths={isMobile ? 1 : 2}
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
                    components={{
                      DayContent: ({ date, activeModifiers }: any) => {
                        const dateStr = toDateStr(date)
                        const rate    = availability.rateMap.get(dateStr)
                        const isDisabled = activeModifiers.disabled || activeModifiers.outside
                        const isSelected = activeModifiers.selected || activeModifiers.range_start || activeModifiers.range_end || activeModifiers.range_middle
                        return (
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1px', padding: '1px 0', lineHeight: 1 }}>
                            <span style={{ fontSize: '13px' }}>{date.getDate()}</span>
                            {rate && rate > 0 && !isDisabled && (
                              <span style={{
                                fontSize: '8px',
                                fontWeight: 600,
                                color: isSelected ? 'rgba(255,255,255,0.75)' : '#4a6741',
                              }}>
                                ${Math.round(rate)}
                              </span>
                            )}
                          </div>
                        )
                      }
                    }}
                  />
                  {range?.from && (
                    <div className="mt-3 flex items-center justify-between p-3 bg-stone-50 rounded-lg text-sm text-stone-600">
                      <span>
                        <span className="font-medium">{format(range.from, 'MMM d')}</span>
                        {range.to ? (
                          <>
                            {' \u2192 '}
                            <span className="font-medium">{format(range.to, 'MMM d, yyyy')}</span>
                            {' \u00B7 '}
                            <span>{nights} night{nights !== 1 ? 's' : ''}</span>
                          </>
                        ) : (
                          <span className="text-stone-400 ml-1">
                            &mdash; select checkout
                            {fromMinNights > 1 && <span className="ml-1 text-amber-600 font-medium">&middot; {fromMinNights}-night min</span>}
                          </span>
                        )}
                      </span>
                      <button onClick={() => setRange(undefined)} className="text-stone-400 hover:text-stone-700 text-xs underline underline-offset-2 ml-4 flex-shrink-0">
                        Clear
                      </button>
                    </div>
                  )}
                </div>

                <button
                  onClick={handleBook}
                  disabled={!canBook}
                  className="w-full bg-stone-800 text-white font-semibold py-4 rounded-xl hover:bg-stone-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed text-base"
                >
                  {!range?.from ? 'Select check-in date' :
                   !range?.to   ? 'Select check-out date' :
                                  `Book ${nights} night${nights !== 1 ? 's' : ''} \u2192`}
                </button>
              </>
            )}

            {/* Step 2: OwnerRez widget — shown after redirect with OR params */}
            {hasOrParams && (
              <>
                {/* Confirmed dates summary */}
                <div className="bg-white rounded-2xl border border-stone-100 p-5 sm:p-6">
                  <div className="flex items-center justify-between">
                    <h2 className="font-semibold text-stone-800">Your dates</h2>
                    <a href="/book" className="text-xs text-stone-500 hover:text-stone-800 underline underline-offset-2 transition-colors">
                      Change dates
                    </a>
                  </div>
                  {displayArrival && displayDeparture && (
                    <div className="mt-3 p-3 bg-stone-50 rounded-lg text-sm text-stone-600">
                      <span className="font-medium">{format(displayArrival, 'MMM d')}</span>
                      {' \u2192 '}
                      <span className="font-medium">{format(displayDeparture, 'MMM d, yyyy')}</span>
                      {' \u00B7 '}
                      <span>{displayNights} night{displayNights !== 1 ? 's' : ''}</span>
                    </div>
                  )}
                </div>

                {/* OwnerRez widget — widget.js reads or_arrival/or_departure from page URL */}
                <div className="bg-white rounded-2xl border border-stone-100 p-5 sm:p-6">
                  <h2 className="font-semibold text-stone-800 mb-1">Guest details &amp; payment</h2>
                  <p className="text-stone-500 text-sm mb-5">Secure checkout &middot; Powered by Stripe</p>
                  <div ref={widgetContainerRef} />
                </div>
              </>
            )}
          </div>

          {/* Sidebar */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-2xl border border-stone-100 p-6 sticky top-6 space-y-5">
              <div>
                <h3 className="font-semibold text-stone-800 mb-1">Bluff Haven Retreat</h3>
                <p className="text-xs text-stone-500">Sevierville, TN &middot; 2 bed &middot; 1.5 bath &middot; 6 guests max</p>
              </div>

              {/* Show selected dates in sidebar */}
              {(canBook || hasOrParams) && (
                <div className="pt-4 border-t border-stone-100">
                  <p className="text-xs text-stone-400 uppercase tracking-wide mb-2">Your stay</p>
                  <div className="space-y-1.5 text-sm">
                    <div className="flex justify-between">
                      <span className="text-stone-500">Check-in</span>
                      <span className="font-medium text-stone-800">
                        {hasOrParams && displayArrival   ? format(displayArrival,   'MMM d, yyyy')
                         : range?.from                   ? format(range.from,        'MMM d, yyyy') : '—'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-500">Check-out</span>
                      <span className="font-medium text-stone-800">
                        {hasOrParams && displayDeparture ? format(displayDeparture, 'MMM d, yyyy')
                         : range?.to                     ? format(range.to,          'MMM d, yyyy') : '—'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-500">Nights</span>
                      <span className="font-medium text-stone-800">{hasOrParams ? displayNights : nights}</span>
                    </div>
                  </div>

                  {/* Rate + cleaning fee estimate */}
                  {!hasOrParams && range?.from && range?.to && nights > 0 && (() => {
                    const arrStr = format(range.from, 'yyyy-MM-dd')
                    const nightly = availability.rateMap.get(arrStr) ?? 0
                    const cleaningFee = 175
                    const rentTotal = nightly * nights
                    return nightly > 0 ? (
                      <div className="mt-3 pt-3 border-t border-stone-100 space-y-1.5 text-sm">
                        <div className="flex justify-between">
                          <span className="text-stone-500">${Math.round(nightly)} &times; {nights} night{nights !== 1 ? 's' : ''}</span>
                          <span className="font-medium text-stone-800">${rentTotal.toFixed(0)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-stone-500">Cleaning fee</span>
                          <span className="font-medium text-stone-800">${cleaningFee}</span>
                        </div>
                        <div className="flex justify-between pt-1.5 border-t border-stone-100">
                          <span className="text-stone-500 font-medium">Subtotal</span>
                          <span className="font-semibold text-stone-800">${(rentTotal + cleaningFee).toFixed(0)}</span>
                        </div>
                        <p className="text-[10px] text-stone-400">+ taxes · exact total shown at checkout</p>
                      </div>
                    ) : null
                  })()}
                </div>
              )}

              <div className="pt-4 border-t border-stone-100 space-y-2.5">
                {[
                  'No Airbnb or VRBO service fees',
                  'Secure payment via Stripe',
                  'Instant booking confirmation',
                  'Direct host communication',
                ].map(text => (
                  <div key={text} className="flex items-start gap-2 text-sm text-stone-600">
                    <span className="text-green-600 font-bold flex-shrink-0">&#10003;</span>
                    <span>{text}</span>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-stone-100 text-sm text-stone-600 space-y-1">
                <div className="flex justify-between">
                  <span className="text-stone-500">Check-in</span>
                  <span className="font-medium">After 4:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Check-out</span>
                  <span className="font-medium">Before 10:00 AM</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function BookPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-stone-300 border-t-stone-800 rounded-full animate-spin" />
      </div>
    }>
      <BookPageInner />
    </Suspense>
  )
}
