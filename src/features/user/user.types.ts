export interface User {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: "user" | "admin";
    isVerified: boolean;
    createdAt: string;
    updatedAt: string;
    imageUrl?: string;
    bio?: string;
    isAdmin: boolean;
}



export interface UpdateUserPayload {
    firstName?: string;
    lastName?: string;
    email?: string;
    bio?: string;
}

export interface UploadProfileImagePayload {
    image: File;
}

export interface UploadProfileImageResponse {
    imageUrl: string;
}