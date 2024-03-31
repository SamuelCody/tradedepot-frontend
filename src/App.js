import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import Register from "./pages/Register";
import Login from "./pages/Login";
import ProductsNearMe from "./pages/Product";
import ProductUpload from "./pages/ProductUpload";
import ProductDetailPage from "./pages/ProductDetail";

function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/products" element={<ProductsNearMe />} />
          <Route path="/upload" element={<ProductUpload />} />
          <Route
            path="/product-detail/:productId"
            element={<ProductDetailPage />}
          />
        </Routes>
      </Router>
    </>
  );
}

export default App;
