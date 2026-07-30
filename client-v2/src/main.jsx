import { Component, StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import App from './App.jsx';
import Toaster from './components/Toaster.jsx';
import { store } from './store/index.js';
import './styles.css';

class AppErrorBoundary extends Component {
  state = { error: null };
  static getDerivedStateFromError(error) { return { error }; }
  render() {
    if (!this.state.error) return this.props.children;
    return <main className="flex min-h-screen items-center justify-center bg-night p-6 text-ivory"><section className="w-full max-w-lg rounded-2xl border border-ember/30 bg-charcoal p-8 text-center shadow-premium"><p className="text-xs font-bold uppercase tracking-[.18em] text-ember-light">Interface recovery</p><h1 className="mt-3 font-display text-4xl">Something interrupted this page.</h1><p className="mt-3 text-sm text-mist">{this.state.error.message}</p><button className="mt-6 rounded-full bg-gradient-to-r from-ember to-ember-light px-5 py-3 text-sm font-bold text-[#1b0d05]" onClick={()=>location.reload()}>Reload safely</button></section></main>;
  }
}

createRoot(document.getElementById('root')).render(
  <StrictMode><AppErrorBoundary><Provider store={store}><BrowserRouter><App /><Toaster /></BrowserRouter></Provider></AppErrorBoundary></StrictMode>
);
