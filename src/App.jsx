import { useEffect, useRef, useState } from 'react'
import axios from 'axios';

const API_BASE= import.meta.env.VITE_API_BASE;
const API_PATH= import.meta.env.VITE_API_PATH;
import "./assets/style.css";


function App() {
  const [formData , setFormData] = useState({
    username :'yichen4682@gmail.com',
    password :''
  })
  const [isAuth,setIsAuth] = useState(false)
  const [tempProduct, setTempProduct] = useState(null);
  const [products, setProducts] = useState([]);
  const handleInputChange = (e) =>{
    const { name ,value } = e.target;
    setFormData((preData)=> ({
       ...preData,
      [name] : value, 
    })) 
  };

  const getProducts = async () => {
    try {
      const response = await axios.get(`${API_BASE}/api/${API_PATH}/admin/products`)
      setProducts(response.data.products)
    } catch (error) {
      console.log(error.response)
    }
  }

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${API_BASE}/admin/signin`, formData);
      const {token ,expired} = response.data
      document.cookie = `yichenToken=${token};expires=${new Date(expired)};`;
      axios.defaults.headers.common['Authorization'] = token;
      
      getProducts();
      setIsAuth(true)

    } catch (error) {
      setIsAuth(false)
      console.log(error.response)
    }
  }
  const checkLogin = async () => {
    try {
      const token = document.cookie
      .split("; ")
      .find((row) => row.startsWith("yichenToken="))
      ?.split("=")[1];
      axios.defaults.headers.common['Authorization'] = token;
      const response = await axios.post(`${API_BASE}/api/user/check`)
      console.log(response.data)


    } catch (error) {
      console.log(error.response)
    }
    
    
  }
  return (
    <> 
    {
      !isAuth ? ( <div className='container login'>
      <h1>請先登入</h1>
      <form className="form-floating" onSubmit={(e) => onSubmit(e)}>
      <div className="form-floating mb-3">
      <input type="email" className="form-control" name="username" placeholder="name@example.com" value={formData.username} onChange={(e) => handleInputChange(e) } />
      <label htmlFor="username">Email address</label>
      </div>
      <div className="form-floating">
      <input type="password" className="form-control" name="password" placeholder="Password" value={formData.password} onChange={(e) => handleInputChange(e) } />
      <label htmlFor="password">Password</label>
      </div>
      <button type='submit' className='btn btn-primary w-100 mt-2'>登入</button>
      </form>
  </div>) : (
    <div className ='container'>
        {/* 功能按鈕 */}
        <button
        className="btn btn-danger mb-5"
        type="button"
        onClick={() => checkLogin()}
        > 確認是否登入 </button>
         <div className="container">
        <div className="row mt-2">
            <div className="col-md-6">
                <h2>產品列表</h2>
                </div>
            <table className="table">
            <thead>
                <tr>
                <th scope="col">產品名稱</th>
                <th scope="col">原價</th>
                <th scope="col">售價</th>
                <th scope="col">是否啟用</th>
                <th scope="col">查看細節</th>
                </tr>
            </thead>
            <tbody>
                {
                products.map(product => (
                <tr key= {product.id}> 
                 <th scope="row">{product.title}</th>
                 <td>{product.origin_price}</td>
                 <td>{product.price}</td>
                 <td>{product.is_enabled ? "是":"否"}</td>
                 <td><button type="button" className="btn btn-primary" onClick={() => setTempProduct(product)}>查看細節</button></td>
                 </tr>
                ))} ; 
            </tbody>
            </table>
            <div className="col-md-6">
                <h2>產品明細</h2>
                {
                  tempProduct ? (
                    <div className="card">
                    <img src={tempProduct.imageUrl} 
                    style={{ height: "300px" }}
                    className="card-img-top" alt="主圖"/>
                    <div className="card-body">
                    <h5 className="card-title">{tempProduct.title}</h5>
                    <p className="card-text">商品描述:{tempProduct.description}</p>
                    <p className="card-text">商品內容:{tempProduct.content}</p>
                    <div className="d-flex"></div>
                      <del className="text-secondary">{tempProduct.origin_price}</del>元/
                      {tempProduct.price}元
                    </div>
                    <h5 className="card-title">更多圖片</h5>
                    <div className="d-flex flex-wrap">
                      {
                      tempProduct.imagesUrl.map((url, index) => (
                        <img key = {index} 
                        src={url} 
                        style={{ height: "100px", marginRight: "5px" }}
                        alt="更多圖片"/>
                      ))}
                    </div>
                    </div>
                  ) : <p>請選擇產品</p>
                   
                }
                  
                
            </div>
        </div>
    </div>
    </div>
  )

    }
   
   </>
  );
}


export default App;
