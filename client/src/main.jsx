import { StrictMode } from 'react'
import ReactDom from 'react-dom/client'
import './index.css'
import './components/styles/header.css'
import './components/styles/login.css'
import './components/styles/admin.css'
import App from './components/App.jsx'
import store from './components/redux/store.jsx'

import { Provider } from 'react-redux'
const root = ReactDom.createRoot(document.getElementById('root'));
root.render(
  <Provider store ={store}>
    <App/>
  </Provider>
)