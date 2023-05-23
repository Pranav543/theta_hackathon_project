import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import { ChakraProvider , ColorModeScript } from '@chakra-ui/react'
import { BrowserRouter } from "react-router-dom";
import theme from './theme'
import './styles.css'


ReactDOM.render(
  <React.StrictMode>
    
    <ChakraProvider provider={theme}>
      <ColorModeScript initialColorMode={theme.config.initialColorMode} />
      <BrowserRouter>    
          <App />      
      </BrowserRouter>
    </ChakraProvider>
  </React.StrictMode>,
  document.getElementById('root')
);

