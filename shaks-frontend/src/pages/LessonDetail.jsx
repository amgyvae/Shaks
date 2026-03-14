import { useParams, Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../api";

export default function LessonDetail() {
  const { lessonId } = useParams();
  const navigate = useNavigate();

  const [lesson, setLesson] = useState(null);
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [nextLesson, setNextLesson] = useState(null);
  const [prevLesson, setPrevLesson] = useState(null);

  const [answers, setAnswers] = useState({});
  const [quiz, setQuiz] = useState(null);

  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!lessonId) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Замени 3 на реальный ID существующего курса из твоей базы
        const courseId = 3;

        const courseRes = await api.get(`/courses/${courseId}/`);
        setCourse(courseRes.data);

        let allLessons = [];
        courseRes.data.modules?.forEach((mod) => {
          mod.lessons?.forEach((l) => allLessons.push(l));
        });

        const currentIndex = allLessons.findIndex((l) => l.id === Number(lessonId));
        if (currentIndex === -1) throw new Error("Урок не найден");

        setLesson(allLessons[currentIndex]);

        if (allLessons[currentIndex].quizzes?.length > 0) {
          setQuiz(allLessons[currentIndex].quizzes[0]);
        }

        if (currentIndex > 0) setPrevLesson(allLessons[currentIndex - 1]);
        if (currentIndex < allLessons.length - 1) setNextLesson(allLessons[currentIndex + 1]);

        setProgress(Math.round(((currentIndex + 1) / allLessons.length) * 100));
      } catch (err) {
        setError(err.response?.data?.detail || "Не удалось загрузить урок");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [lessonId]);

  const getYoutubeEmbed = (url) => {
    if (!url) return "";
    const videoId = url.split("v=")[1]?.split("&")[0];
    return `https://www.youtube.com/embed/${videoId}`;
  };

  const handleAnswer = (questionId, answerId) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answerId }));
  };

  const submitQuiz = () => {
    console.log("Ответы студента:", answers);
    alert("Квиз отправлен!");
  };

  if (loading) {
    return (
      <div style={{
        minHeight: "100vh",
        background: "#0f0f0f",
        color: "white",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "24px"
      }}>
        Загрузка урока...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        minHeight: "100vh",
        background: "#0f0f0f",
        color: "white",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px"
      }}>
        <h2 style={{ color: "#ff6b6b", marginBottom: "20px" }}>Ошибка</h2>
        <p style={{ maxWidth: "500px", textAlign: "center", marginBottom: "30px" }}>{error}</p>
        <button
          onClick={() => navigate(-1)}
          style={{
            padding: "14px 30px",
            background: "#e74c3c",
            color: "white",
            border: "none",
            borderRadius: "10px",
            fontSize: "18px",
            cursor: "pointer"
          }}
        >
          Назад
        </button>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0f0f0f",
      color: "#e2e8f0",
      display: "flex"
    }}>
      {/* Sidebar слева */}
      <div style={{
        width: "320px",
        background: "#161b22",
        borderRight: "1px solid #222",
        padding: "40px 20px",
        overflowY: "auto",
        height: "100vh",
        position: "fixed",
        left: 0,
        top: 0
      }}>
        <h2 style={{
          color: "#58a6ff",
          fontSize: "26px",
          marginBottom: "30px",
          textAlign: "center"
        }}>
          Модули курса
        </h2>

        {course?.modules?.map(module => (
          <div key={module.id} style={{ marginBottom: "35px" }}>
            <h3 style={{
              color: "#94a3b8",
              fontSize: "20px",
              marginBottom: "15px"
            }}>
              {module.title}
            </h3>

            {module.lessons.map(l => {
              const active = Number(lessonId) === l.id;
              return (
                <Link
                  key={l.id}
                  to={`/lessons/${l.id}`}
                  style={{
                    display: "block",
                    padding: "14px 18px",
                    marginBottom: "10px",
                    borderRadius: "10px",
                    background: active ? "#2563eb" : "#1e293b",
                    color: "white",
                    textDecoration: "none",
                    fontSize: "17px",
                    transition: "all 0.2s"
                  }}
                >
                  {l.title}
                </Link>
              );
            })}
          </div>
        ))}
      </div>

      {/* Основной контент — по центру */}
      <div style={{
        flex: 1,
        marginLeft: "320px",
        padding: "60px 40px",
        maxWidth: "1000px",
        margin: "0 auto"
      }}>
        <h1 style={{
          fontSize: "40px",
          color: "#60a5fa",
          marginBottom: "40px",
          textAlign: "center"
        }}>
          {lesson.title}
        </h1>

        {/* Прогресс */}
        <div style={{
          marginBottom: "50px",
          textAlign: "center"
        }}>
          <div style={{
            height: "12px",
            background: "#1e293b",
            borderRadius: "6px",
            overflow: "hidden",
            maxWidth: "600px",
            margin: "0 auto 10px"
          }}>
            <div style={{
              width: `${progress}%`,
              height: "100%",
              background: "linear-gradient(90deg, #10b981, #34d399)",
              transition: "width 0.6s"
            }} />
          </div>
          <span style={{ color: "#94a3b8", fontSize: "18px" }}>
            Пройдено: {progress}%
          </span>
        </div>

        {/* Контент */}
        <div style={{
          background: "#161b22",
          padding: "35px",
          borderRadius: "16px",
          marginBottom: "50px",
          border: "1px solid #30363d",
          lineHeight: 1.8,
          fontSize: "18px"
        }}>
          {lesson.content}
        </div>

        {/* Видео — по центру */}
        {lesson.video_url && (
          <div style={{
            marginBottom: "60px",
            borderRadius: "16px",
            overflow: "hidden",
            boxShadow: "0 10px 30px rgba(0,0,0,0.6)",
            maxWidth: "900px",
            marginLeft: "auto",
            marginRight: "auto"
          }}>
            <iframe
              width="100%"
              height="520"
              src={getYoutubeEmbed(lesson.video_url)}
              title={lesson.title}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        )}

        {/* Квиз — по центру */}
        {quiz && (
          <div style={{
            background: "#161b22",
            padding: "40px",
            borderRadius: "16px",
            border: "1px solid #30363d",
            maxWidth: "700px",
            margin: "0 auto 60px"
          }}>
            <h2 style={{
              color: "#60a5fa",
              marginBottom: "30px",
              textAlign: "center",
              fontSize: "28px"
            }}>
              Квиз по уроку
            </h2>

            {quiz.questions.map(q => (
              <div key={q.id} style={{ marginBottom: "40px" }}>
                <h3 style={{ marginBottom: "20px", fontSize: "22px" }}>{q.text}</h3>

                {q.answers.map(a => (
                  <label key={a.id} style={{
                    display: "flex",
                    alignItems: "center",
                    marginBottom: "16px",
                    padding: "16px",
                    background: "#0f1117",
                    borderRadius: "10px",
                    cursor: "pointer"
                  }}>
                    <input
                      type="radio"
                      name={`q-${q.id}`}
                      value={a.id}
                      onChange={() => handleAnswer(q.id, a.id)}
                      style={{ marginRight: "16px", width: "20px", height: "20px" }}
                    />
                    <span style={{ fontSize: "17px" }}>{a.text}</span>
                  </label>
                ))}
              </div>
            ))}

            <button
              onClick={submitQuiz}
              style={{
                width: "100%",
                padding: "16px",
                background: "#10b981",
                color: "white",
                border: "none",
                borderRadius: "10px",
                fontSize: "18px",
                fontWeight: 600,
                cursor: "pointer"
              }}
            >
              Отправить ответы
            </button>
          </div>
        )}

        {/* Навигация — по центру с отступами */}
        <div style={{
          display: "flex",
          justifyContent: "center",
          gap: "100px", // большой отступ между кнопками
          marginTop: "80px",
          paddingTop: "50px",
          borderTop: "1px solid #222"
        }}>
          {prevLesson && (
            <Link
              to={`/lessons/${prevLesson.id}`}
              style={{
                color: "#60a5fa",
                textDecoration: "none",
                fontSize: "20px",
                padding: "14px 32px",
                background: "#1e293b",
                borderRadius: "10px",
                transition: "background 0.3s"
              }}
            >
              ← Предыдущий урок
            </Link>
          )}

          {nextLesson && (
            <Link
              to={`/lessons/${nextLesson.id}`}
              style={{
                color: "#60a5fa",
                textDecoration: "none",
                fontSize: "20px",
                padding: "14px 32px",
                background: "#1e293b",
                borderRadius: "10px",
                transition: "background 0.3s"
              }}
            >
              Следующий урок →
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}