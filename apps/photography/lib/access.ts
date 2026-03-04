import type { User } from "@/payload-types";
import type { Access, FieldAccess } from "payload";

export const publicRead: Access = () => true;

export const isAuthenticated: Access = ({ req }) => !!req.user;

export const isAdmin: Access = ({ req }) => {
  const user = req.user;
  return user?.role === "admin";
};

export const adminFieldAccess: FieldAccess = ({ req }) => {
  const user = req.user;
  return user?.role === "admin";
};
