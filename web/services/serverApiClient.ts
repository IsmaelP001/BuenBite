"use server";

import { cookies } from "next/headers";
import { createApiClient } from "./apiClient";

export async function serverApiClient() {
  const cookiesStore = await cookies();
  // const token = cookiesStore.get("auth_token")?.value;

  //   if (!token) {
  //     throw new Error("Missing auth token or userId in cookies");
  //   }

  const token = "sbp_74952f1faf46c38ba66491246b10710446833a2d";
  return createApiClient(token!, "userId");
}
