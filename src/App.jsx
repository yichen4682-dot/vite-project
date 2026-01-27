import { useEffect, useRef, useState } from "react";
import axios from "axios";
import * as bootstrap from "bootstrap";
import "./assets/style.css";
import ProductModal from "./components/ProductModal";
import Pagination from "./components/Pagination";
import Login from "./views/Login";

const API_BASE = import.meta.env.VITE_API_BASE;
const API_PATH = import.meta.env.VITE_API_PATH;

const INITIAL_TEMPLATE_DATA = {
  id: "",
  title: "",
  category: "",
  origin_price: "",
  price: "",
  unit: "",
  description: "",
  content: "",
  is_enabled: false,
  imageUrl: "",
  imagesUrl: [""],
};

function App() {
  const [isAuth, setIsAuth] = useState(false);
  const [products, setProducts] = useState([]);
  const [templateProduct, setTemplateProduct] = useState(INITIAL_TEMPLATE_DATA);
  const [modalType, setModalType] = useState("");
  const [pagination, setPagination] = useState({});
  const productModalRef = useRef(null);

  /* ---------- 初始化 ---------- */
  useEffect(() => {
    const token = document.cookie
      .split("; ")
      .find((row) => row.startsWith("yichenToken="))
      ?.split("=")[1];

    if (token) {
      axios.defaults.headers.common.Authorization = token;
      setIsAuth(true);
      getProducts();
    }

    productModalRef.current = new bootstrap.Modal(
      document.getElementById("productModal"),
      { keyboard: false }
    );
  }, []);

  /* ---------- 取得產品 ---------- */
  const getProducts = async (page = 1) => {
    try {
      const res = await axios.get(
        `${API_BASE}/api/${API_PATH}/admin/products?page=${page}`
      );
      setProducts(res.data.products);
      setPagination(res.data.pagination);
    } catch (err) {
      console.error(err.response || err);
    }
  };

  /* ---------- 新增 / 編輯 ---------- */
  const updateProduct = async (id) => {
    let url = `${API_BASE}/api/${API_PATH}/admin/product`;
    let method = "post";

    if (modalType === "edit") {
      url = `${API_BASE}/api/${API_PATH}/admin/product/${id}`;
      method = "put";
    }

    const payload = {
      data: {
        ...templateProduct,
        origin_price: Number(templateProduct.origin_price),
        price: Number(templateProduct.price),
        is_enabled: templateProduct.is_enabled ? 1 : 0,
        imagesUrl: templateProduct.imagesUrl.filter((url) => url !== ""),
      },
    };

    try {
      await axios[method](url, payload);
      getProducts();
      closeModal();
    } catch (err) {
      console.error(err.response || err);
    }
  };

  /* ---------- 刪除 ---------- */
  const deleteProduct = async (id) => {
    try {
      await axios.delete(
        `${API_BASE}/api/${API_PATH}/admin/product/${id}`
      );
      getProducts();
      closeModal();
    } catch (err) {
      console.error(err.response || err);
    }
  };

  /* ---------- 上傳圖片（已修正版） ---------- */
  const uploadImage = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await axios.post(
        `${API_BASE}/api/${API_PATH}/admin/upload`,
        formData
      );

      const imageUrl =
        res.data.imageUrl || res.data?.data?.imageUrl;

      if (!imageUrl) {
        console.error("上傳成功但找不到 imageUrl", res.data);
        return;
      }

      setTemplateProduct((prev) => ({
        ...prev,
        imageUrl,
      }));
    } catch (err) {
      console.error("圖片上傳失敗", err.response || err);
    }
  };

  /* ---------- Modal ---------- */
  const openModal = (type, product) => {
    setModalType(type);
    setTemplateProduct({
      ...INITIAL_TEMPLATE_DATA,
      ...product,
      imagesUrl: product?.imagesUrl?.length ? product.imagesUrl : [""],
    });
    productModalRef.current.show();
  };

  const closeModal = () => productModalRef.current.hide();

  /* ---------- 表單處理 ---------- */
  const handleProductChange = (e) => {
    const { name, value, type, checked } = e.target;
    setTemplateProduct((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleModalImageChange = (index, value) => {
    setTemplateProduct((prev) => {
      const images = [...prev.imagesUrl];
      images[index] = value;

      if (value && index === images.length - 1 && images.length < 5) {
        images.push("");
      }

      if (!value && images[images.length - 1] === "" && images.length > 1) {
        images.pop();
      }

      return { ...prev, imagesUrl: images };
    });
  };

  const addImageField = () => {
    setTemplateProduct((prev) =>
      prev.imagesUrl.length >= 5
        ? prev
        : { ...prev, imagesUrl: [...prev.imagesUrl, ""] }
    );
  };

  const removeImageField = (index) => {
    setTemplateProduct((prev) => {
      const images = [...prev.imagesUrl];
      images.splice(index, 1);
      return { ...prev, imagesUrl: images };
    });
  };

  /* ---------- Render ---------- */
  return (
    <>
      {!isAuth ? (
        <Login
        setIsAuth={setIsAuth}
        onLoginSuccess={getProducts}
        />

      ) : (
        <div className="container mt-4">
          <h2>產品列表</h2>

          <div className="text-end mb-3">
            <button
              className="btn btn-primary"
              onClick={() => openModal("create", INITIAL_TEMPLATE_DATA)}
            >
              建立新產品
            </button>
          </div>

          <table className="table">
            <thead>
              <tr>
                <th>分類</th>
                <th>名稱</th>
                <th>原價</th>
                <th>售價</th>
                <th>狀態</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id}>
                  <td>{p.category}</td>
                  <td>{p.title}</td>
                  <td>{p.origin_price}</td>
                  <td>{p.price}</td>
                  <td className={p.is_enabled ? "text-success" : ""}>
                    {p.is_enabled ? "啟用" : "未啟用"}
                  </td>
                  <td>
                    <div className="btn-group">
                      <button
                        className="btn btn-outline-primary btn-sm"
                        onClick={() => openModal("edit", p)}
                      >
                        編輯
                      </button>
                      <button
                        className="btn btn-outline-danger btn-sm"
                        onClick={() => openModal("delete", p)}
                      >
                        刪除
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <Pagination pagination={pagination} onChange={getProducts} />
        </div>
      )}

      <ProductModal
        modalType={modalType}
        templateProduct={templateProduct}
        handleProductChange={handleProductChange}
        handleModalImageChange={handleModalImageChange}
        addImageField={addImageField}
        removeImageField={removeImageField}
        updateProduct={updateProduct}
        deleteProduct={deleteProduct}
        closeModal={closeModal}
        uploadImage={uploadImage}
      />
    </>
  );
}

export default App;
