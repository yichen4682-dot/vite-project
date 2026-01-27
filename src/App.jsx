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
  imagesUrl: [""]
};

function App() {
  const [formData, setFormData] = useState({
    username: "yichen4682@gmail.com",
    password: "",
  });
  const [isAuth, setIsAuth] = useState(false);
  const [products, setProducts] = useState([]);
  const [templateProduct, setTemplateProduct] = useState(INITIAL_TEMPLATE_DATA);
  const [modalType, setModalType] = useState("");

  const productModalRef = useRef(null);

  useEffect(() => {
    // 讀取 cookie 判斷是否已登入
    const cookieToken = document.cookie
      .split("; ")
      .find((row) => row.startsWith("yichenToken="))
      ?.split("=")[1];

    if (cookieToken) {
      axios.defaults.headers.common["Authorization"] = cookieToken;
      setIsAuth(true);
      getProducts();
    }

    // 初始化 Modal
    productModalRef.current = new bootstrap.Modal("#productModal", {
      keyboard: false,
    });
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };


  const updateProduct = async (id) =>{
   let url = `${API_BASE}/api/${API_PATH}/admin/product` 
   let method = 'post';
  
  if (modalType ==='edit') {
    url =`${API_BASE}/api/${API_PATH}/admin/product/${id}`
    method = 'put'
  }
  
 const productData = {
  data: {
    ...templateProduct,
    origin_price: Number(templateProduct.origin_price),
    price: Number(templateProduct.price),
    is_enabled: templateProduct.is_enabled ? 1 : 0,
    imagesUrl: templateProduct.imagesUrl.filter((url) => url !== ""),
  },
};


  try {
    const response = await axios[method](url,productData)
    console.log(response.data)
    getProducts();
    closeModal();
  } catch (error) {
    console.log(error.response);
  }


  }



  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${API_BASE}/admin/signin`, formData);
      const { token, expired } = response.data;
      document.cookie = `yichenToken=${token};expires=${new Date(
        expired
      ).toUTCString()};path=/`;
      axios.defaults.headers.common["Authorization"] = token;
      setIsAuth(true);
      setFormData((prev) => ({ ...prev, password: "" }));
      getProducts();
    } catch (error) {
      console.log("登入錯誤:", error.response);
      setIsAuth(false);
    }
  };

  const getProducts = async () => {
    try {
      const response = await axios.get(`${API_BASE}/api/${API_PATH}/admin/products`);
      setProducts(response.data.products);
    } catch (error) {
      console.log(error.response);
    }
  };

  const openModal = (type, product) => {
  setModalType(type);
  setTemplateProduct({
    ...INITIAL_TEMPLATE_DATA,
    ...product,
    imagesUrl: product.imagesUrl?.length ? product.imagesUrl : [""],
  });
  productModalRef.current.show();
};

  const closeModal = () => productModalRef.current.hide();

  const handleProductChange = (e) => {
    const { name, value, type, checked } = e.target;
    setTemplateProduct((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleModalImageChange = (index, value) => {
    setTemplateProduct((prev) => {
      const newImages = [...prev.imagesUrl];
      newImages[index] = value;

      // 自動新增空白欄位（最多 5 張）
      if (value !== "" && index === newImages.length - 1 && newImages.length < 5) {
        newImages.push("");
      }

      // 自動刪除最後空白欄位
      if (value === "" && index === newImages.length - 2 && newImages[newImages.length - 1] === "") {
        newImages.pop();
      }

      return { ...prev, imagesUrl: newImages };
    });
  };

  const deleteProduct = async (id) => {
  try {
    await axios.delete(
      `${API_BASE}/api/${API_PATH}/admin/product/${id}`
    );
    getProducts();
    closeModal();
  } catch (error) {
    console.log(error.response);
  }
};


  const addImageField = () => {
    setTemplateProduct((prev) => {
      if (prev.imagesUrl.length >= 5) return prev;
      return { ...prev, imagesUrl: [...prev.imagesUrl, ""] };
    });
  };

  const removeImageField = (index) => {
    setTemplateProduct((prev) => {
      const newImages = [...prev.imagesUrl];
      newImages.splice(index, 1);
      return { ...prev, imagesUrl: newImages };
    });
  };

  return (
    <>
      {!isAuth ? (
        <div className="container login" style={{ backgroundColor: "#f5f5f5", minHeight: "100vh" }}>
          <h1>請先登入</h1>
          <form className="form-floating" onSubmit={onSubmit}>
            <div className="form-floating mb-3">
              <input
                type="email"
                className="form-control"
                name="username"
                placeholder="Email"
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
                          <button className="btn btn-outline-danger btn-sm"
                          onClick={()=>openModal('delete',product)}>
                            刪除
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

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
            <div className={`modal-header bg-${modalType === 'delete'? 'danger' : 'dark'} text-white`}>
              <h5 className="modal-title">
                {modalType === "delete" ? "刪除" : 
                modalType === 'edit' ? "編輯": "新增"}產品
              </h5>
              <button type="button" className="btn-close" onClick={closeModal}></button>
            </div>
            <div className="modal-body">
              {
                modalType ==='delete'? (
                 <p className="fs-4">
	  確定要刪除
	  <span className="text-danger">{templateProduct.title}</span>嗎？
	</p> 
                ):(
<div className="row">
                <div className="col-sm-4 mb-3">
                  <label className="form-label">
                    主圖網址
                  </label>
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

                  {templateProduct.imagesUrl.map((url, index) => (
                    <div key={index} className="mb-2">
                      <input
                        type="text"
                        className="form-control mb-1"
                        value={url}
                        onChange={(e) => handleModalImageChange(index, e.target.value)}
                      />
                      {url && <img src={url} alt={`副圖${index + 1}`} className="img-fluid mb-1" />}
                      <button
                        className="btn btn-outline-danger btn-sm w-100 mb-1"
                        onClick={() => removeImageField(index)}
                        type="button"
                      >
                        刪除圖片
                      </button>
                    </div>
                  ))}

                  <button
                    className="btn btn-outline-primary btn-sm w-100"
                    onClick={addImageField}
                    type="button"
                  >
                    新增圖片
                  </button>
                </div>

                <div className="col-sm-8">
                  <div className="mb-3">
                    <label className="form-label">標題</label>
                    <input
                      type="text"
                      className="form-control"
                      name="title"
                      value={templateProduct.title}
                      onChange={handleProductChange}
                      placeholder="請輸入標題"
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
                        placeholder="請輸入分類"
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
                        placeholder="請輸入單位"
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
                        placeholder="請輸入原價"
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
                        placeholder="請輸入售價"
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
                      placeholder="請輸入產品描述"
                    ></textarea>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">說明內容</label>
                    <textarea
                      className="form-control"
                      name="content"
                      value={templateProduct.content}
                      onChange={handleProductChange}
                      placeholder="請輸入說明內容"
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

                )
              }
              
            </div>
            <div className="modal-footer">
              <button
                className="btn btn-outline-secondary"
                onClick={closeModal}
                type="button"
              >
                取消
              </button>
            <button
  className={`btn btn-${modalType === "delete" ? "danger" : "primary"}`}
  type="button"
  onClick={() => {
    if (modalType === "delete") {
      deleteProduct(templateProduct.id);
    } else {
      updateProduct(templateProduct.id);
    }
  }}
>
  確認
</button>

            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default App;
