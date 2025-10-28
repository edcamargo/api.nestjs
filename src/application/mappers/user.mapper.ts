import { User, UserRole } from "../../domain/user/user.entity";
import { UserResponseDto } from "../dtos/user-response.dto";

export const toDomain = (props: Partial<User>): User => {
  return new User(
    props.id ?? "",
    props.name ?? "",
    props.email ?? "",
    props.password ?? "",
    props.role ?? UserRole.USER,
    props.createdAt ?? new Date(),
    props.updatedAt ?? new Date(),
  );
};

export const toResponse = (user: User): UserResponseDto => {
  const dto = new UserResponseDto();
  dto.id = user.id;
  dto.name = user.name;
  dto.email = user.email;
  dto.password = user.password;
  dto.role = user.role;
  dto.createdAt = user.createdAt;
  dto.updatedAt = user.updatedAt;
  return dto;
};
