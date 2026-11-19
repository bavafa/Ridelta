import { Route, Routes } from 'react-router-dom';
import Layout from './Layout';
import Landing from './pages/Landing';
import Prove from './pages/Prove';
import Sponsor from './pages/Sponsor';
import Target from './pages/Target';

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/target" element={<Target />} />
        <Route path="/sponsor" element={<Sponsor />} />
        <Route path="/prove" element={<Prove />} />
        <Route path="*" element={<Landing />} />
      </Routes>
    </Layout>
  );
}
