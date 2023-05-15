import { User } from "~/types/common";
import { parse } from "set-cookie-parser";

export default {
  async findUser(atk: Ref<string>) {
    const config = useRuntimeConfig();
    const baseURL = config.public.apiBase;
    return await useFetch<User>("user", {
      baseURL,
      headers: { Authorization: `Bearer ${atk.value}` },
    });
  },
  async reissue() {
    const config = useRuntimeConfig();
    const rtk = useCookie("refresh-token");
    const baseURL = config.public.apiBase;
    return await useFetch<{ atk: string }>("auth/refresh", {
      baseURL,
      headers: { Authorization: `Bearer ${rtk.value}` },
      onResponse({ response }) {
        if (!process.server) return;
        const combinedCookie = response.headers.get("set-cookie");
        if (!combinedCookie) return;
        const cookies = parse(combinedCookie);
        const cookie = cookies.find((c) => c.name === "refresh-token");
        if (!cookie) return;
        rtk.value = cookie.value;
      },
    });
  },
  async loginKakao() {
    try {
      return await useFetch("auth/kakao");
    } catch (err) {
      throw new Error("");
    }
  },
  async logoutUser() {
    try {
      return await useFetch("auth/logout");
    } catch (err) {
      throw new Error("");
    }
  },
};
