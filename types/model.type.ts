export interface UserModel {
    username: string;
    password: string;
    role: string;
}

export interface UserAuth {
    username: string;
    password: string;
}

export type UserID = number;