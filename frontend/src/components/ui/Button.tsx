import React from "react";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
};

export function Button({
  variant = "primary",
  size = "md",
  children,
  style,
  disabled,
  ...props
}: ButtonProps) {
  const base: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "var(--radius-sm)",
    fontWeight: 650,
    border: "1px solid transparent",
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.6 : 1,
    transition: "transform 0.15s, box-shadow 0.15s, background 0.15s",
  };

  const sizes = {
    sm: { padding: "6px 12px", fontSize: "13px" },
    md: { padding: "8px 16px", fontSize: "14px" },
    lg: { padding: "10px 20px", fontSize: "15px" },
  };

  const variants = {
    primary: {
      background: "var(--color-primary)",
      color: "white",
      boxShadow: "0 6px 14px rgb(8 127 115 / 0.18)",
    },
    secondary: {
      background: "var(--color-surface)",
      color: "var(--color-ink-soft)",
      borderColor: "var(--color-border)",
    },
    danger: {
      background: "var(--color-danger)",
      color: "white",
    },
    ghost: {
      background: "transparent",
      color: "var(--color-text-muted)",
    },
  };

  return (
    <button
      style={{ ...base, ...sizes[size], ...variants[variant], ...style }}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}