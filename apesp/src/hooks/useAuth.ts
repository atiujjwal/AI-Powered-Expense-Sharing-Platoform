import { useStore } from "../store";

export default function useAuth() {
  const { user, login, register, logout } = useStore();
  return { user, login, registerUser: register, logout };
}
