import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import 'bootstrap/dist/css/bootstrap.min.css'
import '@fontsource/montserrat/600.css'
import '@fontsource/montserrat/700.css'
import '@fontsource/montserrat/800.css'
import '@fontsource/lato/400.css'
import '@fontsource/lato/700.css'
import './styles/theme.css'
import './styles/layout.css'
import './styles/components.css'
import './styles/pages.css'
import './styles/admin.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <BrowserRouter><App /></BrowserRouter>,
)
