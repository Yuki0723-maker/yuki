import { useState } from 'react';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { ChildrenPage } from './pages/ChildrenPage';
import { RenrakuchoPage } from './pages/RenrakuchoPage';
import { ShidoKeikakuPage } from './pages/ShidoKeikakuPage';
import { HoikuNisshiPage } from './pages/HoikuNisshiPage';
import { useAppData } from './hooks/useAppData';

type Page = 'dashboard' | 'children' | 'renrakucho' | 'shidokeikaku' | 'hoikunisshi';

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const { data, updateData } = useAppData();

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard data={data} onNavigate={setCurrentPage} />;
      case 'children':
        return <ChildrenPage data={data} updateData={updateData} />;
      case 'renrakucho':
        return <RenrakuchoPage data={data} updateData={updateData} />;
      case 'shidokeikaku':
        return <ShidoKeikakuPage data={data} updateData={updateData} />;
      case 'hoikunisshi':
        return <HoikuNisshiPage data={data} updateData={updateData} />;
    }
  };

  return (
    <Layout currentPage={currentPage} onNavigate={setCurrentPage}>
      {renderPage()}
    </Layout>
  );
}
