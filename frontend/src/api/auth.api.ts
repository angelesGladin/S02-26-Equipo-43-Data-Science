import { http, toApiError, unwrap } from "./http";

export type LoginDTO = {
  email: string;
  password: string;
};

export type LoginResponse = {
  token: string;
  user: {
    id: string;
    email: string;
    role: string;
    storeId: string;
  };
};

export async function login(dto: LoginDTO): Promise<LoginResponse> {
  try {
    const res = await http.post("/auth/login", dto);
    return unwrap<LoginResponse>(res.data);
  } catch (e) {
    throw toApiError(e);
  }
}