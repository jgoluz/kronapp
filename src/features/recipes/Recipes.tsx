import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { db, type SavedRecipe } from '../../data/db/database'
import { useBrewStore } from '../../store/brewStore'
import { useSettingsStore } from '../../store/settingsStore'
import { getTranslations } from '../../i18n'
import { METHODS } from '../../data/seed/methods'
import { BREW_PROFILES } from '../../data/seed/profiles'
import { PageHeader } from '../../shared/components/PageHeader'
import { Button } from '../../shared/components/Button'
import { Modal } from '../../shared/components/Modal'

export function Recipes() {
  const navigate = useNavigate()
  const lang = useSettingsStore(s => s.language)
  const t = getTranslations(lang)
  const { setMethod, setProfile, setCustomRatio, setWater } = useBrewStore()

  const [recipes, setRecipes] = useState<SavedRecipe[]>([])
  const [filterMethod, setFilterMethod] = useState<string>('all')
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [expandedId, setExpandedId] = useState<number | null>(null)

  const loadRecipes = async () => {
    const all = await db.recipes.orderBy('created_at').reverse().toArray()
    setRecipes(all)
  }

  useEffect(() => { loadRecipes() }, [])

  const filtered = filterMethod === 'all'
    ? recipes
    : recipes.filter(r => r.method_id === filterMethod)

  const handleBrewAgain = (recipe: SavedRecipe) => {
    const method = METHODS.find(m => m.id === recipe.method_id)
    const profile = BREW_PROFILES.find(p => p.id === recipe.profile_id)
    if (!method || !profile) return
    setMethod(method.id)
    setProfile(profile)
    if (recipe.is_custom_ratio) setCustomRatio(recipe.ratio)
    setWater(recipe.water_ml)
    navigate('/timer')
  }

  const handleDelete = async () => {
    if (deleteId == null) return
    await db.recipes.delete(deleteId)
    setDeleteId(null)
    loadRecipes()
  }

  const usedMethods = [...new Set(recipes.map(r => r.method_id))]

  return (
    <div className="flex flex-col h-full" style={{ background: 'var(--kron-black)' }}>
      <PageHeader
        title={t.recipes.title}
        right={
          <button
            onClick={() => navigate('/recipes/new')}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl active:scale-95 transition-transform"
            style={{ background: 'var(--kron-amber)', border: 'none', cursor: 'pointer' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
              stroke="var(--kron-black)" strokeWidth="2.5" strokeLinecap="round">
              <path d="M12 5v14M5 12h14" />
            </svg>
            <span style={{
              fontFamily: 'var(--font-title)',
              fontSize: 15,
              letterSpacing: '0.05em',
              color: 'var(--kron-black)',
            }}>
              {t.recipes.newRecipe}
            </span>
          </button>
        }
      />

      {/* Method filter */}
      {usedMethods.length > 1 && (
        <div
          className="flex gap-2 px-4 py-3 overflow-x-auto"
          style={{ borderBottom: '1px solid rgba(160,104,64,0.12)', scrollbarWidth: 'none' }}
        >
          <FilterChip
            label={t.recipes.allMethods}
            active={filterMethod === 'all'}
            onClick={() => setFilterMethod('all')}
          />
          {usedMethods.map(id => {
            const m = METHODS.find(m => m.id === id)
            return (
              <FilterChip
                key={id}
                label={m ? (t.methods[id as keyof typeof t.methods] ?? m.name) : id}
                active={filterMethod === id}
                onClick={() => setFilterMethod(id)}
              />
            )
          })}
        </div>
      )}

      <div className="page-scroll safe-bottom px-4 pt-4">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-4">
            <div style={{ width: 48, height: 48, opacity: 0.3 }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="var(--kron-amber)" strokeWidth="1.5" strokeLinecap="round">
                <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
                <rect x="9" y="3" width="6" height="4" rx="1" />
                <path d="M9 12h6M9 16h4" />
              </svg>
            </div>
            <p style={{
              fontFamily: 'var(--font-title)',
              fontSize: 20,
              color: 'var(--kron-cream)',
              opacity: 0.6,
              letterSpacing: '0.04em',
            }}>
              {t.recipes.noRecipes}
            </p>
            <p style={{ fontSize: 13, color: 'var(--kron-amber)', opacity: 0.5 }}>
              {t.recipes.startBrewing}
            </p>
            <Button variant="primary" size="md" onClick={() => navigate('/brew')} className="mt-1">
              {lang === 'pt' ? 'Preparar Agora' : lang === 'es' ? 'Preparar Ahora' : 'Brew Now'}
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-3 pb-4">
            {filtered.map(recipe => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                t={t}
                lang={lang}
                expanded={expandedId === recipe.id}
                onToggle={() => setExpandedId(expandedId === recipe.id ? null : recipe.id!)}
                onBrewAgain={() => handleBrewAgain(recipe)}
                onDelete={() => setDeleteId(recipe.id!)}
              />
            ))}
          </div>
        )}
      </div>

      <Modal
        open={deleteId !== null}
        onClose={() => setDeleteId(null)}
        title={t.recipes.confirmDelete}
      >
        <div className="flex gap-3">
          <Button variant="ghost" size="md" fullWidth onClick={() => setDeleteId(null)}>
            {t.recipes.cancel}
          </Button>
          <Button variant="danger" size="md" fullWidth onClick={handleDelete}>
            {t.recipes.delete}
          </Button>
        </div>
      </Modal>
    </div>
  )
}

function RecipeCard({
  recipe, t, lang, expanded, onToggle, onBrewAgain, onDelete,
}: {
  recipe: SavedRecipe; t: any; lang: string; expanded: boolean
  onToggle: () => void; onBrewAgain: () => void; onDelete: () => void
}) {
  const method = METHODS.find(m => m.id === recipe.method_id)
  const date = new Date(recipe.created_at)
  const dateStr = date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
  const timeStr = date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })

  return (
    <div style={{
      borderRadius: 18,
      overflow: 'hidden',
      background: 'var(--kron-surface)',
      border: '1px solid rgba(160,104,64,0.15)',
    }}>
      <button className="w-full flex items-start gap-3 p-4 text-left" onClick={onToggle}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span style={{
              fontFamily: 'var(--font-title)',
              fontSize: 20,
              color: 'var(--kron-cream)',
              letterSpacing: '0.02em',
              lineHeight: 1.1,
            }}>
              {method ? (t.methods[recipe.method_id as keyof typeof t.methods] ?? method.name) : recipe.method_name}
            </span>
            <span style={{ fontSize: 13, color: 'var(--kron-amber)', opacity: 0.75 }}>
              — {t.profiles[recipe.profile_name as keyof typeof t.profiles] ?? recipe.profile_name}
            </span>
            {recipe.is_custom_ratio && (
              <span style={{
                fontSize: 10,
                fontFamily: 'var(--font-main)',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                padding: '2px 6px',
                borderRadius: 6,
                background: 'rgba(160,104,64,0.15)',
                color: 'var(--kron-amber)',
              }}>
                {t.brew.custom}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3" style={{ fontSize: 11, color: 'var(--kron-amber)', opacity: 0.55 }}>
            <span>{dateStr} {t.recipes.at} {timeStr}</span>
            <span>·</span>
            <span>1:{recipe.ratio} · {recipe.coffee_g}g / {recipe.water_ml}ml</span>
          </div>
          {recipe.note && (
            <p style={{
              fontSize: 12,
              marginTop: 6,
              fontStyle: 'italic',
              color: 'var(--kron-cream)',
              opacity: 0.5,
            }}>
              "{recipe.note}"
            </p>
          )}
        </div>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
          stroke="var(--kron-amber)" strokeWidth="2" strokeLinecap="round"
          style={{ transform: expanded ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s', marginTop: 4, opacity: 0.5, flexShrink: 0 }}>
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {expanded && (
        <div className="px-4 pb-4 flex flex-col gap-3" style={{ borderTop: '1px solid rgba(160,104,64,0.1)' }}>
          <div className="grid grid-cols-3 gap-2 pt-3">
            <MiniParam label={t.brew.temperature} value={recipe.temp ? `${recipe.temp}°C` : 'Frio'} />
            <MiniParam label={t.brew.grind} value={t.grind[recipe.grind as keyof typeof t.grind] ?? recipe.grind} />
            <MiniParam label={t.brew.ratio} value={`1:${recipe.ratio}`} />
          </div>

          <div className="flex gap-2 mt-1">
            <button
              onClick={onBrewAgain}
              className="flex-1 py-2.5 rounded-xl active:scale-95 transition-transform"
              style={{
                fontFamily: 'var(--font-title)',
                fontSize: 16,
                letterSpacing: '0.06em',
                background: 'var(--kron-amber)',
                color: 'var(--kron-black)',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              {t.recipes.brewAgain}
            </button>
            <button
              onClick={onDelete}
              className="px-3 py-2 rounded-xl active:scale-95 transition-transform"
              style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', cursor: 'pointer' }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                stroke="rgb(239,68,68)" strokeWidth="2" strokeLinecap="round">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6l-1 14H6L5 6" />
                <path d="M10 11v6M14 11v6M9 6V4h6v2" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function FilterChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="active:scale-95 transition-transform"
      style={{
        padding: '6px 14px',
        borderRadius: 20,
        fontFamily: 'var(--font-main)',
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        whiteSpace: 'nowrap',
        flexShrink: 0,
        background: active ? 'var(--kron-amber)' : 'rgba(160,104,64,0.08)',
        color: active ? 'var(--kron-black)' : 'var(--kron-amber)',
        border: `1px solid ${active ? 'var(--kron-amber)' : 'rgba(160,104,64,0.2)'}`,
        cursor: 'pointer',
      }}
    >
      {label}
    </button>
  )
}

function MiniParam({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col items-center py-2 rounded-xl" style={{ background: 'rgba(160,104,64,0.07)' }}>
      <span style={{ fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--kron-amber)', opacity: 0.7 }}>
        {label}
      </span>
      <span style={{ fontFamily: 'var(--font-title)', fontSize: 16, marginTop: 2, color: 'var(--kron-cream)' }}>
        {value}
      </span>
    </div>
  )
}
