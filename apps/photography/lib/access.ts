import type { Access, FieldAccess } from "payload";
import type { User } from "@/payload-types";

export const publicRead: Access = () => true;

export const isAuthenticated: Access = ({ req }) => !!req.user;

export const isAdmin: Access = ({ req }) => {
  const user = req.user as User | null;
  return user?.role === "admin";
};

export const adminFieldAccess: FieldAccess = ({ req }) => {
  const user = req.user as User | null;
  return user?.role === "admin";
};
