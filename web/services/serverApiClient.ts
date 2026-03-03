"use server";

import { createApiClient } from "./apiClient";

export async function serverApiClient() {
  return createApiClient();
}
