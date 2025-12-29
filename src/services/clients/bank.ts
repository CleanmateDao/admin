import axios from "axios";

export const bankClient = axios.create({
  baseURL: import.meta.env.VITE_BANK_SERVICE_API_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  timeout: 90000,
  withCredentials: true,
});
