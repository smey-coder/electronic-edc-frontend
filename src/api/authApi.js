import api from "./axios";

const saveToken = (token, rememberMe = false) => {
  if (!token) return;

  if (rememberMe) {
    localStorage.setItem("access_token", token);
    sessionStorage.removeItem("access_token");
    return;
  }

  sessionStorage.setItem("access_token", token);
  localStorage.removeItem("access_token");
};

export const authService = {
  register: async (studentData) => {
    const response = await api.post("/students/register-with-key", studentData);
    return response.data;
  },

  login: async (credentials, rememberMe = false) => {
    const formData = new URLSearchParams();
    formData.set(
      "username",
      credentials.username || credentials.emailOrUsername || credentials.email || "",
    );
    formData.set("password", credentials.password);

    const response = await api.post("/auth/login", formData, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });
    const token =
      response.data?.token ??
      response.data?.data?.token ??
      response.data?.access_token ??
      response.data?.data?.access_token;

    if (token) {
      saveToken(token, rememberMe);
    }
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await api.get("/auth/me");
    return response.data;
  },

  logout: async () => {
    try {
      await api.post("/logout");
    } finally {
      localStorage.removeItem("access_token");
      localStorage.removeItem("auth_token");
      sessionStorage.removeItem("access_token");
      localStorage.removeItem("user_info");
    }
  },
};
