import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { initClientLogReporter } from './utils/logReporter'

initClientLogReporter({ enabled: true })

ReactDOM.createRoot(document.getElementById('root')).render(
  React.createElement(React.StrictMode, null,
    React.createElement(App, null)
  ),
)// Force rebuild Fri Sep 26 01:00:00 EDT 2025 - Version 1.0.5 - Force main URL update
