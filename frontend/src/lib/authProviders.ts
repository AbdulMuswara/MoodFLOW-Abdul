import type { User } from "firebase/auth";

export type LinkedProviders = {
  hasPassword: boolean;
  hasGoogle: boolean;
};

export function getLinkedProviders(user: User): LinkedProviders {
  const ids = user.providerData.map((p) => p.providerId);
  return {
    hasPassword: ids.includes("password"),
    hasGoogle: ids.includes("google.com"),
  };
}
