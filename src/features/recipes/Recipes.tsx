import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { db, type SavedRecipe } from '../../data/db/database'
import { useBrewStore } from '../../store/brewStore'
import { useSettingsStore } from '../../store/settingsStore'
import { getTranslations } from '../../i18n'
import { METHODS } from '../../data/seed/methods'
import { BREW_PROFILES } from '../../data/seed/profiles'
import { PageHeader } from '../../shared/components/PageHeader'
import { Badge } from '../../shared/components/Badge'
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
    <div className="flex flex-col h-full" style={{ background: 'var(--kron-cream)' }}>
      <PageHeader title={t.recipes.title} dark={false} />

      {/* Filter */}
      {usedMethods.length > 1 && (
        <div className="px-4 pb-3 flex gap-2 overflow-x-auto" style={{ borderBottom: '1px solid rgba(122,79,46,0.1)' }}>
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
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <span className="text-4xl">☕</span>
            <p className="text-base font-semibold" style={{ color: 'var(--kron-primary)' }}>{t.recipes.noRecipes}</p>
            <p className="text-sm" style={{ color: 'var(--kron-primary)', opacity: 0.6 }}>{t.recipes.startBrewing}</p>
            <Button variant="primary" size="md" onClick={() => navigate('/brew')} className="mt-2">
              Preparar Agora
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-3 pb-4">
            {filtered.map(recipe => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                t={t}
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

function RecipeCard({ recipe, t, expanded, onToggle, onBrewAgain, onDelete }: {
  recipe: SavedRecipe; t: any; expanded: boolean
  onToggle: () => void; onBrewAgain: () => void; onDelete: () => void
}) {
  const method = METHODS.find(m => m.id === recipe.method_id)
  const date = new Date(recipe.created_at)
  const dateStr = date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
  const timeStr = date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: 'white', border: '1px solid rgba(122,79,46,0.12)', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
      <button className="w-full flex items-start gap-3 p-4 text-left" onClick={onToggle}>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="text-lg font-bold uppercase tracking-wide"
              style={{ color: 'var(--kron-black)', fontFamily: 'var(--font-main)' }}>
              {method ? (t.methods[recipe.method_id as keyof typeof t.methods] ?? method.name) : recipe.method_name}
            </span>
            <span className="text-sm font-medium" style={{ color: 'var(--kron-primary)' }}>
              — {t.profiles[recipe.profile_name as keyof typeof t.profiles] ?? recipe.profile_name}
            </span>
            {recipe.is_custom_ratio && <Badge variant="custom">{t.brew.custom}</Badge>}
          </div>
          <div className="flex items-center gap-3 text-xs" style={{ color: 'var(--kron-primary)', opacity: 0.6 }}>
            <span>{dateStr} {t.recipes.at} {timeStr}</span>
            <span>·</span>
            <span>1:{recipe.ratio} · {recipe.coffee_g}g / {recipe.water_ml}ml</span>
          </div>
          {recipe.note && (
            <p className="text-sm mt-1.5 italic" style={{ color: 'var(--kron-primary)', opacity: 0.7 }}>
              "{recipe.note}"
            </p>
          )}
        </div>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
          stroke="var(--kron-primary)" strokeWidth="2" strokeLinecap="round"
          style={{ transform: expanded ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s', marginTop: 4, opacity: 0.5, flexShrink: 0 }}>
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {expanded && (
        <div className="px-4 pb-4 flex flex-col gap-3" style={{ borderTop: '1px solid rgba(122,79,46,0.08)' }}>
          {/* Params grid */}
          <div className="grid grid-cols-3 gap-2 pt-3">
            <MiniParam label={t.brew.temperature} value={recipe.temp ? `${recipe.temp}°C` : 'Frio'} />
            <MiniParam label={t.brew.grind} value={t.grind[recipe.grind as keyof typeof t.grind] ?? recipe.grind} />
            <MiniParam label={t.brew.ratio} value={`1:${recipe.ratio}`} />
          </div>

          {/* Actions */}
          <div className="flex gap-2 mt-1">
            <Button
              variant="primary" size="sm" fullWidth onClick={onBrewAgain}
              style={{ fontSize: 13 }}
            >
              {t.recipes.brewAgain}
            </Button>
            <button
              onClick={onDelete}
              className="px-3 py-2 rounded-xl active:scale-95 transition-transform"
              style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgb(239,68,68)" strokeWidth="2" strokeLinecap="round">
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
      className="px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-widest whitespace-nowrap flex-shrink-0 active:scale-95 transition-transform"
      style={{
        fontFamily: 'var(--font-main)',
        background: active ? 'var(--kron-primary)' : 'rgba(122,79,46,0.08)',
        color: active ? 'var(--kron-white)' : 'var(--kron-primary)',
        border: `1px solid ${active ? 'var(--kron-primary)' : 'rgba(122,79,46,0.2)'}`,
      }}
    >
      {label}
    </button>
  )
}

function MiniParam({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col items-center py-2 rounded-xl" style={{ background: 'rgba(122,79,46,0.06)' }}>
      <span className="text-[9px] uppercase tracking-widest" style={{ color: 'var(--kron-amber)' }}>{label}</span>
      <span className="text-sm font-bold mt-0.5" style={{ color: 'var(--kron-primary)', fontFamily: 'var(--font-main)' }}>{value}</span>
    </div>
  )
}
