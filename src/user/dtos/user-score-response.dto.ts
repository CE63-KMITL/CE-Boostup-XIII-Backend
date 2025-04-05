import { Exclude, Expose } from "class-transformer";
import { ApiProperty } from "@nestjs/swagger";
import { ScoreLog } from "../score-log.entity";

export class UserScoreResponseDto {
    @Expose()
    @ApiProperty({
        example: 0,
        description: "User score",
        type: Number,
    })
    score: number;

    @Expose()
    @ApiProperty({
        example: [],
        description: "User score logs",
        type: [ScoreLog],
    })
    scoreLogs: ScoreLog[];
}

