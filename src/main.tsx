import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { AuthProvider, EquipeProvider } from './contexts/AuthContext';
import { ConfigProvider } from './contexts/ConfigContext';
import { InventaireProvider } from './providers/InventaireProvider';
import { CatalogueProvider } from './providers/CatalogueProvider';
import { NettoyageProvider } from './providers/NettoyageProvider';
import { TemperaturesProvider } from './providers/TemperaturesProvider';
import { HuilesProvider } from './providers/HuilesProvider';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ConfigProvider>
      <CatalogueProvider>
        <NettoyageProvider>
          <TemperaturesProvider>
            <HuilesProvider>
              <AuthProvider>
                <InventaireProvider>
                  <App />
                </InventaireProvider>
              </AuthProvider>
            </HuilesProvider>
          </TemperaturesProvider>
        </NettoyageProvider>
      </CatalogueProvider>
    </ConfigProvider>
  </StrictMode>,
);
