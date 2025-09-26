import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { initClientLogReporter } from './utils/logReporter'

initClientLogReporter({ enabled: true })

ReactDOM.createRoot(document.getElementById('root')).render(
  React.createElement(React.StrictMode, null,
    React.createElement(App, null)
  ),
)// Force rebuild Fri Sep 26 01:15:00 EDT 2025 - Version 1.0.6 - Fix frontend URL issue
