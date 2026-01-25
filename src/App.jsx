import { useEffect, useRef, useState } from "react";
import axios from "axios";
import * as bootstrap from "bootstrap";

import "./assets/style.css";

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
  imagesUrl: [],
};

function App() {
  const [formData, setFormData] = useState({
    username: "yichen4682@gmail.com",
    password: "",
  });
  const [isAuth, setIsAuth] = useState(false);
  const [templateProduct, setTemplateProduct] = useState(INITIAL_TEMPLATE_DATA);
  const [products, setProducts] = useState([]);
  const [modalType, setModalType] = useState("");

  const productModalRef = useRef(null);

  // 登入表單 input 變更
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((preData) => ({
      ...preData,
      [name]: value,
    }));
  };

  // Modal 表單 input 變更
  const handleProductChange = (e) => {
    const { name, value, type, checked } = e.target;
    setTemplateProduct((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // 取得產品列表
  const getProducts = async () => {
    try {
      const response = await axios.get(`${API_BASE}/api/${API_PATH}/admin/products`);
      setProducts(response.data.products);
    } catch (error) {
      console.log(error.response);
    }
  };

  // 登入
  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${API_BASE}/admin/signin`, formData);
      const { token, expired } = response.data;
      document.cookie = `yichenToken=${token};expires=${new Date(expired)};path=/`;
      axios.defaults.headers.common["Authorization"] = token;

      setIsAuth(true);
      getProducts();
    } catch (error) {
      setIsAuth(false);
      console.log(error.response);
    }
  };

  // 初始化
  useEffect(() => {
    const token = document.cookie
      .split("; ")
      .find((row) => row.startsWith("yichenToken="))
      ?.split("=")[1];
    if (token) {
      axios.defaults.headers.common["Authorization"] = token;
      setIsAuth(true);
      getProducts();
    }

    productModalRef.current = new bootstrap.Modal("#productModal", {
      keyboard: false,
    });
  }, []);

  // 開啟 Modal
  const openModal = (type, product) => {
    setModalType(type);
    setTemplateProduct(product);
    productModalRef.current.show();
  };

  // 關閉 Modal
  const closeModal = () => {
    productModalRef.current.hide();
  };

  return (
    <>
      {!isAuth ? (
        <div className="container login">
          <h1>請先登入</h1>
          <form className="form-floating" onSubmit={onSubmit}>
            <div className="form-floating mb-3">
              <input
                type="email"
                className="form-control"
                name="username"
                placeholder="name@example.com"
                value={formData.username}
                onChange={handleInputChange}
              />
              <label htmlFor="username">Email address</label>
            </div>
            <div className="form-floating mb-3">
              <input
                type="password"
                className="form-control"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleInputChange}
              />
              <label htmlFor="password">Password</label>
            </div>
            <button type="submit" className="btn btn-primary w-100 mt-2">
              登入
            </button>
          </form>
        </div>
      ) : (
        <div className="container mt-3">
          <div className="row">
            {/* 左邊產品列表 */}
            <div className="col-md-6">
              <h2>產品列表</h2>
              <div className="text-end mt-3 mb-3">
                <button
                  className="btn btn-primary"
                  onClick={() => openModal("create", INITIAL_TEMPLATE_DATA)}
                >
                  建立新的產品
                </button>
              </div>
              <table className="table">
                <thead>
                  <tr>
                    <th>分類</th>
                    <th>產品名稱</th>
                    <th>原價</th>
                    <th>售價</th>
                    <th>是否啟用</th>
                    <th>操作</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product.id}>
                      <td>{product.category}</td>
                      <td>{product.title}</td>
                      <td>{product.origin_price}</td>
                      <td>{product.price}</td>
                      <td className={product.is_enabled ? "text-success" : ""}>
                        {product.is_enabled ? "啟用" : "未啟用"}
                      </td>
                      <td>
                        <div className="btn-group">
                          <button
                            className="btn btn-outline-primary btn-sm"
                            onClick={() => openModal("edit", product)}
                          >
                            編輯
                          </button>
                          <button className="btn btn-outline-danger btn-sm">刪除</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 右邊產品明細 */}
            <div className="col-md-6">
              <h2>產品明細</h2>
              {templateProduct ? (
                <div className="card">
                  {templateProduct.imageUrl && (
                    <img
                      src={templateProduct.imageUrl}
                      alt="主圖"
                      className="card-img-top"
                      style={{ height: "300px", objectFit: "cover" }}
                    />
                  )}
                  <div className="card-body">
                    <h5 className="card-title">{templateProduct.title}</h5>
                    <p className="card-text">描述: {templateProduct.description}</p>
                    <p className="card-text">內容: {templateProduct.content}</p>
                    <p>
                      <del>{templateProduct.origin_price} 元</del> / {templateProduct.price} 元
                    </p>
                  </div>
                  {templateProduct.imagesUrl.length > 0 && (
                    <>
                      <h5 className="card-title">更多圖片</h5>
                      <div className="d-flex flex-wrap">
                        {templateProduct.imagesUrl.map((url, index) => (
                          <img
                            key={index}
                            src={url}
                            alt={`副圖${index + 1}`}
                            style={{ height: "100px", marginRight: "5px" }}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <p>請選擇產品</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal */}
      <div className="modal fade" id="productModal" tabIndex="-1" aria-hidden="true">
        <div className="modal-dialog modal-xl">
          <div className="modal-content border-0">
            <div className="modal-header bg-dark text-white">
              <h5 className="modal-title">
                {modalType === "edit" ? "編輯產品" : "新增產品"}
              </h5>
              <button type="button" className="btn-close" onClick={closeModal}></button>
            </div>
            <div className="modal-body">
              <div className="row">
                {/* 左側圖片 */}
                <div className="col-sm-4 mb-3">
                  <label className="form-label">主圖網址</label>
                  <input
                    type="text"
                    className="form-control mb-2"
                    name="imageUrl"
                    placeholder="請輸入圖片連結"
                    value={templateProduct.imageUrl}
                    onChange={handleProductChange}
                  />
                  {templateProduct.imageUrl && (
                    <img
                      src={templateProduct.imageUrl}
                      alt="主圖"
                      className="img-fluid mb-2"
                    />
                  )}
                  <button className="btn btn-outline-primary btn-sm w-100 mb-2">
                    新增圖片
                  </button>
                  <button className="btn btn-outline-danger btn-sm w-100">
                    刪除圖片
                  </button>
                </div>

                {/* 右側表單 */}
                <div className="col-sm-8">
                  <div className="mb-3">
                    <label className="form-label">標題</label>
                    <input
                      type="text"
                      className="form-control"
                      name="title"
                      value={templateProduct.title}
                      onChange={handleProductChange}
                    />
                  </div>
                  <div className="row">
                    <div className="mb-3 col-md-6">
                      <label className="form-label">分類</label>
                      <input
                        type="text"
                        className="form-control"
                        name="category"
                        value={templateProduct.category}
                        onChange={handleProductChange}
                      />
                    </div>
                    <div className="mb-3 col-md-6">
                      <label className="form-label">單位</label>
                      <input
                        type="text"
                        className="form-control"
                        name="unit"
                        value={templateProduct.unit}
                        onChange={handleProductChange}
                      />
                    </div>
                  </div>
                  <div className="row">
                    <div className="mb-3 col-md-6">
                      <label className="form-label">原價</label>
                      <input
                        type="number"
                        className="form-control"
                        name="origin_price"
                        value={templateProduct.origin_price}
                        onChange={handleProductChange}
                      />
                    </div>
                    <div className="mb-3 col-md-6">
                      <label className="form-label">售價</label>
                      <input
                        type="number"
                        className="form-control"
                        name="price"
                        value={templateProduct.price}
                        onChange={handleProductChange}
                      />
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">產品描述</label>
                    <textarea
                      className="form-control"
                      name="description"
                      value={templateProduct.description}
                      onChange={handleProductChange}
                    ></textarea>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">說明內容</label>
                    <textarea
                      className="form-control"
                      name="content"
                      value={templateProduct.content}
                      onChange={handleProductChange}
                    ></textarea>
                  </div>
                  <div className="form-check mb-3">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      name="is_enabled"
                      checked={templateProduct.is_enabled}
                      onChange={handleProductChange}
                    />
                    <label className="form-check-label">是否啟用</label>
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-outline-secondary" onClick={closeModal}>
                取消
              </button>
              <button className="btn btn-primary">確認</button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default App;
