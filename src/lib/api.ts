import axios, { AxiosInstance, AxiosError } from "axios";

export interface ApiConfig {
  baseUrl: string;
  apiKey: string;
}

export class ApiClient {
  private axiosInstance: AxiosInstance;

  constructor(config: ApiConfig) {
    this.axiosInstance = axios.create({
      baseURL: config.baseUrl,
      headers: {
        "Content-Type": "application/json",
        "x-api-key": config.apiKey,
      },
    });

    // Add response interceptor for error handling
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response) {
          const errorMessage =
            (error.response.data as { message?: string })?.message ||
            error.response.statusText ||
            `HTTP error! status: ${error.response.status}`;
          throw new Error(errorMessage);
        } else if (error.request) {
          throw new Error("Network error: No response received from server");
        } else {
          throw new Error(`Request error: ${error.message}`);
        }
      }
    );
  }

  async get<T>(endpoint: string): Promise<T> {
    const response = await this.axiosInstance.get<T>(endpoint);
    return response.data;
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    const response = await this.axiosInstance.post<T>(endpoint, data);
    return response.data;
  }

  async patch<T>(endpoint: string, data?: any): Promise<T> {
    const response = await this.axiosInstance.patch<T>(endpoint, data);
    return response.data;
  }

  async delete<T>(endpoint: string): Promise<T> {
    const response = await this.axiosInstance.delete<T>(endpoint);
    return response.data;
  }
}
