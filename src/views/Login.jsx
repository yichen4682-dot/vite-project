import { useState } from "react";
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE;

function Login({ setIsAuth, onLoginSuccess }) {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    try {
      // ✅ 正確登入 API（沒有 API_PATH）
      const res = await axios.post(
        `${API_BASE}/admin/signin`,
        formData
      );

      const { token, expired } = res.data;

      // ✅ 存 cookie
      document.cookie = `yichenToken=${token}; expires=${new Date(
        expired
      ).toUTCString()}; path=/`;

      // ✅ 設定 axios 預設 header
      axios.defaults.headers.common.Authorization = token;

      setIsAuth(true);
      setFormData((prev) => ({ ...prev, password: "" }));

      // ✅ 登入成功後載入產品
      onLoginSuccess();

    } catch (err) {
      console.error("登入失敗", err.response || err);
      alert("登入失敗，請確認帳號或密碼");
    }
  };

  return (
    <div
      className="container d-flex flex-column justify-content-center align-items-center"
      style={{ minHeight: "100vh" }}
    >
      <h2 className="mb-4">後台登入</h2>

      <form className="w-100" style={{ maxWidth: 360 }} onSubmit={onSubmit}>
        <div className="form-floating mb-3">
          <input
            type="email"
            className="form-control"
            name="username"
            placeholder="Email"
            value={formData.username}
            onChange={handleInputChange}
            required
          />
          <label>Email</label>
        </div>

        <div className="form-floating mb-3">
          <input
            type="password"
            className="form-control"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleInputChange}
            required
          />
          <label>Password</label>
        </div>

        <button type="submit" className="btn btn-primary w-100">
          登入
        </button>
      </form>
    </div>
  );
}

export default Login;
