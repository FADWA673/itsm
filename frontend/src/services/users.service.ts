import { get, post, patch } from "./api";

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
}

export const getUsers = () => get<UserDTO[]>("/users");
export const createUser = (data: CreateUserDTO) => post<UserDTO>("/users", data);
export const deactivateUser = (id: string) => patch<UserDTO>(`/users/${id}/deactivate`);
