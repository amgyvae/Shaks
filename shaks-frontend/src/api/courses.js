import api from "./api"

export const getCourses = () => {
    return api.get("courses/")
}

export const getCourse = (id) => {
    return api.get(`courses/${id}/`)
}

export const getLesson = (id) => {
    return api.get(`lessons/lessons/${id}/`)
}