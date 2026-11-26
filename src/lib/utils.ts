import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { Role } from "@/types/api";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency = "BDT"): string {
  return new Intl.NumberFormat("en-BD", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(dateString?: string | null): string {
  if (!dateString) return "—";
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(dateString));
}

export function getRoleDashboardPath(role: Role): string {
  switch (role) {
    case "ADMIN":
      return "/admin";
    case "INSTRUCTOR":
      return "/instructor";
    case "STUDENT":
    default:
      return "/dashboard";
  }
}

export function getApiErrorMessage(error: unknown, fallback = "Something went wrong"): string {
  if (typeof error === "object" && error !== null) {
    const err = error as {
      response?: { data?: { message?: string; errors?: Array<{ message: string }> } };
      message?: string;
    };
    if (err.response?.data?.errors && err.response.data.errors.length > 0) {
      return err.response.data.errors.map((e) => e.message).join(", ");
    }
    if (err.response?.data?.message) {
      return err.response.data.message;
    }
    if (err.message) {
      return err.message;
    }
  }
  return fallback;
}
