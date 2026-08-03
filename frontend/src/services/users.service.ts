import { get, post, put, patch, del } from "./api";

export interface UserDTO {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  status: string;
  lastLoginAt: string | null;
  createdAt: string;
  organizationId: string;
}

export interface CreateUserDTO {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: string;
  status?: string;
}

export const getUsers = () => get<UserDTO[]>("/users");
export const createUser = (data: CreateUserDTO) => post<UserDTO>("/users", data);
export const updateUser = (id: string, data: Partial<CreateUserDTO>) => put<UserDTO>(`/users/${id}`, data);
export const resetUserPassword = (id: string, password: string) => post<void>(`/users/${id}/reset-password`, { password });
export const deleteUser = (id: string) => del<void>(`/users/${id}`);
export const deactivateUser = (id: string) => patch<UserDTO>(`/users/${id}/deactivate`);
