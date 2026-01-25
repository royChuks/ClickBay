interface User {
    id: string;
    name: string;
    email: string;
    createdAt: Date;
}
declare let currentUser: User | null;
declare function loginUser(email: string, password: string, rememberMe: boolean): Promise<void>;
declare function registerUser(name: string, email: string, password: string): Promise<void>;
export { loginUser, registerUser, currentUser };
//# sourceMappingURL=auth.d.ts.map