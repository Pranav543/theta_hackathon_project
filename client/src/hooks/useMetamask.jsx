/* eslint-disable */
import { useState, useEffect, createContext, useContext, useCallback } from 'react';
import detectEthereumProvider from '@metamask/detect-provider';

import { ethers } from 'ethers';

const MetaMaskContext = createContext({});

export const MetaMaskContextProvider = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [currentAccount, setCurrentAccount] = useState(null);
  const [currentBalance, setCurrentBalance] = useState(null);
  const [currentChainId, setCurrentChainId] = useState(null);
  const [web3Provider, setWeb3Provider] = useState(null);


  const connectMetaMask = async () => {
    try {
      const provider = await detectEthereumProvider();

      if (provider) {
        // Connect to MetaMask
        await provider.request({ method: 'eth_requestAccounts' });
        setIsConnected(true);
        const web3Provider = new ethers.providers.Web3Provider(window.ethereum);
        setWeb3Provider(web3Provider);
      } else {
        console.error('MetaMask not found');
      }
    } catch (error) {
      console.error('Error connecting to MetaMask:', error);
    }
  };

  const handleAccountsChanged = (accounts) => {
    if (accounts.length === 0) {
      // MetaMask is disconnected
      setIsConnected(false);
      setCurrentAccount(null);
    } else if (accounts[0] !== currentAccount) {
      // Account changed
      setCurrentAccount(accounts[0]);
      localStorage.setItem("userLogged", accounts[0].toLowerCase());
        window.location.reload();
    }
  };

  const checkAccountChange = async () => {
    try {
      const provider = await detectEthereumProvider();

      if (provider) {
        provider.on('accountsChanged', handleAccountsChanged);
      } else {
        console.error('MetaMask not found');
      }
    } catch (error) {
      console.error('Error detecting MetaMask provider:', error);
    }
  };

  const handleChainChange = (newChainId) => {
    if (newChainId !== '0x16d') {
      // Chain changed from Theta Testnet (0x16d) to another chain
      setCurrentChainId(newChainId);
      alert('Please switch back to the Theta network to continue using this application.');
      switchNetwork();
    }
  }

  const checkChainChange = async () => {
    try {
      const provider = await detectEthereumProvider();

      if (provider) {
        provider.on('chainChanged', handleChainChange);
      } else {
        console.error('MetaMask not found');
      }
    } catch (error) {
      console.error('Error detecting MetaMask provider:', error);
    }
  };


  useEffect(() => {
    checkAccountChange();
    checkChainChange();
    getChainId();

    return () => {
      // Cleanup: Remove the 'accountsChanged' event listener
      const cleanup = async () => {
        const provider = await detectEthereumProvider();
        if (provider) {
          provider.removeListener('accountsChanged', handleAccountsChanged);
          provider.removeListener('accountsChanged', handleChainChange);
        }
      };

      cleanup();
    };
  }, []);


  const getAccountBalance = async () => {
    try {
      const provider = await detectEthereumProvider();

      if (provider && currentAccount) {
        const balance = await provider.request({
          method: 'eth_getBalance',
          params: [currentAccount, 'latest'],
        });
        const balanceInEther = ethers.utils.formatEther(balance);
        setCurrentBalance(balanceInEther);
      }
    } catch (error) {
      console.error('Error getting account balance:', error);
    }
  };

  const getChainId = async () => {
    try {
      const provider = await detectEthereumProvider();

      if (provider) {
        const chainId = await provider.request({ method: 'eth_chainId' });
        setCurrentChainId(chainId);
      }
    } catch (error) {
      console.error('Error getting chain ID:', error);
    }
  };

  const switchNetwork = async () => {
    try {
      const provider = await detectEthereumProvider();

      if (provider) {
        await provider.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0x16d' }],
        });
      } else {
        console.error('MetaMask not found');
      }
    } catch (error) {
      console.error('Error switching network:', error);
    }
  };

  useEffect(() => {
    getAccountBalance();
  }, [currentAccount]);

  return (
    <MetaMaskContext.Provider
      value={{
        currentAccount,
        currentBalance,
        currentChainId,
        isConnected,
        web3Provider,
        switchNetwork,
        connectMetaMask,
      }}
    >
      {children}
    </MetaMaskContext.Provider>
  );
};

export const useMetaMask = () => {
  const context = useContext(MetaMaskContext);
  if (context === undefined) {
    throw new Error('useMetaMask must be used within a "MetaMaskContextProvider"');
  }
  return context;
};
