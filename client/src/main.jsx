import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { BrowserRouter } from "react-router-dom"
import './index.css'
import App from './App'
import store from "./redux/store"

// Mount the React app into the root DOM element
createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* Provide Redux store to the entire app */}
    <Provider store ={store}>
      {/* Enable client-side routing for the app */}
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Provider>
  </StrictMode>,
);