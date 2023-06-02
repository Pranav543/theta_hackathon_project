import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import { ChakraProvider , ColorModeScript } from '@chakra-ui/react'
import { BrowserRouter } from "react-router-dom";
import { MetaMaskContextProvider } from './hooks/useMetamask'
import theme from './theme'
import './styles.css'

ReactDOM.render(
  <React.StrictMode>
    
    <ChakraProvider provider={theme}>
      <ColorModeScript initialColorMode={theme.config.initialColorMode} />
      <BrowserRouter>  
      <MetaMaskContextProvider>
          <App />      
      </MetaMaskContextProvider>  
      </BrowserRouter>
    </ChakraProvider>
  </React.StrictMode>,
  document.getElementById('root')
);

