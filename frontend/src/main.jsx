import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './leafletIconFix'
import App from './App.jsx'
import 'maplibre-gl/dist/maplibre-gl.css';
import { GoogleOAuthProvider } from '@react-oauth/google'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GoogleOAuthProvider clientId="1067477128562-hvge14a7q78to4n3l7pksi1cuvv70rnr.apps.googleusercontent.com">
      <App />
    </GoogleOAuthProvider>
  </StrictMode>,
)