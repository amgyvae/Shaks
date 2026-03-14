import { useState } from "react";
import axios from "axios";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setError("");
    setLoading(true);

    try {
      const res = await axios.post("http://127.0.0.1:8000/api/auth/token/", {
        username,
        password,
      });

      console.log("Получен токен:", res.data.access);
      localStorage.setItem("access_token", res.data.access);
      localStorage.setItem("username", username);

      // Редирект на главную (можно изменить на /teacher/profile или /student/profile)
      window.location.href = "/";

    } catch (err) {
      setLoading(false);

      if (err.response) {
        const status = err.response.status;
        if (status === 400 || status === 401) {
          setError("Неверный логин или пароль");
        } else if (status === 403) {
          setError("Доступ запрещён. Попробуйте войти снова.");
        } else {
          setError(`Ошибка сервера (${status})`);
        }
      } else if (err.request) {
        setError("Нет ответа от сервера. Проверьте интернет.");
      } else {
        setError("Произошла неизвестная ошибка");
      }
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !loading) {
      handleLogin();
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
    >
      <div
        style={{
          background: "rgba(30, 30, 46, 0.92)",
          backdropFilter: "blur(12px)",
          borderRadius: "20px",
          padding: "50px 40px",
          width: "100%",
          maxWidth: "420px",
          boxShadow: "0 20px 60px rgba(0, 0, 0, 0.7)",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          color: "#e2e8f0",
        }}
      >
        <h1
          style={{
            textAlign: "center",
            marginBottom: "40px",
            fontSize: "32px",
            fontWeight: 700,
            color: "#60a5fa",
            letterSpacing: "1px",
          }}
        >
          Вход
        </h1>

        {/* Поле username */}
        <div style={{ marginBottom: "24px" }}>
          <input
            type="text"
            placeholder="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onKeyDown={handleKeyDown}
            style={{
              width: "100%",
              padding: "14px 16px",
              background: "#1e1e2e",
              border: "1px solid #3b4261",
              borderRadius: "10px",
              color: "white",
              fontSize: "16px",
              outline: "none",
              transition: "border-color 0.3s, box-shadow 0.3s",
              boxShadow: "0 0 0 0 rgba(96, 165, 250, 0)",
            }}
            onFocus={(e) => {
              e.target.style.borderColor = "#60a5fa";
              e.target.style.boxShadow = "0 0 0 3px rgba(96, 165, 250, 0.3)";
            }}
            onBlur={(e) => {
              e.target.style.borderColor = "#3b4261";
              e.target.style.boxShadow = "0 0 0 0 rgba(96, 165, 250, 0)";
            }}
          />
        </div>

        {/* Поле password */}
        <div style={{ marginBottom: "32px" }}>
          <input
            type="password"
            placeholder="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={handleKeyDown}
            style={{
              width: "100%",
              padding: "14px 16px",
              background: "#1e1e2e",
              border: "1px solid #3b4261",
              borderRadius: "10px",
              color: "white",
              fontSize: "16px",
              outline: "none",
              transition: "border-color 0.3s, box-shadow 0.3s",
              boxShadow: "0 0 0 0 rgba(96, 165, 250, 0)",
            }}
            onFocus={(e) => {
              e.target.style.borderColor = "#60a5fa";
              e.target.style.boxShadow = "0 0 0 3px rgba(96, 165, 250, 0.3)";
            }}
            onBlur={(e) => {
              e.target.style.borderColor = "#3b4261";
              e.target.style.boxShadow = "0 0 0 0 rgba(96, 165, 250, 0)";
            }}
          />
        </div>

        {/* Ошибка */}
        {error && (
          <div
            style={{
              background: "rgba(239, 68, 68, 0.15)",
              border: "1px solid #ef4444",
              color: "#fecaca",
              padding: "14px 16px",
              borderRadius: "10px",
              marginBottom: "24px",
              textAlign: "center",
              fontSize: "15px",
              fontWeight: 500,
            }}
          >
            {error}
          </div>
        )}

        {/* Кнопка Войти */}
        <button
          onClick={handleLogin}
          disabled={loading}
          style={{
            width: "100%",
            padding: "14px",
            background: loading ? "#4a6b4a" : "#10b981",
            color: "white",
            border: "none",
            borderRadius: "10px",
            fontSize: "17px",
            fontWeight: 600,
            cursor: loading ? "not-allowed" : "pointer",
            transition: "all 0.3s",
            boxShadow: loading ? "none" : "0 6px 20px rgba(16, 185, 129, 0.3)",
            transform: loading ? "scale(0.98)" : "scale(1)",
          }}
        >
          {loading ? "Входим..." : "Войти"}
        </button>

        {/* Ссылка на регистрацию */}
        <p style={{
          textAlign: "center",
          marginTop: "28px",
          color: "#94a3b8",
          fontSize: "15px"
        }}>
          Нет аккаунта?{" "}
          <a
            href="/register"
            style={{
              color: "#60a5fa",
              textDecoration: "none",
              fontWeight: 500,
              transition: "color 0.2s"
            }}
            onMouseOver={(e) => e.target.style.color = "#3b82f6"}
            onMouseOut={(e) => e.target.style.color = "#60a5fa"}
          >
            Зарегистрироваться
          </a>
        </p>
      </div>
    </div>
  );
}