import { ApiProperty } from "@nestjs/swagger";

export class RoleResponseDto {
  @ApiProperty({ example: "uuid-v4" })
  id: string;

  @ApiProperty({ example: "Revisor" })
  name: string;

  @ApiProperty({ example: "Responsible for reviewing content" })
  description: string;

  @ApiProperty({ example: ["Areas", "Content"], type: [String] })
  accessAreas: string[];

  @ApiProperty({ example: true })
  active: boolean;

  @ApiProperty({ example: "2025-10-28T12:34:56.789Z" })
  createdAt: Date;

  @ApiProperty({ example: "2025-10-28T12:34:56.789Z" })
  updatedAt: Date;
}
