'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'

interface Photo {
  id: number
  url: string
  caption?: string
}

export default function GalleryPage() {
  const [photos, setPhotos]     = useState<Photo[]>([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState<string | null>(null)
  const [lightbox, setLightbox] = useState<number | null>(null)

  useEffect(() => {
    fetch('/api/photos')
      .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json() })
      .then((data: Photo[]) => { setPhotos(data); setLoading(false) })
      .catch(() => { setError('Could not load photos. Please try again.'); setLoading(false) })
  }, [])

  const closeLightbox = () => setLightbox(null)
  const prev = useCallback(() => setLightbox(i => i !== null ? (i - 1 + photos.length) % photos.length : null), [photos.length])
  const next = useCallback(() => setLightbox(i => i !== null ? (i + 1) % photos.length : null), [photos.length])

  useEffect(() => {
    if (lightbox === null) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape')     closeLightbox()
      if (e.key === 'ArrowLeft')  prev()
      if (e.key === 'ArrowRight') next()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [lightbox, prev, next])

  useEffect(() => {
    document.body.style.overflow = lightbox !== null ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [lightbox])

  return (
    <div style={{ background: '#faf7f2', minHeight: '100vh' }}>

      {/* ── PAGE HEADER ─────────────────────────────────────────── */}
      <div style={{ background: '#1a2e1a' }} className="px-6 py-16">
        <div className="max-w-6xl mx-auto">
          <Link href="/"
            className="inline-flex items-center gap-2 text-sm font-light mb-8 transition-colors"
            style={{ color: 'rgba(201,168,76,0.7)' }}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/>
            </svg>
            Back to Bluff Haven
          </Link>
          <div className="flex items-end justify-between gap-4 flex-wrap">
            <div>
              <div className="h-px w-12 mb-6" style={{ background: '#c9a84c' }} />
              <h1 className="font-display text-4xl font-semibold text-white mb-2">
                Photo Gallery
              </h1>
              <p className="font-light" style={{ color: 'rgba(255,255,255,0.5)' }}>
                Every corner of Bluff Haven Retreat
              </p>
            </div>
            {photos.length > 0 && (
              <span className="text-sm font-light pb-1" style={{ color: 'rgba(201,168,76,0.6)' }}>
                {photos.length} photos
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ── GALLERY GRID ────────────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">

        {/* Skeleton loader */}
        {loading && (
          <div className="columns-2 sm:columns-3 lg:columns-4 gap-3 space-y-3">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="break-inside-avoid rounded-sm animate-pulse mb-3"
                style={{ aspectRatio: i % 3 === 0 ? '4/3' : i % 3 === 1 ? '3/4' : '1/1', background: '#e8e0d8' }} />
            ))}
          </div>
        )}

        {error && (
          <div className="text-center py-20">
            <p className="text-sm font-light mb-4" style={{ color: '#6b5a3e' }}>{error}</p>
            <button onClick={() => window.location.reload()}
              className="text-sm underline underline-offset-2 font-light" style={{ color: '#4a6741' }}>
              Retry
            </button>
          </div>
        )}

        {!loading && !error && photos.length === 0 && (
          <div className="text-center py-20">
            <p className="text-sm font-light" style={{ color: '#6b5a3e' }}>No photos found in /public/photos/</p>
          </div>
        )}

        {/* Masonry grid */}
        {!loading && photos.length > 0 && (
          <div className="columns-2 sm:columns-3 lg:columns-4 gap-3">
            {photos.map((photo, i) => (
              <div
                key={photo.id}
                onClick={() => setLightbox(i)}
                className="break-inside-avoid mb-3 rounded-sm overflow-hidden cursor-zoom-in relative group"
                style={{ background: '#e8e0d8' }}
              >
                <img
                  src={photo.url}
                  alt={`Bluff Haven photo ${i + 1}`}
                  className="w-full h-auto block transition-transform duration-500 group-hover:scale-[1.03]"
                  loading={i < 8 ? 'eager' : 'lazy'}
                />
                {/* Hover overlay */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center"
                  style={{ background: 'rgba(26,46,26,0.35)' }}>
                  <svg className="w-8 h-8 drop-shadow-lg" style={{ color: 'rgba(201,168,76,0.95)' }}
                    fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607zM10.5 7.5v6m3-3h-6"/>
                  </svg>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* CTA */}
        {!loading && photos.length > 0 && (
          <div className="text-center mt-16 pt-12 border-t" style={{ borderColor: 'rgba(139,111,71,0.15)' }}>
            <p className="font-light mb-6" style={{ color: '#6b5a3e' }}>Like what you see?</p>
            <Link href="/book"
              className="inline-flex items-center gap-2 font-medium px-8 py-4 rounded-sm text-sm uppercase tracking-widest transition-all duration-300"
              style={{ background: '#1a2e1a', color: '#c9a84c' }}>
              Book Your Stay
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3"/>
              </svg>
            </Link>
          </div>
        )}
      </div>

      {/* ── LIGHTBOX ────────────────────────────────────────────── */}
      {lightbox !== null && photos[lightbox] && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center"
          style={{ background: 'rgba(8,14,8,0.97)' }}
          onClick={closeLightbox}>

          {/* Close */}
          <button onClick={closeLightbox} aria-label="Close"
            className="absolute top-4 right-4 z-10 p-2 rounded-full transition-colors hover:bg-white/10"
            style={{ color: 'rgba(255,255,255,0.6)' }}>
            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>

          {/* Counter */}
          <div className="absolute top-5 left-1/2 -translate-x-1/2 text-xs font-light tracking-widest"
            style={{ color: 'rgba(201,168,76,0.6)' }}>
            {lightbox + 1} / {photos.length}
          </div>

          {/* Prev */}
          <button onClick={e => { e.stopPropagation(); prev() }} aria-label="Previous"
            className="absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full transition-all hover:bg-white/10"
            style={{ color: 'rgba(255,255,255,0.7)' }}>
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/>
            </svg>
          </button>

          {/* Image */}
          <div className="relative max-w-5xl max-h-[90vh] w-full mx-16 sm:mx-20 flex items-center justify-center"
            onClick={e => e.stopPropagation()}>
            <img
              src={photos[lightbox].url}
              alt={`Bluff Haven photo ${lightbox + 1}`}
              className="max-w-full max-h-[90vh] object-contain rounded-sm shadow-2xl"
            />
          </div>

          {/* Next */}
          <button onClick={e => { e.stopPropagation(); next() }} aria-label="Next"
            className="absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full transition-all hover:bg-white/10"
            style={{ color: 'rgba(255,255,255,0.7)' }}>
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/>
            </svg>
          </button>
        </div>
      )}
    </div>
  )
}
