import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';

// Dev tools
import Base64Tool from './pages/Base64Tool';
import UrlTool from './pages/UrlTool';
import JsonTool from './pages/JsonTool';
import JwtTool from './pages/JwtTool';
import HtmlEntityTool from './pages/HtmlEntityTool';

// File tools
import ImageConverterTool from './pages/ImageConverterTool';
import PdfTool from './pages/PdfTool';
import ResizeCompressTool from './pages/ResizeCompressTool';
import HomePage from './pages/HomePage';

function App() {
    return (
        <Router basename="/ConvertMaster">
            <Layout>
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/base64" element={<Base64Tool />} />
                    <Route path="/url" element={<UrlTool />} />
                    <Route path="/json" element={<JsonTool />} />
                    <Route path="/jwt" element={<JwtTool />} />
                    <Route path="/html" element={<HtmlEntityTool />} />
                    <Route path="/image-converter" element={<ImageConverterTool />} />
                    <Route path="/pdf-tools" element={<PdfTool />} />
                    <Route path="/resize-compress" element={<ResizeCompressTool />} />
                </Routes>
            </Layout>
        </Router>
    );
}

export default App;
