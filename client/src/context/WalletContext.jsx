import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';

const WalletContext = createContext(null);

export function WalletProvider({ children }) {
  const [address, setAddress] = useState(null);
  const [shortAddress, setShortAddress] = useState(null);
  const [walletType, setWalletType] = useState(null);
  const [chainId, setChainId] = useState(null);
  const [balance, setBalance] = useState(null);
  const [provider, setProvider] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const getChainName = (id) => {
    const chains = {
      1: 'Ethereum',
      56: 'BNB Chain',
      137: 'Polygon',
      42161: 'Arbitrum',
      8453: 'Base',
    };
    return chains[id] || `Chain ${id}`;
  };

  const fetchBalance = useCallback(async (addr, prov) => {
    try {
      const bal = await prov.getBalance(addr);
      setBalance(parseFloat(ethers.formatEther(bal)).toFixed(4));
    } catch {
      setBalance(null);
    }
  }, []);

  const connectWallet = useCallback(async (ethereum, type) => {
    setIsConnecting(true);
    setError(null);
    try {
      const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
      const account = accounts[0];
      const prov = new ethers.BrowserProvider(ethereum);
      const network = await prov.getNetwork();
      const chainIdNum = Number(network.chainId);

      setAddress(account);
      setShortAddress(`${account.slice(0, 6)}...${account.slice(-4)}`);
      setWalletType(type);
      setChainId(chainIdNum);
      setProvider(prov);
      setShowModal(false);

      await fetchBalance(account, prov);

      localStorage.setItem('dorphin_wallet_type', type);
      localStorage.setItem('dorphin_wallet_address', account);
    } catch (e) {
      if (e.code === 4001) {
        setError('연결을 거부했습니다.');
      } else {
        setError(e.message || '연결 실패');
      }
    } finally {
      setIsConnecting(false);
    }
  }, [fetchBalance]);

  const connectMetaMask = useCallback(async () => {
    if (!window.ethereum) {
      setError('MetaMask가 설치되어 있지 않습니다.');
      window.open('https://metamask.io/download/', '_blank');
      return;
    }

    const ethereum = window.ethereum.providers
      ? window.ethereum.providers.find(p => p.isMetaMask)
      : window.ethereum.isMetaMask
        ? window.ethereum
        : null;

    if (!ethereum) {
      setError('MetaMask를 찾을 수 없습니다.');
      return;
    }

    await connectWallet(ethereum, 'MetaMask');
  }, [connectWallet]);

  const connectTrustWallet = useCallback(async () => {
    const ethereum = window.ethereum?.providers
      ? window.ethereum.providers.find(p => p.isTrust || p.isTrustWallet)
      : window.ethereum?.isTrust || window.ethereum?.isTrustWallet
        ? window.ethereum
        : window.trustwallet
          ? window.trustwallet
          : null;

    if (!ethereum) {
      setError('Trust Wallet이 설치되어 있지 않습니다. 모바일 앱의 내장 브라우저를 사용하거나 Trust Wallet Extension을 설치해주세요.');
      window.open('https://trustwallet.com/browser-extension', '_blank');
      return;
    }

    await connectWallet(ethereum, 'Trust Wallet');
  }, [connectWallet]);

  const connectWalletConnect = useCallback(async () => {
    setError('WalletConnect는 곧 지원 예정입니다.');
  }, []);

  const disconnect = useCallback(() => {
    setAddress(null);
    setShortAddress(null);
    setWalletType(null);
    setChainId(null);
    setBalance(null);
    setProvider(null);
    setError(null);
    localStorage.removeItem('dorphin_wallet_type');
    localStorage.removeItem('dorphin_wallet_address');
  }, []);

  const switchToBSC = useCallback(async () => {
    if (!window.ethereum) return;
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x38' }],
      });
    } catch (e) {
      if (e.code === 4902) {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: '0x38',
            chainName: 'BNB Smart Chain',
            nativeCurrency: { name: 'BNB', symbol: 'BNB', decimals: 18 },
            rpcUrls: ['https://bsc-dataseed.binance.org/'],
            blockExplorerUrls: ['https://bscscan.com/'],
          }],
        });
      }
    }
  }, []);

  useEffect(() => {
    if (!window.ethereum) return;

    const handleAccountsChanged = (accounts) => {
      if (accounts.length === 0) {
        disconnect();
      } else if (accounts[0] !== address) {
        setAddress(accounts[0]);
        setShortAddress(`${accounts[0].slice(0, 6)}...${accounts[0].slice(-4)}`);
      }
    };

    const handleChainChanged = (chainIdHex) => {
      setChainId(parseInt(chainIdHex, 16));
      window.location.reload();
    };

    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', handleChainChanged);

    return () => {
      window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      window.ethereum.removeListener('chainChanged', handleChainChanged);
    };
  }, [address, disconnect]);

  useEffect(() => {
    const savedType = localStorage.getItem('dorphin_wallet_type');
    const savedAddress = localStorage.getItem('dorphin_wallet_address');

    if (savedType && savedAddress && window.ethereum) {
      window.ethereum.request({ method: 'eth_accounts' })
        .then(accounts => {
          if (accounts.includes(savedAddress)) {
            const prov = new ethers.BrowserProvider(window.ethereum);
            setAddress(savedAddress);
            setShortAddress(`${savedAddress.slice(0, 6)}...${savedAddress.slice(-4)}`);
            setWalletType(savedType);
            setProvider(prov);
            fetchBalance(savedAddress, prov);
          } else {
            localStorage.removeItem('dorphin_wallet_type');
            localStorage.removeItem('dorphin_wallet_address');
          }
        })
        .catch(() => {});
    }
  }, [fetchBalance]);

  return (
    <WalletContext.Provider value={{
      address,
      shortAddress,
      walletType,
      chainId,
      chainName: chainId ? getChainName(chainId) : null,
      balance,
      provider,
      isConnecting,
      isConnected: !!address,
      error,
      showModal,
      setShowModal,
      connectMetaMask,
      connectTrustWallet,
      connectWalletConnect,
      disconnect,
      switchToBSC,
    }}>
      {children}
    </WalletContext.Provider>
  );
}

export const useWallet = () => useContext(WalletContext);
