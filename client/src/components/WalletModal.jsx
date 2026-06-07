import { useWallet } from '../context/WalletContext';

export default function WalletModal() {
  const {
    showModal, setShowModal,
    isConnecting, error,
    connectMetaMask,
    connectTrustWallet,
    connectWalletConnect,
  } = useWallet();

  if (!showModal) return null;

  return (
    <div
      onClick={() => setShowModal(false)}
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.8)',
        backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center',
        justifyContent: 'center', zIndex: 9999,
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: '#141920',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '20px',
          padding: '32px',
          width: '400px',
          maxWidth: '90vw',
        }}
      >
        <div style={{
          display: 'flex', justifyContent: 'space-between',
          alignItems: 'center', marginBottom: '24px',
        }}>
          <h2 style={{ color: '#fff', fontSize: '20px', fontWeight: 600, margin: 0 }}>
            Connect Wallet
          </h2>
          <button
            onClick={() => setShowModal(false)}
            style={{
              background: 'none', border: 'none',
              color: '#6b7280', fontSize: '24px',
              cursor: 'pointer', lineHeight: 1,
            }}
          >×</button>
        </div>

        <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '24px', lineHeight: 1.6 }}>
          지갑을 연결해 포트폴리오 리스크 모니터링을 시작하세요.
        </p>

        {error && (
          <div style={{
            background: 'rgba(239,68,68,0.1)',
            border: '1px solid rgba(239,68,68,0.2)',
            borderRadius: '10px', padding: '12px 16px',
            marginBottom: '16px',
            color: '#ef4444', fontSize: '13px',
          }}>
            {error}
          </div>
        )}

        {/* MetaMask */}
        <button
          onClick={connectMetaMask}
          disabled={isConnecting}
          style={{
            width: '100%', padding: '16px 20px',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '12px', cursor: 'pointer',
            display: 'flex', alignItems: 'center',
            gap: '16px', marginBottom: '12px',
            transition: 'all 0.15s',
          }}
          onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)'}
          onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'}
        >
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg"
            alt="MetaMask"
            style={{ width: '36px', height: '36px' }}
            onError={e => { e.target.style.display = 'none'; }}
          />
          <div style={{ textAlign: 'left' }}>
            <div style={{ color: '#fff', fontSize: '15px', fontWeight: 500 }}>MetaMask</div>
            <div style={{ color: '#6b7280', fontSize: '12px' }}>가장 인기있는 크립토 지갑</div>
          </div>
          <span style={{ marginLeft: 'auto', color: '#6b7280', fontSize: '12px' }}>→</span>
        </button>

        {/* Trust Wallet */}
        <button
          onClick={connectTrustWallet}
          disabled={isConnecting}
          style={{
            width: '100%', padding: '16px 20px',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '12px', cursor: 'pointer',
            display: 'flex', alignItems: 'center',
            gap: '16px', marginBottom: '12px',
            transition: 'all 0.15s',
          }}
          onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)'}
          onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'}
        >
          <img
            src="https://trustwallet.com/assets/images/media/assets/trust_platform.svg"
            alt="Trust Wallet"
            style={{ width: '36px', height: '36px' }}
            onError={e => { e.target.style.display = 'none'; }}
          />
          <div style={{ textAlign: 'left' }}>
            <div style={{ color: '#fff', fontSize: '15px', fontWeight: 500 }}>Trust Wallet</div>
            <div style={{ color: '#6b7280', fontSize: '12px' }}>모바일 & 익스텐션 지원</div>
          </div>
          <span style={{ marginLeft: 'auto', color: '#6b7280', fontSize: '12px' }}>→</span>
        </button>

        {/* WalletConnect — coming soon */}
        <button
          onClick={connectWalletConnect}
          disabled={isConnecting}
          style={{
            width: '100%', padding: '16px 20px',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '12px', cursor: 'default',
            display: 'flex', alignItems: 'center',
            gap: '16px', opacity: 0.5,
            transition: 'all 0.15s',
          }}
        >
          <div style={{
            width: '36px', height: '36px',
            background: '#3b99fc', borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '20px',
          }}>🔗</div>
          <div style={{ textAlign: 'left' }}>
            <div style={{ color: '#fff', fontSize: '15px', fontWeight: 500 }}>WalletConnect</div>
            <div style={{ color: '#6b7280', fontSize: '12px' }}>Coming Soon — QR 코드로 연결</div>
          </div>
        </button>

        <p style={{
          color: '#4a5568', fontSize: '12px',
          textAlign: 'center', marginTop: '20px', lineHeight: 1.6,
        }}>
          지갑을 연결하면 Dolphin의 이용약관에 동의하는 것으로 간주됩니다.
          개인키는 절대 요청하지 않습니다.
        </p>
      </div>
    </div>
  );
}
