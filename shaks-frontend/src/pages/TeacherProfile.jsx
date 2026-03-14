import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // ← добавь это, если используешь react-router
import axios from "axios";

export default function TeacherProfile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate(); // ← для перехода на главную

  useEffect(() => {
    const token = localStorage.getItem("access_token") || localStorage.getItem("token");

    if (!token) {
      setError("Токен не найден. Пожалуйста, войдите в систему.");
      setLoading(false);
      return;
    }

    axios
      .get("http://127.0.0.1:8000/api/teacher/profile/", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setProfile(res.data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.response?.data?.detail || "Ошибка загрузки профиля");
        setLoading(false);
      });
  }, []);

  // Функция выхода
  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("token");
    navigate("/login"); // ← или куда у тебя страница логина
    // или window.location.href = "/login";
  };

  if (loading) return <div style={{ textAlign: "center", padding: "100px", color: "white" }}>Загрузка...</div>;

  if (error) {
    return (
      <div style={{ textAlign: "center", padding: "100px", color: "white" }}>
        <h2 style={{ color: "red" }}>Ошибка</h2>
        <p>{error}</p>
        <button
          onClick={() => window.location.reload()}
          style={{
            marginTop: "20px",
            padding: "12px 30px",
            background: "#e74c3c",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
          }}
        >
          Попробовать снова
        </button>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0f0f0f",
        color: "white",
        fontFamily: "system-ui, sans-serif",
        position: "relative",
      }}
    >
      {/* Кнопка "Главное меню" — слева сверху */}
      <button
        onClick={() => navigate("/")} // ← или "/dashboard", "/home" — куда тебе нужно
        style={{
          position: "absolute",
          top: "20px",
          left: "20px",
          padding: "10px 20px",
          background: "#3498db",
          color: "white",
          border: "none",
          borderRadius: "8px",
          fontSize: "16px",
          cursor: "pointer",
          boxShadow: "0 4px 12px rgba(52, 152, 219, 0.3)",
          zIndex: 10,
        }}
      >
        ← Главное меню
      </button>

      {/* Кнопка "Выйти" — справа сверху */}
      <button
        onClick={handleLogout}
        style={{
          position: "absolute",
          top: "20px",
          right: "20px",
          padding: "10px 20px",
          background: "#e74c3c",
          color: "white",
          border: "none",
          borderRadius: "8px",
          fontSize: "16px",
          cursor: "pointer",
          boxShadow: "0 4px 12px rgba(231, 76, 60, 0.3)",
          zIndex: 10,
        }}
      >
        Выйти
      </button>

      {/* Основной контент профиля */}
      <div
        style={{
          maxWidth: "700px",
          margin: "100px auto 40px",
          padding: "40px",
          background: "#1e1e1e",
          borderRadius: "16px",
          boxShadow: "0 10px 40px rgba(0,0,0,0.7)",
        }}
      >
        <h1 style={{ textAlign: "center", marginBottom: "40px" }}>Профиль преподавателя</h1>

        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          {profile.avatar ? (
            <img
              src={`http://127.0.0.1:8000${profile.avatar}`}
              alt="Аватар"
              style={{
                width: "160px",
                height: "160px",
                borderRadius: "50%",
                border: "5px solid #3498db",
                objectFit: "cover",
              }}
            />
          ) : (
            <div
              style={{
                width: "160px",
                height: "160px",
                borderRadius: "50%",
                background: "#2c3e50",
                margin: "0 auto",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "80px",
              }}
            >
              👨‍🏫
            </div>
          )}
        </div>

        <div style={{ display: "grid", gap: "24px", fontSize: "18px" }}>
          <div>
            <strong style={{ color: "#bdc3c7" }}>Имя пользователя:</strong>
            <div style={{ marginTop: "8px" }}>{profile.username}</div>
          </div>

          <div>
            <strong style={{ color: "#bdc3c7" }}>Опыт преподавания:</strong>
            <div style={{ marginTop: "8px" }}>{profile.experience_years} лет</div>
          </div>

          <div>
            <strong style={{ color: "#bdc3c7" }}>Специализация:</strong>
            <div style={{ marginTop: "8px" }}>{profile.specialization || "Не указана"}</div>
          </div>

          <div>
            <strong style={{ color: "#bdc3c7" }}>О себе:</strong>
            <div style={{ marginTop: "8px", lineHeight: 1.6 }}>
              {profile.bio || "Нет описания"}
            </div>
          </div>

          <div>
            <strong style={{ color: "#bdc3c7" }}>Дата создания:</strong>
            <div style={{ marginTop: "8px" }}>
              {new Date(profile.created_at).toLocaleString("ru-RU")}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}