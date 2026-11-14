import { useState, useEffect } from 'react';
import { Save, RotateCcw, Plus, Trash2, ChevronRight } from 'lucide-react';
import { api } from '../../api/client';
import LoadingSpinner from '../ui/LoadingSpinner';
import { STORE_NAV, mergeNewDefaultLinks } from '../../store/config/navigation';

// Editable copy of the storefront menu: every top-level item (enabled flag) plus its dropdown links.
const toEditableLinks = (links = []) =>
  links.map((l) => ({
    label: l.label,
    to: l.to,
    enabled: l.enabled !== false,
    children: toEditableLinks(l.children || []),
  }));

const buildDefaults = () =>
  STORE_NAV.map((item) => ({
    id: item.id,
    label: item.label,
    enabled: true,
    dropdown: toEditableLinks(item.dropdown || []),
  }));

// Merge saved settings over defaults so newly shipped menu items still show up.
const mergeSaved = (saved) => {
  const defaults = buildDefaults();
  if (!saved || !Array.isArray(saved.items)) return defaults;
  return defaults.map((d) => {
    const s = saved.items.find((i) => i.id === d.id);
    if (!s) return d;
    return {
      ...d,
      enabled: s.enabled !== false,
      dropdown: Array.isArray(s.dropdown)
        ? toEditableLinks(mergeNewDefaultLinks(STORE_NAV.find((n) => n.id === d.id)?.dropdown, s.dropdown))
        : d.dropdown,
    };
  });
};

function Toggle({ checked, onChange, label }) {
  return (
    <label className="relative inline-flex items-center cursor-pointer shrink-0" title={label}>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="sr-only peer" />
      <div className="w-9 h-5 bg-slate-300 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-600 dark:peer-checked:bg-purple-500" />
    </label>
  );
}

function LinkRow({ link, onChange, onRemove, depth = 0 }) {
  const setChild = (idx, next) =>
    onChange({ ...link, children: link.children.map((c, i) => (i === idx ? next : c)) });
  const removeChild = (idx) =>
    onChange({ ...link, children: link.children.filter((_, i) => i !== idx) });
  const addChild = () =>
    onChange({ ...link, children: [...link.children, { label: '', to: '/shop', enabled: true, children: [] }] });

  return (
    <div className={depth ? 'pl-4 border-l border-slate-200 dark:border-slate-700 ml-2' : ''}>
      <div className="flex flex-wrap items-center gap-2 py-1.5">
        <Toggle checked={link.enabled} onChange={(v) => onChange({ ...link, enabled: v })} label="Enable / disable" />
        <input
          className="input-field text-xs flex-1 min-w-[140px] dark:bg-slate-950 dark:border-slate-800 dark:text-white"
          placeholder="Label"
          value={link.label}
          onChange={(e) => onChange({ ...link, label: e.target.value })}
        />
        <input
          className="input-field text-xs flex-[2] min-w-[200px] font-mono dark:bg-slate-950 dark:border-slate-800 dark:text-white"
          placeholder="/shop?categorySlug=..."
          value={link.to}
          onChange={(e) => onChange({ ...link, to: e.target.value })}
        />
        {depth === 0 && (
          <button type="button" onClick={addChild} className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800" title="Add sub-link">
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
        <button type="button" onClick={onRemove} className="p-1.5 rounded-lg border border-rose-200 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40" title="Delete">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
      {link.children.map((child, idx) => (
        <LinkRow key={idx} link={child} depth={depth + 1} onChange={(next) => setChild(idx, next)} onRemove={() => removeChild(idx)} />
      ))}
    </div>
  );
}

function NavigationSettings() {
  const [items, setItems] = useState(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    api.settings.getNavigation()
      .then((res) => setItems(mergeSaved(res?.data)))
      .catch(() => setItems(buildDefaults()));
  }, []);

  const updateItem = (id, patch) => setItems((prev) => prev.map((i) => (i.id === id ? { ...i, ...patch } : i)));

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const cleaned = items.map((i) => ({
        ...i,
        dropdown: i.dropdown.filter((l) => l.label.trim() && l.to.trim()),
      }));
      const res = await api.settings.updateNavigation({ items: cleaned });
      if (res.success) setMessage({ type: 'ok', text: 'Menu saved. The storefront header now uses these settings.' });
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to save menu' });
    } finally {
      setSaving(false);
    }
  };

  if (!items) return <LoadingSpinner />;

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Add, delete, enable or disable the categories shown in the storefront header menu.
        </p>
        <div className="flex gap-2">
          <button type="button" onClick={() => setItems(buildDefaults())} className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <RotateCcw className="w-4 h-4" /> Reset to default
          </button>
          <button type="button" onClick={handleSave} disabled={saving} className="btn-primary px-4 py-2 text-xs flex items-center gap-1.5">
            <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Menu'}
          </button>
        </div>
      </div>

      {message && (
        <div className={`p-3 rounded-xl text-sm border ${message.type === 'ok' ? 'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-950/30 dark:border-emerald-800 dark:text-emerald-300' : 'bg-red-50 border-red-200 text-red-700 dark:bg-red-950/30 dark:border-red-800 dark:text-red-300'}`}>
          {message.text}
        </div>
      )}

      {items.map((item) => (
        <div key={item.id} className="glass-card p-5 space-y-3">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200/80 dark:border-slate-800/80">
            <div className="flex items-center gap-3">
              <Toggle checked={item.enabled} onChange={(v) => updateItem(item.id, { enabled: v })} label="Show in header" />
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">{item.label}</h3>
              {!item.enabled && <span className="text-[10px] uppercase font-bold text-slate-400">Hidden</span>}
            </div>
            <button
              type="button"
              onClick={() => updateItem(item.id, { dropdown: [...item.dropdown, { label: '', to: '/shop', enabled: true, children: [] }] })}
              className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Add Link
            </button>
          </div>

          {item.dropdown.length === 0 && (
            <p className="text-xs text-slate-400">No dropdown links.</p>
          )}
          {item.dropdown.map((link, idx) => (
            <LinkRow
              key={idx}
              link={link}
              onChange={(next) => updateItem(item.id, { dropdown: item.dropdown.map((l, i) => (i === idx ? next : l)) })}
              onRemove={() => updateItem(item.id, { dropdown: item.dropdown.filter((_, i) => i !== idx) })}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

export default NavigationSettings;
