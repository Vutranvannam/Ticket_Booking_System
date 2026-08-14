import { privateGet, privatePut } from "@/core/api/client/privateClient";
import { USER_ENDPOINTS } from "@/core/api/endpoints";
import type { User } from "@/shared/types/user.type";
import type { UpdateProfileRequest, UserListParams } from "../types/user.types";
import type { PaginatedResponse } from "@/core/types/api";

export const userService = {
  getMe(): Promise<User> {
    return privateGet<User>(USER_ENDPOINTS.ME);
  },

  updateMe(data: UpdateProfileRequest): Promise<User> {
    return privatePut<User>(USER_ENDPOINTS.ME, data);
  },

  listUsers(params: UserListParams): Promise<PaginatedResponse<User>> {
    return privateGet<PaginatedResponse<User>>(USER_ENDPOINTS.LIST, { params });
  },

  getUserById(id: string): Promise<User> {
    return privateGet<User>(USER_ENDPOINTS.BY_ID(id));
  },
};
