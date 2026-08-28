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
    borderRadius: "6px",
    fontWeight: 500,
    border: "1px solid transparent",
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.6 : 1,
    transition: "all 0.15s",
  };

  const sizes = {
    sm: { padding: "6px 12px", fontSize: "13px" },
    md: { padding: "8px 16px", fontSize: "14px" },
    lg: { padding: "10px 20px", fontSize: "15px" },
  };

  const variants = {
    primary: {
      background: "#3b82f6",
      color: "white",
    },
    secondary: {
      background: "#1e293b",
      color: "#e2e8f0",
      borderColor: "#334155",
    },
    danger: {
      background: "#ef4444",
      color: "white",
    },
    ghost: {
      background: "transparent",
      color: "#94a3b8",
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