import React from "react";

type CardProps = {
  children: React.ReactNode;
  style?: React.CSSProperties;
};

export function Card({ children, style }: CardProps) {
  return (
    <div
      style={{
        background: "#1e293b",
        border: "1px solid #334155",
        borderRadius: "12px",
        padding: "1.25rem",
        boxShadow: "0 4px 6px -1px rgba(0,0,0,0.3)",
        ...style,
      }}
    >
      {children}
    </div>
  );
}