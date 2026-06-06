import { useState } from 'react';
import { useWallet } from '../hooks/useWallet';

export default function WalletButton() {
  const { shortAddress, walletType, isConnecting, error, isConnected, connectMetaMask, connectTrustWallet, disconnect } = useWallet();
  const [showModal, setShowModal] = useState(false);

  if (isConnected) {
    return (
      <button
        onClick={disconnect}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '6px 14px',
          background: 'rgba(0,212,255,0.08)',
          border: '1px solid rgba(0,212,255,0.3)',
          borderRadius: '8px',
          color: 'var(--accent-cyan, #00d4ff)',
          fontSize: '13px',
          fontWeight: 600,
          cursor: 'pointer',
          fontFamily: 'JetBrains Mono, monospace',
          whiteSpace: 'nowrap',
        }}
        title="클릭하여 연결 해제"
      >
        {walletType === 'MetaMask' ? '🦊' : '🔵'} {shortAddress}
      </button>
    );
  }

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        disabled={isConnecting}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '6px 14px',
          background: 'rgba(0,212,255,0.1)',
          border: '1px solid rgba(0,212,255,0.25)',
          borderRadius: '8px',
          color: 'var(--accent-cyan, #00d4ff)',
          fontSize: '13px',
          fontWeight: 600,
          cursor: isConnecting ? 'not-allowed' : 'pointer',
          opacity: isConnecting ? 0.6 : 1,
          whiteSpace: 'nowrap',
        }}
      >
        {isConnecting ? '연결 중...' : '지갑 연결'}
      </button>

      {showModal && (
        <div
          onClick={() => setShowModal(false)}
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,0.7)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 1000,
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: 'var(--bg-card, #141920)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '16px',
              padding: '28px 24px',
              width: '320px',
              boxShadow: '0 24px 48px rgba(0,0,0,0.6)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary, #e8ecf4)', margin: 0 }}>
                지갑 연결
              </h3>
              <button
                onClick={() => setShowModal(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-tertiary, #5a6678)', cursor: 'pointer', fontSize: '18px', lineHeight: 1 }}
              >
                ×
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button
                onClick={async () => { await connectMetaMask(); setShowModal(false); }}
                style={{
                  display: 'flex', alignItems: 'center', gap: '12px',
                  padding: '14px 16px',
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '10px',
                  color: 'var(--text-primary, #e8ecf4)',
                  fontSize: '14px', fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'border-color 0.2s',
                }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(0,212,255,0.4)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'}
              >
                <span style={{ fontSize: '24px' }}>🦊</span>
                MetaMask
              </button>

              <button
                onClick={async () => { await connectTrustWallet(); setShowModal(false); }}
                style={{
                  display: 'flex', alignItems: 'center', gap: '12px',
                  padding: '14px 16px',
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '10px',
                  color: 'var(--text-primary, #e8ecf4)',
                  fontSize: '14px', fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'border-color 0.2s',
                }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(0,212,255,0.4)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'}
              >
                <span style={{ fontSize: '24px' }}>🔵</span>
                Trust Wallet
              </button>
            </div>

            {error && (
              <p style={{ marginTop: '14px', fontSize: '12px', color: 'var(--accent-crimson, #ef4444)', textAlign: 'center' }}>
                {error}
              </p>
            )}
          </div>
        </div>
      )}
    </>
  );
}
