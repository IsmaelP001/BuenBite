import { ApiResponse } from "@/types";
import { getSession } from "@/actions/auth";

export const API_SERVER_URL = "http://192.168.1.10:3002/api";
// export const API_SERVER_URL = process.env.API_URL!;

// export const API_SERVER_URL = "http://172.20.10.6:3002/api";
const AUTH_API_KEY = process.env.API_KEY;

interface RequestOptions {
  queryParams?: Record<string, string | number>;
  body?: object;
  isFormDataType?: boolean;
}

interface SessionData {
  token: string;
  userId: string;
}

export class HttpClient {
  private static sessionData: SessionData | null = null;
  private static sessionPromise: Promise<SessionData> | null = null;

  constructor() {}

  // Obtiene token y userId de forma lazy
  public static async getSessionData(): Promise<SessionData> {
    if (this.sessionData) return this.sessionData;
    const {
      data: { session },
    } = await getSession();


    const sessionData = {
      token: session?.access_token ?? "",
      userId: session?.user.id ?? "",
    };
    this.sessionData = sessionData;
    return sessionData;
  }

  // Método público para obtener el userId
  public static async getUserId(): Promise<string> {
    const session = await this.getSessionData();
    return session.userId;
  }

  // Método público para obtener el token
  public static async getToken(): Promise<string> {
    const session = await this.getSessionData();
    return session.token;
  }

  public static resetSession(): void {
    this.sessionData = null;
    this.sessionPromise = null;
  }

  // Getter síncrono (retorna null si no está cargado)
  public static getCurrentUserId(): string | null {
    return this.sessionData?.userId ?? null;
  }

  public static getCurrentToken(): string | null {
    return this.sessionData?.token ?? null;
  }

  private buildUrl(
    endpoint: string,
    queryParams?: Record<string, string | number>
  ): string {
    const url = `${API_SERVER_URL}/${endpoint}`;

    if (queryParams && Object.keys(queryParams).length > 0) {
      const params = new URLSearchParams();
      Object.entries(queryParams).forEach(([key, value]) => {
        params.append(key, value.toString());
      });
      return `${url}?${params.toString()}`;
    }

    return url;
  }

  private async getHeaders(options?: RequestOptions): Promise<HeadersInit> {
    const headers: HeadersInit = {};

    if (AUTH_API_KEY) {
      headers["apiKey"] = AUTH_API_KEY;
    }

    const { token } = await HttpClient.getSessionData();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    if (!options?.isFormDataType) {
      headers["Content-Type"] = "application/json";
    }

    headers["ngrok-skip-browser-warning"] = "true";

    return headers;
  }

  private async executeRequest<T>(
    url: string,
    options: RequestInit
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(url, options);

      const contentType = response.headers.get("content-type");
      let body: any = null;

      if (contentType?.includes("application/json")) {
        body = await response.json();
      } else {
        body = await response.text();
      }

      if (!response.ok) {
        throw body;
      }

      return body;
    } catch (error) {
      throw error;
    }
  }

  async get<T>(
    endpoint: string,
    options?: RequestOptions
  ): Promise<ApiResponse<T>> {
    const url = this.buildUrl(endpoint, options?.queryParams);
    const headers = await this.getHeaders(options);
    return this.executeRequest<T>(url, {
      method: "GET",
      headers,
    });
  }

  async post<T>(
    endpoint: string,
    body?: object | FormData,
    options?: RequestOptions
  ): Promise<ApiResponse<T>> {
    const url = this.buildUrl(endpoint, options?.queryParams);
    const headers = await this.getHeaders(options);
    const jsonBody = body ? JSON.stringify(body) : undefined;
    return this.executeRequest<T>(url, {
      method: "POST",
      headers,
      body: (options?.isFormDataType ? body : jsonBody) as any,
    });
  }

  async put<T>(
    endpoint: string,
    body?: object,
    options?: RequestOptions
  ): Promise<ApiResponse<T>> {
    const url = this.buildUrl(endpoint, options?.queryParams);
    const headers = await this.getHeaders(options);
    return this.executeRequest<T>(url, {
      method: "PUT",
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async patch<T>(
    endpoint: string,
    body?: object,
    options?: RequestOptions
  ): Promise<ApiResponse<T>> {
    const url = this.buildUrl(endpoint, options?.queryParams);
    const headers = await this.getHeaders(options);
    return this.executeRequest<T>(url, {
      method: "PATCH",
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async delete<T>(
    endpoint: string,
    options?: RequestOptions
  ): Promise<ApiResponse<T>> {
    const url = this.buildUrl(endpoint, options?.queryParams);
    const headers = await this.getHeaders(options);
    return this.executeRequest<T>(url, {
      method: "DELETE",
      headers,
    });
  }
}
