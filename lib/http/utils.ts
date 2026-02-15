import { ApiRequest } from "./model";

const API_SERVER_URL = `${process.env.SERVER_URL}/api`;
const AUTH_API_KEY = process.env.API_KEY;

export function buildRequestUrl(request: ApiRequest): string {
  let resourceUrl = `${request.resource}`;
  
  if (request.queryParams && request.queryParams.size > 0) {
    const params = new URLSearchParams();
    request.queryParams.forEach((value, key) => {
      params.append(key, value.toString());
    });
    resourceUrl = `${resourceUrl}?${params.toString()}`;
  }
  
  return `${API_SERVER_URL}/${resourceUrl}`;
}

export function buildHttpHeaders(token?: string | null): HeadersInit {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (AUTH_API_KEY) {
    headers.apiKey = AUTH_API_KEY;
  }

  if (token) {
    headers.authorization = `Bearer ${token}`;
  }

  return headers;
}

