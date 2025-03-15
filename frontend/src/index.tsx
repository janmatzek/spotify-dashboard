import './css/index.css'

import React from 'react'
import ReactDOM from 'react-dom/client'
import { ChakraProvider } from '@chakra-ui/react'
import App from './App'

const root_element: HTMLElement | null = document.getElementById('root')

if (!root_element) {
    throw new Error('Root element not found')
}

const root = ReactDOM.createRoot(root_element)
root.render(
    <React.StrictMode>
        <ChakraProvider>
            <App />
        </ChakraProvider>
    </React.StrictMode>
)
