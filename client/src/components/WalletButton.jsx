import { useWallet } from '../context/WalletContext';

export default function WalletButton() {
  const {
    shortAddress, walletType, chainName,
    balance, isConnected,
    setShowModal, disconnect,
  } = useWallet();

  if (isConnected) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {chainName && (
          <span style={{
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '6px',
            padding: '4px 10px',
            fontSize: '12px',
            color: '#6b7280',
          }}>{chainName}</span>
        )}
        <button
          onClick={disconnect}
          style={{
            background: 'rgba(0,229,255,0.08)',
            border: '1px solid rgba(0,229,255,0.25)',
            color: '#00e5ff',
            borderRadius: '8px',
            padding: '8px 16px',
            fontSize: '13px',
            cursor: 'pointer',
            fontFamily: 'JetBrains Mono, monospace',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
          title="클릭하여 연결 해제"
        >
          <span>{walletType === 'MetaMask' ? '🦊' : '🔵'}</span>
          <span>{shortAddress}</span>
          {balance && <span style={{ color: '#4a5568' }}>| {balance} ETH</span>}
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setShowModal(true)}
      style={{
        background: 'rgba(255,255,255,0.06)',
        border: '1px solid rgba(255,255,255,0.12)',
        color: '#fff',
        borderRadius: '8px',
        padding: '8px 16px',
        fontSize: '13px',
        cursor: 'pointer',
        fontWeight: 500,
        transition: 'all 0.15s',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)';
      }}
    >
      Connect Wallet
    </button>
  );
}
