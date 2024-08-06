import { useEffect } from "react";
import router from "next/router";
import { atom, useAtom } from "jotai";

import type { RouterOutputs } from "@dakthar/api";
import { auth } from "@dakthar/firekit-client";
import type { User } from "@dakthar/firekit-client";

import { api } from "~/utils/api";

type CurrentUser = RouterOutputs["auth"]["currentUser"];

export const login = async (user: User) => {
  const idToken = await user.getIdToken();
  const resp = await fetch("/api/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      token: idToken,
    }),
  });

  const data = (await resp.json()) as { redirectUrl: string };
  if (resp.ok && data.redirectUrl) {
    localStorage.setItem("user", JSON.stringify({ loggedIn: true }));
    // await router.push(data.redirectUrl); // Dynamically use the URL from the response
    window.location.href = data.redirectUrl // Redirect with a hard refresh
  }
};

export const logout = async () => {
  try {
    await fetch("/api/auth/logout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error(error);
  }
};

const userAtom = atom<CurrentUser | null>(null);
export const useUser = () => useAtom(userAtom);

const tokenAtom = atom<string | null>(null);
export const useToken = () => useAtom(tokenAtom);

export const useLogout = () => {
  const utils = api.useContext();
  const [, setUser] = useUser();

  const logoutUser = async () => {
    try {
      setUser(null);
      const p1 = utils.invalidate();
      const p2 = auth().signOut();
      const p3 = logout();
      await Promise.all([p1, p2, p3]);
      await router.replace("/login");
    } catch (error) {
      console.error(error);
    }
  };

  return { logout: logoutUser };
};

export const useAuthState = () => {
  const [user, setUser] = useUser();

  const authUser = api.auth.currentUser.useQuery(undefined, {
    retry: user ? 0 : 1,
    trpc: {
      abortOnUnmount: true,
    }
  });

  useEffect(() => {
    if (authUser.data) {
      setUser(authUser.data);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authUser.data]);
};