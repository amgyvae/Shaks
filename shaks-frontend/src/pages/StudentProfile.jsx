import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";

export default function StudentProfile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      navigate("/login");
      return;
    }

    api.get("/student/profile/")
      .then(res => {
        setProfile(res.data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.response?.data?.detail || "Не удалось загрузить профиль студента");
        setLoading(false);
      });
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("username");
    localStorage.removeItem("role");
    navigate("/login");
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "100px", color: "white" }}>
        <h2>Загрузка профиля студента...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: "center", padding: "100px", color: "white" }}>
        <h2 style={{ color: "red" }}>Ошибка</h2>
        <p>{error}</p>
        <button
          onClick={() => navigate(-1)}
          style={{
            padding: "12px 30px",
            background: "#ff6b6b",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            marginTop: "20px"
          }}
        >
          Назад
        </button>
      </div>
    );
  }

  if (!profile) {
    return (
      <div style={{ textAlign: "center", padding: "100px", color: "white" }}>
        <h2>Профиль студента не найден</h2>
        <p>Создайте профиль в личном кабинете или обратитесь к администратору.</p>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0f0f0f",
      color: "#e2e8f0",
      padding: "40px 20px"
    }}>
      {/* Кнопки вверху */}
      <div style={{
        position: "fixed",
        top: "20px",
        left: "20px",
        right: "20px",
        display: "flex",
        justifyContent: "space-between",
        zIndex: 10
      }}>
        <button
          onClick={() => navigate("/")}
          style={{
            padding: "10px 20px",
            background: "#3498db",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer"
          }}
        >
          ← Главное меню
        </button>

        <button
          onClick={handleLogout}
          style={{
            padding: "10px 20px",
            background: "#e74c3c",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer"
          }}
        >
          Выйти
        </button>
      </div>

      {/* Карточка профиля */}
      <div style={{
        maxWidth: "700px",
        margin: "120px auto 40px",
        padding: "40px",
        background: "#1e1e1e",
        borderRadius: "16px",
        boxShadow: "0 10px 40px rgba(0,0,0,0.7)"
      }}>
        <h1 style={{ textAlign: "center", marginBottom: "40px" }}>Профиль студента</h1>

        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          {profile.avatar ? (
            <img
              src={`http://127.0.0.1:8000${profile.avatar}`}
              alt="Аватар студента"
              style={{
                width: "160px",
                height: "160px",
                borderRadius: "50%",
                border: "5px solid #3498db",
                objectFit: "cover",
                boxShadow: "0 0 20px rgba(52, 152, 219, 0.4)"
              }}
            />
          ) : (
            <div style={{
              width: "160px",
              height: "160px",
              borderRadius: "50%",
              background: "#2c3e50",
              margin: "0 auto",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "80px"
            }}>
              🎓
            </div>
          )}
        </div>

        <div style={{ display: "grid", gap: "24px", fontSize: "18px" }}>
          <div>
            <strong style={{ color: "#bdc3c7" }}>Имя пользователя:</strong>
            <p style={{ marginTop: "8px" }}>{profile.username}</p>
          </div>

          <div>
            <strong style={{ color: "#bdc3c7" }}>Класс / группа:</strong>
            <p style={{ marginTop: "8px" }}>{profile.grade || "Не указан"}</p>
          </div>

          <div>
            <strong style={{ color: "#bdc3c7" }}>Интересы / предметы:</strong>
            <p style={{ marginTop: "8px" }}>{profile.interests || "Не указаны"}</p>
          </div>

          <div>
            <strong style={{ color: "#bdc3c7" }}>О себе:</strong>
            <p style={{ marginTop: "8px", lineHeight: 1.6 }}>
              {profile.bio || "Нет описания"}
            </p>
          </div>

          <div>
            <strong style={{ color: "#bdc3c7" }}>Телефон:</strong>
            <p style={{ marginTop: "8px" }}>{profile.phone || "Не указан"}</p>
          </div>

          <div>
            <strong style={{ color: "#bdc3c7" }}>Дата создания:</strong>
            <p style={{ marginTop: "8px" }}>
              {new Date(profile.created_at).toLocaleString("ru-RU")}
            </p>
          </div>
        </div>

        <div style={{ textAlign: "center", marginTop: "50px" }}>
          <button
            onClick={() => alert("Редактирование профиля студента в разработке")}
            style={{
              padding: "14px 40px",
              background: "#3498db",
              color: "white",
              border: "none",
              borderRadius: "10px",
              fontSize: "18px",
              cursor: "pointer"
            }}
          >
            Редактировать профиль
          </button>
        </div>
      </div>
    </div>
  );
}