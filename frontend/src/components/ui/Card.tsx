import React from "react";

type CardProps = {
  children: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
};

export function Card({ children, style }: CardProps) {
  return (
    <div
      style={{
        background: "var(--color-surface)",
        border: "1px solid var(--color-border)",
        borderRadius: "var(--radius-lg)",
        padding: "var(--space-6)",
        boxShadow: "var(--shadow)",
        ...style,
      }}
    >
      {children}
    </div>
  );
}
