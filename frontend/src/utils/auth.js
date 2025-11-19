
const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken'
const USER_KEY = 'user'

export const saveAuthData = async (accessT, refreshT, user) => {
    try {
        localStorage.setItem(ACCESS_TOKEN_KEY, accessT);
        localStorage.setItem(REFRESH_TOKEN_KEY, refreshT);
        localStorage.setItem(USER_KEY, user);
    } catch (error) {
        console.log("Something went wrong while saving data to localStorage: ", error);
    }
}

export const getAuthData = async () => {
    try {
        const accessToken = localStorage.getItem(ACCESS_TOKEN_KEY);
        const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
        const user = localStorage.getItem(USER_KEY);
        return { accessToken, refreshToken, user};
    } catch (error) {
        console.log("Something went wrong while retrieving auth data: ", error);
        return { accessToken: null, refreshToken: null, user: null};
    }
}

export const clearAuthData = async () => {
    try {
        localStorage.removeItem(ACCESS_TOKEN_KEY);
        localStorage.removeItem(REFRESH_TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
    } catch (error) {
        console.log("Something went wrong while discarding auth data: ", error)
    }
}