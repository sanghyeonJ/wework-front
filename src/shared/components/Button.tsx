import type { ButtonHTMLAttributes } from "react";

type ButtonVariant = "primary" | "secondary" | "danger";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

const VARIANT_CLASS: Record<ButtonVariant, string> = {
  primary : "bg-accent text-on-accent hover:bg-accent-hover",
  secondary: "border border-line bg-panel text-fg hover:bg-hover",
  danger: "border border-line bg-panel text-danger hover:bg-hover"
};

export function Button({ variant = "secondary", type = "button", className = "", ...buttonProps }: ButtonProps) {
  return (
    <button 
      type={type}
      {...buttonProps}
      className={`inline-flex h-9.5 items-center justify-center gap-1.5 rounded-md px-3 font-medium disabled:pointer-events-none disabled:opacity-50 ${VARIANT_CLASS[variant]} ${className}`}
    />
  );
}