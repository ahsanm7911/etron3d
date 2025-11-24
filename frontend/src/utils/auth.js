export const auth = {
    saveTokens: (access, refresh) => {
        localStorage.setItem('access_token', access);
        localStorage.setItem('refresh_token', refresh);
    }, 
    saveUser: (user) => localStorage.setItem('user', JSON.stringify(user)),
    getUser: () => JSON.parse(localStorage.getItem('user')) || null,
    getAccessToken: () => localStorage.getItem('access_token'),
    clear: () => {
        localStorage.removeItem('acess_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
    },
};