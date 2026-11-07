import { Route, Routes } from 'react-router';
import Layout from './components/layout/Layout.jsx';
import HomePage from './pages/HomePage.jsx';
import CategoryPage from './pages/CategoryPage.jsx';
import ProductPage from './pages/ProductPage.jsx';
import AboutPage from './pages/AboutPage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';

export default function App() {
  return <Routes>
    <Route element={<Layout />}>
      <Route index element={<HomePage />} />
      <Route path="nosotros" element={<AboutPage />} />
      <Route path="productos/:slug" element={<ProductPage />} />
      <Route path=":categorySlug" element={<CategoryPage />} />
      <Route path=":categorySlug/:subcategorySlug" element={<CategoryPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Route>
  </Routes>;
}
