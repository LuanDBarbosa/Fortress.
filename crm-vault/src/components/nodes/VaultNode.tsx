import { useState, useEffect, useRef } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Lock, Unlock, Eye, EyeOff, Plus, Trash2, Copy, Check, ShieldAlert } from 'lucide-react';
import { useCanvasStore } from '../../store/canvasStore';

const COLOR_OPTIONS = [
  { class: 'text-white focus:border-white/50', hex: '#ffffff' },
  { class: 'text-slate-400 focus:border-slate-400/50', hex: '#94a3b8' },
  { class: 'text-red-400 focus:border-red-400/50', hex: '#f87171' },
  { class: 'text-orange-400 focus:border-orange-400/50', hex: '#fb923c' },
  { class: 'text-amber-400 focus:border-amber-400/50', hex: '#fbbf24' },
  { class: 'text-yellow-400 focus:border-yellow-400/50', hex: '#facc15' },
  { class: 'text-lime-400 focus:border-lime-400/50', hex: '#a3e635' },
  { class: 'text-vault-green focus:border-vault-green/50', hex: '#22c55e' },
  { class: 'text-emerald-400 focus:border-emerald-400/50', hex: '#34d399' },
  { class: 'text-cyan-400 focus:border-cyan-400/50', hex: '#22d3ee' },
  { class: 'text-blue-400 focus:border-blue-400/50', hex: '#60a5fa' },
  { class: 'text-indigo-400 focus:border-indigo-400/50', hex: '#818cf8' },
  { class: 'text-violet-400 focus:border-violet-400/50', hex: '#a78bfa' },
  { class: 'text-purple-400 focus:border-purple-400/50', hex: '#c084fc' },
  { class: 'text-fuchsia-400 focus:border-fuchsia-400/50', hex: '#e879f9' },
  { class: 'text-pink-400 focus:border-pink-400/50', hex: '#f472b6' },
  { class: 'text-rose-400 focus:border-rose-400/50', hex: '#fb7185' }
];

export const VaultNode = ({ id, data, selected }: any) => {
  const isVaultUnlocked = useCanvasStore((state) => state.isVaultUnlocked);
  const vaultUnlockExpiry = useCanvasStore((state) => state.vaultUnlockExpiry);
  const unlockVault = useCanvasStore((state) => state.unlockVault);
  const lockVault = useCanvasStore((state) => state.lockVault);
  const checkVaultTimeout = useCanvasStore((state) => state.checkVaultTimeout);
  const updateNode = useCanvasStore((state) => state.updateNode);

  const [passwordInput, setPasswordInput] = useState('');
  const [error, setError] = useState(false);
  const [timeLeft, setTimeLeft] = useState<string>('');
  
  // Local state for performance (debounced syncing)
  const [localSecrets, setLocalSecrets] = useState<any[]>(data.secrets || []);
  const syncTimeoutRef = useRef<any>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [activeColorPicker, setActiveColorPicker] = useState<number | null>(null);

  // Sync from props if external changes happen (though rare for Vault)
  useEffect(() => {
    if (data.secrets && JSON.stringify(data.secrets) !== JSON.stringify(localSecrets)) {
      setLocalSecrets(data.secrets);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.secrets]);

  // Auto-lock timer
  useEffect(() => {
    if (!isVaultUnlocked || !vaultUnlockExpiry) return;
    
    const interval = setInterval(() => {
      checkVaultTimeout();
      const remaining = vaultUnlockExpiry - Date.now();
      if (remaining > 0) {
        const mins = Math.floor(remaining / 60000);
        const secs = Math.floor((remaining % 60000) / 1000);
        setTimeLeft(`${mins}:${secs.toString().padStart(2, '0')}`);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isVaultUnlocked, vaultUnlockExpiry, checkVaultTimeout]);

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (unlockVault(passwordInput)) {
      setPasswordInput('');
      setError(false);
    } else {
      setError(true);
    }
  };

  const syncToStore = (newSecrets: any[]) => {
    if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
    syncTimeoutRef.current = setTimeout(() => {
      updateNode(id, { secrets: newSecrets });
    }, 400);
  };

  const addSecret = () => {
    const newSecrets = [...localSecrets, { key: '', value: '', show: false, colorIndex: 0 }];
    setLocalSecrets(newSecrets);
    updateNode(id, { secrets: newSecrets }); // Sync immediately on add
  };

  const updateSecret = (index: number, field: 'key' | 'value', val: string) => {
    const newSecrets = [...localSecrets];
    newSecrets[index][field] = val;
    setLocalSecrets(newSecrets);
    syncToStore(newSecrets);
  };

  const toggleShow = (index: number) => {
    const newSecrets = [...localSecrets];
    newSecrets[index].show = !newSecrets[index].show;
    setLocalSecrets(newSecrets);
    updateNode(id, { secrets: newSecrets }); // Sync immediately on toggle
  };

  const toggleLock = (index: number) => {
    const newSecrets = [...localSecrets];
    newSecrets[index].isLocked = !newSecrets[index].isLocked;
    setLocalSecrets(newSecrets);
    updateNode(id, { secrets: newSecrets }); // Sync immediately on lock
  };

  const setColor = (index: number, colorIndex: number) => {
    const newSecrets = [...localSecrets];
    newSecrets[index].colorIndex = colorIndex;
    setLocalSecrets(newSecrets);
    updateNode(id, { secrets: newSecrets }); // Sync immediately on color change
  };

  const removeSecret = (index: number) => {
    const newSecrets = localSecrets.filter((_: any, i: number) => i !== index);
    setLocalSecrets(newSecrets);
    updateNode(id, { secrets: newSecrets }); // Sync immediately on remove
  };

  const handleCopy = (value: string, index: number) => {
    if (!value) return;
    navigator.clipboard.writeText(value);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className={`w-80 glass-panel rounded-xl p-4 transition-all duration-300 relative ${
      selected ? 'ring-2 ring-vault-green/50 border-vault-green/30 shadow-[0_0_15px_rgba(34,197,94,0.2)]' : 'hover:border-slate-500/50'
    } bg-vault-green/5`}>
      <Handle type="target" position={Position.Left} className="w-2 h-2 !bg-vault-green/50 border-none" />
      
      <div className="flex items-center justify-between border-b border-glass-stroke pb-3 mb-3">
        <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded-lg transition-colors ${isVaultUnlocked ? 'bg-vault-green/20 text-vault-green' : 'bg-slate-800 text-slate-400'}`}>
            {isVaultUnlocked ? <Unlock size={14} /> : <Lock size={14} />}
          </div>
          <span className="text-sm font-semibold text-white">{data.label || 'Secure Vault'}</span>
        </div>
        {isVaultUnlocked && (
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-geist text-vault-green animate-pulse">{timeLeft}</span>
            <button className="text-[10px] bg-slate-800 px-2 py-1 rounded text-slate-400 hover:text-white hover:bg-slate-700 transition-colors nodrag" onClick={lockVault} >Lock</button>
          </div>
        )}
      </div>

      {!isVaultUnlocked ? (
        <form onSubmit={handleUnlock} className={`space-y-3 transition-transform ${error ? 'translate-x-1' : ''}`}>
          <p className="text-xs text-slate-400">This vault requires the master password to access.</p>
          <input 
            type="password" 
            name="vaultMasterPassword"
            value={passwordInput}
            onChange={(e) => {
              setPasswordInput(e.target.value);
              setError(false);
            }}
            placeholder="Enter Master Password"
            className={`nodrag w-full bg-slate-900/50 border ${error ? 'border-red-500/50' : 'border-glass-stroke'} rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-vault-green/50 transition-colors`}
            onClick={(e) => e.stopPropagation()}
          />
          <button className="w-full bg-vault-green/20 text-vault-green border border-vault-green/30 rounded-lg py-1.5 text-sm font-medium hover:bg-vault-green/30 transition-colors nodrag" type="submit" >
            Unlock Vault
          </button>
        </form>
      ) : (
        <div className="space-y-3">
          {localSecrets.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-6 text-slate-500 gap-2">
              <ShieldAlert size={24} className="opacity-50" />
              <span className="text-xs">No secrets stored yet.</span>
            </div>
          ) : (
            <div className={`space-y-2 pr-1 custom-scrollbar nodrag transition-all ${data.autoExpand ? '' : 'max-h-[200px] overflow-y-auto'}`}>
              {localSecrets.map((s: any, i: number) => {
                const colorObj = COLOR_OPTIONS[s.colorIndex || 0];
                return (
                  <div key={i} className="bg-slate-900/50 rounded-lg p-2 border border-glass-stroke transition-colors hover:border-slate-700">
                    <div className="flex gap-2 mb-2 items-center relative">
                      {activeColorPicker === i ? (
                        <div className="grid grid-cols-6 gap-1.5 bg-slate-800 p-2 rounded-xl absolute z-20 -left-2 top-6 shadow-xl border border-slate-700 w-max" onMouseLeave={() => setActiveColorPicker(null)}>
                          {COLOR_OPTIONS.map((c, cIdx) => (
                            <button
                              key={cIdx}
                              onClick={(e) => { e.stopPropagation(); setColor(i, cIdx); setActiveColorPicker(null); }}
                              className={`nodrag w-4 h-4 rounded-full border border-slate-600 shrink-0 hover:scale-125 transition-transform ${s.colorIndex === cIdx ? 'ring-2 ring-white ring-offset-1 ring-offset-slate-800' : ''}`}
                              style={{ backgroundColor: c.hex }}
                              title="Select color"
                            />
                          ))}
                        </div>
                      ) : (
                        <button 
                          onClick={() => setActiveColorPicker(i)} 
                          className="nodrag w-3 h-3 rounded-full border border-slate-600 shrink-0 mt-0.5 hover:scale-110 transition-transform"
                          style={{ backgroundColor: colorObj.hex }}
                          title="Choose color"
                        />
                      )}
                      <input 
                        name={`vaultSecretKey-${i}`}
                        value={s.key}
                        onChange={(e) => !s.isLocked && updateSecret(i, 'key', e.target.value)}
                        placeholder="Title (e.g. API Key)"
                        readOnly={s.isLocked}
                        className={`nodrag w-1/2 bg-transparent text-xs font-medium focus:outline-none transition-colors ${s.isLocked ? 'text-slate-500 cursor-default' : 'text-slate-300 focus:text-white'}`}
                        onClick={(e) => e.stopPropagation()}
                      />
                      <div className="flex-1 flex justify-end gap-1.5 items-center">
                        <button onClick={() => toggleLock(i)} className="nodrag text-slate-400 hover:text-white transition-colors">
                          {s.isLocked ? <Lock size={12}/> : <Unlock size={12}/>}
                        </button>
                        <button onClick={() => toggleShow(i)} className="nodrag text-slate-400 hover:text-white transition-colors">
                          {s.show ? <EyeOff size={12}/> : <Eye size={12}/>}
                        </button>
                        <button onClick={() => handleCopy(s.value, i)} className="nodrag text-slate-400 hover:text-vault-green transition-colors">
                          {copiedIndex === i ? <Check size={12} className="text-vault-green" /> : <Copy size={12}/>}
                        </button>
                        <button onClick={() => removeSecret(i)} className="nodrag text-slate-400 hover:text-red-400 transition-colors ml-1"><Trash2 size={12}/></button>
                      </div>
                    </div>
                    <input 
                      type={s.show ? 'text' : 'password'}
                      name={`vaultSecretValue-${i}`}
                      value={s.value}
                      onChange={(e) => !s.isLocked && updateSecret(i, 'value', e.target.value)}
                      placeholder="Secret Value"
                      readOnly={s.isLocked}
                      className={`nodrag w-full bg-charcoal-800 border rounded px-2 py-1.5 text-xs focus:outline-none font-geist transition-colors ${colorObj.class} ${s.isLocked ? 'border-transparent opacity-50 cursor-default' : 'border-glass-stroke'}`}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                );
              })}
            </div>
          )}
          <button className="w-full flex items-center justify-center gap-2 bg-slate-800 text-slate-300 border border-glass-stroke rounded-lg py-1.5 text-xs font-medium hover:bg-slate-700 hover:text-white transition-colors nodrag" onClick={addSecret} >
            <Plus size={12} /> Add Secret
          </button>
        </div>
      )}

      <Handle type="source" position={Position.Right} className="w-2 h-2 !bg-vault-green/50 border-none" />
    </div>
  );
};
