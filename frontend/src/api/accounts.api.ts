import { http, toApiError, unwrap } from "./http";

export type Account = {
  id: string;
  type: "B2B" | "B2C";
  fullName?: string | null;
  companyName?: string | null;
  documentType?: string | null;
  documentNumber?: string | null;
  phone?: string | null;
  email?: string | null;
};

export async function getAccounts(type?: "B2B" | "B2C"): Promise<Account[]> {
  try {
    const res = await http.get("/accounts", {
      params: type ? { type } : undefined,
    });
    return unwrap<Account[]>(res.data);
  } catch (e) {
    throw toApiError(e);
  }
}

export type CreateAccountDTO = {
  type: "B2B" | "B2C";
  fullName?: string | null;
  companyName?: string | null;
  documentType?: string | null;
  documentNumber?: string | null;
  phone?: string | null;
  email?: string | null;
};

export async function createAccount(dto: CreateAccountDTO): Promise<Account> {
  try {
    const res = await http.post("/accounts", dto);
    return unwrap<Account>(res.data);
  } catch (e) {
    throw toApiError(e);
  }
}

export type UpdateAccountDTO = Partial<{
  type: "B2B" | "B2C";
  fullName: string | null;
  companyName: string | null;
  documentType: string | null;
  documentNumber: string | null;
  phone: string | null;
  email: string | null;
}>;

export async function updateAccount(id: string, dto: UpdateAccountDTO): Promise<Account> {
  try {
    const res = await http.patch(`/accounts/${id}`, dto);
    return unwrap<Account>(res.data);
  } catch (e) {
    throw toApiError(e);
  }
}

export async function deleteAccount(id: string): Promise<void> {
  try {
    await http.delete(`/accounts/${id}`);
  } catch (e) {
    throw toApiError(e);
  }
}