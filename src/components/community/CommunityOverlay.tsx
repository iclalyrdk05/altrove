import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { X, Plus, Flag, Heart, ImagePlus, Mic, Square } from 'lucide-react'
import { useUIStore } from '@/stores/uiStore'
import { useLocationStore } from '@/stores/locationStore'
import { useCommunityStore, isMomentActive } from '@/stores/communityStore'
import { useAudioStore } from '@/stores/audioStore'
import { useFriendsStore } from '@/stores/friendsStore'
import { Scrim } from '@/components/shared/GlassPanel'
import { Avatar } from '@/components/shared/Avatar'
import { relativeTimeFrom } from '@/utils/units'
import { clsx } from '@/utils/clsx'

export function CommunityOverlay() {
  const open = useUIStore((s) => s.communityOverlayOpen)
  const setOpen = useUIStore((s) => s.setCommunityOverlayOpen)
  const neighborhood = useLocationStore((s) => s.current)
  const allMoments = useCommunityStore((s) => s.moments)
  const friends = useFriendsStore((s) => s.friends)
  const friendIds = useMemo(() => new Set(friends.map((f) => f.id)), [friends])
  const momentsHere = useMemo(
    () => allMoments.filter((m) => m.neighborhoodId === neighborhood.id && isMomentActive(m)),
    [allMoments, neighborhood.id],
  )
  const [audience, setAudience] = useState<'everyone' | 'friends'>('everyone')
  const moments = useMemo(
    () => (audience === 'friends' ? momentsHere.filter((m) => m.authorId && friendIds.has(m.authorId)) : momentsHere),
    [momentsHere, audience, friendIds],
  )
  const addMoment = useCommunityStore((s) => s.addMoment)
  const markSeen = useCommunityStore((s) => s.markSeen)
  const [composing, setComposing] = useState(false)
  const [saved, setSaved] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (open) markSeen(neighborhood.id)
  }, [open, neighborhood.id, markSeen])

  // Ducks Local Radio / Street / Weather sounds while a Moment's own voice
  // clip is playing, so it doesn't get drowned out — tracked by id (not just
  // a boolean) since more than one clip could be mid-playback at once.
  const duckingAudioIdsRef = useRef<Set<string>>(new Set())
  function handleAudioPlay(id: string) {
    if (duckingAudioIdsRef.current.has(id)) return
    duckingAudioIdsRef.current.add(id)
    useAudioStore.getState().requestDuck()
  }
  function handleAudioStop(id: string) {
    if (!duckingAudioIdsRef.current.has(id)) return
    duckingAudioIdsRef.current.delete(id)
    useAudioStore.getState().releaseDuck()
  }
  // Closing the sheet (or the whole overlay) while a clip is still playing
  // doesn't reliably fire the <audio>'s own pause event, so release
  // anything left over whenever `open` changes or this unmounts.
  useEffect(() => {
    return () => {
      duckingAudioIdsRef.current.forEach(() => useAudioStore.getState().releaseDuck())
      duckingAudioIdsRef.current.clear()
    }
  }, [open])

  function toggleSave(id: string) {
    setSaved((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <Scrim onClick={() => setOpen(false)} />
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
            className="glass-surface fixed left-1/2 top-1/2 z-40 flex h-[680px] w-[92%] max-w-[560px] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-[28px] shadow-[0_30px_90px_rgba(0,0,0,0.5)]"
          >
            <div className="flex items-center justify-between border-b border-white/10 p-4">
              <div>
                <p className="text-[15px] font-semibold text-white">Moments</p>
                <p className="text-[12px] text-white/45">{neighborhood.name}, {neighborhood.city}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setComposing(true)}
                  className="flex items-center gap-1.5 rounded-full bg-linen px-3 py-1.5 text-[12px] font-semibold text-wine hover:bg-white"
                  style={{ color: '#6c1c37' }}
                >
                  <Plus size={14} />
                  Share a Moment
                </button>
                <button onClick={() => setOpen(false)} className="text-white/40 hover:text-white">
                  <X size={18} />
                </button>
              </div>
            </div>

            <div className="flex gap-1 px-4 pt-3">
              {(
                [
                  { id: 'everyone', label: 'Everyone Around' },
                  { id: 'friends', label: 'Just Friends' },
                ] as const
              ).map((t) => (
                <button
                  key={t.id}
                  onClick={() => setAudience(t.id)}
                  className={clsx(
                    'rounded-full px-3 py-1 text-[11.5px] font-medium transition-colors',
                    audience === t.id ? 'bg-white/18 text-white' : 'text-white/45 hover:text-white/70',
                  )}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {moments.length === 0 && (
                <p className="py-10 text-center text-[13px] text-white/40">
                  {audience === 'friends'
                    ? "None of your friends have posted from here yet."
                    : 'No recent moments shared from here yet.'}
                </p>
              )}
              <div className="space-y-3">
                {moments.map((m) => (
                  <div key={m.id} className="rounded-2xl bg-white/5 p-3.5">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2.5">
                        <Avatar seed={m.authorId ?? m.id} emoji={m.authorAvatar} size={36} />
                        <div>
                          <p className="text-[13px] font-medium text-white">{m.authorName}</p>
                          <p className="text-[11px] text-white/40">{relativeTimeFrom(m.createdAt)}</p>
                        </div>
                      </div>
                      {m.tag && (
                        <span className="rounded-full bg-white/8 px-2 py-0.5 text-[10px] text-white/50">{m.tag}</span>
                      )}
                    </div>
                    <p className="mt-2.5 text-[13.5px] leading-snug text-white/80">{m.note}</p>
                    {m.imageUrl && (
                      <img src={m.imageUrl} alt="" className="mt-2.5 max-h-[200px] w-full rounded-xl object-cover" />
                    )}
                    {m.audioUrl && (
                      <audio
                        controls
                        src={m.audioUrl}
                        className="mt-2.5 h-8 w-full"
                        onPlay={() => handleAudioPlay(m.id)}
                        onPause={() => handleAudioStop(m.id)}
                        onEnded={() => handleAudioStop(m.id)}
                      />
                    )}
                    {m.isDemo && (
                      <p className="mt-1.5 text-[10px] text-white/30">Sample content for this demonstration · not a live post</p>
                    )}
                    <div className="mt-2.5 flex items-center gap-3">
                      <button
                        onClick={() => toggleSave(m.id)}
                        className={clsx(
                          'flex items-center gap-1 text-[11px] transition-colors',
                          saved.has(m.id) ? 'text-rose' : 'text-white/40 hover:text-white/70',
                        )}
                      >
                        <Heart size={13} fill={saved.has(m.id) ? 'currentColor' : 'none'} />
                        {saved.has(m.id) ? 'Saved' : 'Save'}
                      </button>
                      <button className="flex items-center gap-1 text-[11px] text-white/40 hover:text-white/70">
                        <Flag size={12} />
                        Report
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {composing && (
            <ComposeSheet
              neighborhoodName={neighborhood.name}
              onClose={() => setComposing(false)}
              onPublish={(note, visibility, imageUrl, audioUrl) => {
                addMoment({
                  neighborhoodId: neighborhood.id,
                  authorName: 'You',
                  authorAvatar: '🧭',
                  note,
                  imageUrl,
                  audioUrl,
                  visibility,
                })
                setComposing(false)
              }}
            />
          )}
        </>
      )}
    </AnimatePresence>
  )
}

function ComposeSheet({
  neighborhoodName,
  onClose,
  onPublish,
}: {
  neighborhoodName: string
  onClose: () => void
  onPublish: (note: string, visibility: 'public' | 'friends', imageUrl?: string, audioUrl?: string) => void
}) {
  const [note, setNote] = useState('')
  const [visibility, setVisibility] = useState<'public' | 'friends'>('public')
  const [step, setStep] = useState<'write' | 'preview'>('write')
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)
  const audioInputRef = useRef<HTMLInputElement>(null)

  function pickImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) setImageUrl(URL.createObjectURL(file))
    e.target.value = ''
  }

  function pickAudio(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) setAudioUrl(URL.createObjectURL(file))
    e.target.value = ''
  }

  // Ducks ambient sound while previewing the picked clip, same as a
  // published Moment's audio — released on unmount too, in case the sheet
  // is closed mid-playback (closing doesn't reliably fire the audio element's own pause event).
  const previewDuckingRef = useRef(false)
  function handlePreviewPlay() {
    if (previewDuckingRef.current) return
    previewDuckingRef.current = true
    useAudioStore.getState().requestDuck()
  }
  function handlePreviewStop() {
    if (!previewDuckingRef.current) return
    previewDuckingRef.current = false
    useAudioStore.getState().releaseDuck()
  }
  useEffect(() => {
    return () => {
      if (previewDuckingRef.current) {
        previewDuckingRef.current = false
        useAudioStore.getState().releaseDuck()
      }
    }
  }, [])

  const Preview = (
    <div className="mt-3 rounded-2xl bg-white/5 p-3.5">
      <div className="flex items-center gap-2.5">
        <Avatar seed="you" emoji="🧭" size={36} />
        <div>
          <p className="text-[13px] font-medium text-white">You</p>
          <p className="text-[11px] text-white/40">Just now · {visibility === 'public' ? 'Public' : 'Friends Only'}</p>
        </div>
      </div>
      <p className="mt-2.5 text-[13.5px] leading-snug text-white/80">{note}</p>
      {imageUrl && <img src={imageUrl} alt="" className="mt-2.5 max-h-[160px] w-full rounded-xl object-cover" />}
      {audioUrl && (
        <audio
          controls
          src={audioUrl}
          className="mt-2.5 h-8 w-full"
          onPlay={handlePreviewPlay}
          onPause={handlePreviewStop}
          onEnded={handlePreviewStop}
        />
      )}
    </div>
  )

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="glass-surface fixed left-1/2 top-1/2 z-50 w-[92%] max-w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-[26px] p-5"
    >
      <div className="flex items-center justify-between">
        <p className="text-[14px] font-semibold text-white">Share a Moment</p>
        <button onClick={onClose} className="text-white/40 hover:text-white">
          <X size={16} />
        </button>
      </div>
      <p className="mt-0.5 text-[11.5px] text-white/45">Posting to {neighborhoodName}</p>

      {step === 'write' ? (
        <>
          <textarea
            autoFocus
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="What's the atmosphere like right now? A photo, or a few seconds of audio — a street musician, a passing storm — says it too."
            rows={4}
            maxLength={280}
            className="mt-3 w-full resize-none rounded-2xl bg-white/8 p-3 text-[13.5px] text-white placeholder:text-white/35 focus:outline-none"
          />

          {imageUrl && (
            <div className="relative mt-2">
              <img src={imageUrl} alt="" className="max-h-[140px] w-full rounded-xl object-cover" />
              <button
                onClick={() => setImageUrl(null)}
                className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white/85"
                aria-label="Remove photo"
              >
                <X size={13} />
              </button>
            </div>
          )}
          {audioUrl && (
            <div className="mt-2 flex items-center gap-2 rounded-xl bg-white/8 p-2">
              <audio
                controls
                src={audioUrl}
                className="h-8 flex-1"
                onPlay={handlePreviewPlay}
                onPause={handlePreviewStop}
                onEnded={handlePreviewStop}
              />
              <button
                onClick={() => setAudioUrl(null)}
                className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-black/40 text-white/75"
                aria-label="Remove audio"
              >
                <X size={13} />
              </button>
            </div>
          )}

          <div className="mt-2 flex items-center gap-3">
            <input ref={imageInputRef} type="file" accept="image/*" className="hidden" onChange={pickImage} />
            <input ref={audioInputRef} type="file" accept="audio/*" className="hidden" onChange={pickAudio} />
            <button
              onClick={() => imageInputRef.current?.click()}
              className="flex items-center gap-1.5 text-[11.5px] text-white/40 hover:text-white/65"
            >
              <ImagePlus size={13} />
              {imageUrl ? 'Replace photo' : 'Add a photo'}
            </button>
            <button
              onClick={() => audioInputRef.current?.click()}
              className="flex items-center gap-1.5 text-[11.5px] text-white/40 hover:text-white/65"
            >
              {audioUrl ? <Square size={12} /> : <Mic size={13} />}
              {audioUrl ? 'Replace audio' : 'Add audio'}
            </button>
          </div>

          <div className="mt-3 flex gap-1.5">
            {(['public', 'friends'] as const).map((v) => (
              <button
                key={v}
                onClick={() => setVisibility(v)}
                className={clsx(
                  'rounded-full px-3 py-1.5 text-[11.5px] capitalize transition-colors',
                  visibility === v ? 'bg-white/25 text-white' : 'bg-white/8 text-white/55',
                )}
              >
                {v === 'public' ? 'Public' : 'Friends Only'}
              </button>
            ))}
          </div>

          <button
            disabled={!note.trim()}
            onClick={() => setStep('preview')}
            className="mt-4 w-full rounded-full bg-linen py-2.5 text-[13px] font-semibold text-wine disabled:opacity-30"
            style={{ color: '#6c1c37' }}
          >
            Preview
          </button>
        </>
      ) : (
        <>
          {Preview}
          <div className="mt-4 flex gap-2">
            <button
              onClick={() => setStep('write')}
              className="flex-1 rounded-full bg-white/8 py-2.5 text-[13px] font-medium text-white/70"
            >
              Edit
            </button>
            <button
              onClick={() => onPublish(note, visibility, imageUrl ?? undefined, audioUrl ?? undefined)}
              className="flex-1 rounded-full bg-linen py-2.5 text-[13px] font-semibold text-wine hover:bg-white"
              style={{ color: '#6c1c37' }}
            >
              Publish (Demo)
            </button>
          </div>
          <p className="mt-2 text-center text-[10.5px] text-white/30">
            No backend is connected in this build — this adds to local demo state only.
          </p>
        </>
      )}
    </motion.div>
  )
}
