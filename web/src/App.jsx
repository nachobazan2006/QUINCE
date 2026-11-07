import { Route, Routes } from 'react-router';
import Layout from './components/layout/Layout.jsx';
import HomePage from './pages/HomePage.jsx';
import CategoryPage from './pages/CategoryPage.jsx';
import PaginaDetalleProducto from './pages/PaginaDetalleProducto.jsx';
import PaginaNosotros from './pages/PaginaNosotros.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';

export default function App() {
  return <Routes>
    <Route element={<Layout />}>
      <Route index element={<HomePage />} />
      <Route path="nosotros" element={<PaginaNosotros />} />
      <Route path="productos/:slug" element={<PaginaDetalleProducto />} />
      <Route path=":categorySlug" element={<CategoryPage />} />
      <Route path=":categorySlug/:subcategorySlug" element={<CategoryPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Route>
  </Routes>;
}
