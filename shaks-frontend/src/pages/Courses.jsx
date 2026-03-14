import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getCourses } from "../api/courses";

function Courses() {
  const [courses, setCourses] = useState([]);
  const [user, setUser] = useState(null); // { username, role, token? }
  const navigate = useNavigate();

  // Проверяем, залогинен ли пользователь
  useEffect(() => {
    const token = localStorage.getItem("access_token") || localStorage.getItem("token");
    const username = localStorage.getItem("username"); // если сохраняешь при логине

    if (token) {
      setUser({
        username: username || "Пользователь", // можно потом брать из /api/me/
        isAuthenticated: true,
      });
    } else {
      setUser(null);
    }
  }, []);

  // Загрузка курсов
  useEffect(() => {
    getCourses()
      .then((res) => setCourses(res.data))
      .catch((err) => console.error("Ошибка загрузки курсов:", err));
  }, []);

  // Выход из аккаунта
  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("token");
    localStorage.removeItem("username"); // если сохранял
    setUser(null);
    navigate("/login");
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0d1117", color: "#c9d1d9" }}>
      {/* Шапка */}
      <header
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          background: "#161b22",
          padding: "12px 40px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: "1px solid #30363d",
          zIndex: 1000,
        }}
      >
        <Link to="/" style={{ textDecoration: "none", color: "#58a6ff", fontSize: "22px", fontWeight: "bold" }}>
          LMS Platform
        </Link>

        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          {user && user.isAuthenticated ? (
            <>
              {/* Имя пользователя */}
              <span style={{ color: "#8b949e", fontSize: "16px" }}>
                {user.username} {user.role && `(${user.role})`}
              </span>

              {/* Кнопка Профиль */}
              <button
                onClick={() => {
                    if (user.role === "student") {
                      navigate("/student/profile");
                    } else if (user.role === "teacher") {
                      navigate("/teacher/profile");
                    } else {
                      navigate("/student/profile"); // для админа или других
                    }
                  }}
                style={{
                  padding: "8px 16px",
                  background: "#238636",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "14px",
                }}
              >
                Профиль
              </button>

              {/* Кнопка Выйти */}
              <button
                onClick={handleLogout}
                style={{
                  padding: "8px 16px",
                  background: "#c94a4a",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "14px",
                }}
              >
                Выйти
              </button>
            </>
          ) : (
            /* Кнопка Войти, если не авторизован */
            <button
              onClick={() => navigate("/login")}
              style={{
                padding: "8px 20px",
                background: "#238636",
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "16px",
                fontWeight: "500",
              }}
            >
              Войти
            </button>
          )}
        </div>
      </header>

      {/* Основной контент */}
      <main style={{ padding: "100px 40px 40px" }}>
        <h1 style={{ textAlign: "center", marginBottom: "60px", fontSize: "48px", color: "#58a6ff" }}>
          Courses
        </h1>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "30px" }}>
          {courses.map((course) => (
            <Link
              key={course.id}
              to={`/courses/${course.id}`}
              style={{
                textDecoration: "none",
                color: "inherit",
                background: "#161b22",
                border: "1px solid #30363d",
                borderRadius: "12px",
                padding: "24px",
                transition: "all 0.2s",
                cursor: "pointer",
              }}
              onMouseOver={(e) => (e.currentTarget.style.borderColor = "#58a6ff")}
              onMouseOut={(e) => (e.currentTarget.style.borderColor = "#30363d")}
            >
              <h2 style={{ margin: "0 0 12px", color: "#58a6ff", fontSize: "24px" }}>{course.title}</h2>
              <p style={{ margin: 0, color: "#8b949e", lineHeight: 1.5 }}>{course.description}</p>
            </Link>
          ))}
        </div>

        {courses.length === 0 && (
          <p style={{ textAlign: "center", color: "#8b949e", fontSize: "20px", marginTop: "60px" }}>
            Курсы пока отсутствуют
          </p>
        )}
      </main>
    </div>
  );
}

export default Courses;