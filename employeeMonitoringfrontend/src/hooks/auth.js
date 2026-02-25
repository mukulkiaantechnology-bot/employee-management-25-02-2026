import { apiClient } from '../utils/apiClient';

const AUTH_KEY = 'ems_auth_session';

export const auth = {
    login: async (email, password) => {
        const response = await apiClient.post('/auth/login', { email, password });

        if (response.success) {
            const session = {
                id: response.data.user.id,
                email: response.data.user.email,
                name: response.data.user.name,
                role: response.data.user.role,
                token: response.data.accessToken
            };
            localStorage.setItem(AUTH_KEY, JSON.stringify(session));
            return session;
        }
        throw new Error('Login failed');
    },
    logout: () => {
        localStorage.removeItem(AUTH_KEY);
    },
    isAuthenticated: () => {
        return !!localStorage.getItem(AUTH_KEY);
    },
    getUser: () => {
        const session = localStorage.getItem(AUTH_KEY);
        return session ? JSON.parse(session) : null;
    }
};

export function useAuth() {
    const [user, setUser] = useState(auth.getUser());

    const login = useCallback(async (email, password) => {
        try {
            const newUser = await auth.login(email, password);
            setUser(newUser);
            return newUser;
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    }, []);

    const logout = useCallback(() => {
        auth.logout();
        setUser(null);
    }, []);

    return {
        user,
        isAuthenticated: !!user,
        login,
        logout
    };
}
