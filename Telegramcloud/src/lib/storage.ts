const S = 'tg_session';
const A = 'tg_api_credentials';
export const storeSession = (s: string) => localStorage.setItem(S, s);
export const getSession = () => localStorage.getItem(S);
export const storeApiCredentials = (id: number, hash: string) => localStorage.setItem(A, JSON.stringify({ apiId: id, apiHash: hash }));
export const getApiCredentials = (): { apiId: number; apiHash: string } | null => {
  const d = localStorage.getItem(A);
  return d ? JSON.parse(d) : null;
};