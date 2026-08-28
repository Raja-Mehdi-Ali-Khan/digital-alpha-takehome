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
  ...props
}: ButtonProps) {
  const base: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "var(--radius-md)",
    fontWeight: 500,
    border: "1px solid transparent",
    transition: "background 0.15s, border-color 0.15s",
  };

  const sizes = {
    sm: { padding: "0.375rem 0.75rem", fontSize: "var(--text-sm)" },
    md: { padding: "0.5rem 1rem", fontSize: "var(--text-sm)" },
    lg: { padding: "0.75rem 1.25rem", fontSize: "var(--text-base)" },
  };

  const variants = {
    primary: {
      background: "var(--color-primary)",
      color: "white",
    },
    secondary: {
      background: "var(--color-surface)",
      color: "var(--color-text)",
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
      {...props}
    >
      {children}
    </button>
  );
}
