import React from "react";

type CardProps = {
  children: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
};

export function Card({ children, style, className }: CardProps) {
  return (
    <div
      className={`ui-card${className ? ` ${className}` : ""}`}
      style={{
        background: "var(--color-surface)",
        border: "1px solid var(--color-border)",
        borderRadius: "var(--radius-lg)",
        padding: "1.25rem",
        boxShadow: "var(--shadow)",
        ...style,
      }}
    >
      {children}
    </div>
  );
}