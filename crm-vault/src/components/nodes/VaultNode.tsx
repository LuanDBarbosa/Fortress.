import { useState, useEffect } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Lock, Unlock, Eye, Plus, Trash2 } from 'lucide-react';
import { useCanvasStore } from '../../store/canvasStore';

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

  const secrets = data.secrets || [];

  const addSecret = () => {
    updateNode(id, { secrets: [...secrets, { key: '', value: '', show: false }] });
  };

  const updateSecret = (index: number, field: 'key' | 'value', val: string) => {
    const newSecrets = [...secrets];
    newSecrets[index][field] = val;
    updateNode(id, { secrets: newSecrets });
  };

  const toggleShow = (index: number) => {
    const newSecrets = [...secrets];
    newSecrets[index].show = !newSecrets[index].show;
    updateNode(id, { secrets: newSecrets });
  };

  const removeSecret = (index: number) => {
    updateNode(id, { secrets: secrets.filter((_: any, i: number) => i !== index) });
  };

  return (
    <div className={`w-80 glass-panel rounded-xl p-4 transition-colors relative ${
      selected ? 'ring-2 ring-vault-green/50 border-vault-green/30 shadow-[0_0_15px_rgba(34,197,94,0.2)]' : 'hover:border-slate-500/50'
    } bg-vault-green/5`}>
      <Handle type="target" position={Position.Left} className="w-2 h-2 !bg-vault-green/50 border-none" />
      
      <div className="flex items-center justify-between border-b border-glass-stroke pb-3 mb-3">
        <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded-lg ${isVaultUnlocked ? 'bg-vault-green/20 text-vault-green' : 'bg-slate-800 text-slate-400'}`}>
            {isVaultUnlocked ? <Unlock size={14} /> : <Lock size={14} />}
          </div>
          <span className="text-sm font-semibold text-white">Secure Vault</span>
        </div>
        {isVaultUnlocked && (
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-geist text-vault-green animate-pulse">{timeLeft}</span>
            <button onClick={lockVault} className="text-[10px] bg-slate-800 px-2 py-1 rounded text-slate-400 hover:text-white">Lock</button>
          </div>
        )}
      </div>

      {!isVaultUnlocked ? (
        <form onSubmit={handleUnlock} className="space-y-3">
          <p className="text-xs text-slate-400">This vault requires the master password to access.</p>
          <input 
            type="password" 
            name="vaultMasterPassword"
            value={passwordInput}
            onChange={(e) => setPasswordInput(e.target.value)}
            placeholder="Enter Master Password"
            className={`w-full bg-slate-900/50 border ${error ? 'border-red-500/50' : 'border-glass-stroke'} rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-vault-green/50`}
            onClick={(e) => e.stopPropagation()}
          />
          <button type="submit" className="w-full bg-vault-green/20 text-vault-green border border-vault-green/30 rounded-lg py-1.5 text-sm font-medium hover:bg-vault-green/30 transition-colors">
            Unlock Vault
          </button>
        </form>
      ) : (
        <div className="space-y-3">
          {secrets.length === 0 ? (
            <div className="text-xs text-slate-500 text-center py-4">No secrets stored yet.</div>
          ) : (
            <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1 custom-scrollbar">
              {secrets.map((s: any, i: number) => (
                <div key={i} className="bg-slate-900/50 rounded-lg p-2 border border-glass-stroke">
                  <div className="flex gap-2 mb-2">
                    <input 
                      name={`vaultSecretKey-${i}`}
                      value={s.key}
                      onChange={(e) => updateSecret(i, 'key', e.target.value)}
                      placeholder="Title (e.g. API Key)"
                      className="w-1/2 bg-transparent text-xs text-slate-300 focus:outline-none"
                      onClick={(e) => e.stopPropagation()}
                    />
                    <div className="flex-1 flex justify-end gap-1">
                      <button onClick={() => toggleShow(i)} className="text-slate-400 hover:text-white"><Eye size={12}/></button>
                      <button onClick={() => removeSecret(i)} className="text-red-400 hover:text-red-300"><Trash2 size={12}/></button>
                    </div>
                  </div>
                  <input
                    type={s.show ? 'text' : 'password'}
                    name={`vaultSecretValue-${i}`}
                    value={s.value}
                    onChange={(e) => updateSecret(i, 'value', e.target.value)}
                    placeholder="Secret Value"
                    className="w-full bg-charcoal-800 border border-glass-stroke rounded px-2 py-1.5 text-xs text-white focus:outline-none focus:border-vault-green/50 font-geist"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              ))}
            </div>
          )}
          <button onClick={addSecret} className="w-full flex items-center justify-center gap-2 bg-slate-800 text-slate-300 border border-glass-stroke rounded-lg py-1.5 text-xs font-medium hover:bg-slate-700 transition-colors">
            <Plus size={12} /> Add Secret
          </button>
        </div>
      )}

      <Handle type="source" position={Position.Right} className="w-2 h-2 !bg-vault-green/50 border-none" />
    </div>
  );
};
