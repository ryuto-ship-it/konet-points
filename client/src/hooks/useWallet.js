import { useState, useCallback } from 'react';

export function useWallet() {
  const [address, setAddress] = useState(null);
  const [walletType, setWalletType] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState(null);

  const connectMetaMask = useCallback(async () => {
    if (!window.ethereum) {
      setError('MetaMask가 설치되어 있지 않습니다.');
      return;
    }
    try {
      setIsConnecting(true);
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      setAddress(accounts[0]);
      setWalletType('MetaMask');
      setError(null);
    } catch {
      setError('연결 거부됨');
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const connectTrustWallet = useCallback(async () => {
    if (!window.ethereum?.isTrust && !window.trustwallet) {
      setError('Trust Wallet이 설치되어 있지 않습니다.');
      return;
    }
    try {
      setIsConnecting(true);
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      setAddress(accounts[0]);
      setWalletType('Trust Wallet');
      setError(null);
    } catch {
      setError('연결 거부됨');
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    setAddress(null);
    setWalletType(null);
    setError(null);
  }, []);

  const shortAddress = address ? `${address.slice(0, 6)}...${address.slice(-4)}` : null;

  return {
    address,
    shortAddress,
    walletType,
    isConnecting,
    error,
    isConnected: !!address,
    connectMetaMask,
    connectTrustWallet,
    disconnect,
  };
}
