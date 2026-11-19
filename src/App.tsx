import { Route, Routes } from 'react-router-dom';
import Layout from './Layout';
import Landing from './pages/Landing';
import Sponsor from './pages/Sponsor';
import Target from './pages/Target';
import { ModulePage } from './pages/Module';

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/target" element={<Target />} />
        <Route path="/sponsor" element={<Sponsor />} />
        <Route path="/prove" element={<ModulePage i={2} />} />
        <Route path="*" element={<Landing />} />
      </Routes>
    </Layout>
  );
}
