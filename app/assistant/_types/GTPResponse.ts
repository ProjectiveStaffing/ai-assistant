import { TaskResponse } from "./TaskResponse";

export interface GPTResponse {
    response: TaskResponse;
    error: string;
}