export interface UserModel {
    username?: string;
    password: string;
    role?: boolean;
    email?: string;
}

export interface UserAuth {
    username: string;
    password: string;
}

export type UserID = number;