"use client";
import React from "react";
import Button from "./Button";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void };
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="mb-4 text-mono-400">{icon}</div>
      <h3 className="text-lg font-semibold text-mono-900 mb-2">{title}</h3>
      {description && (
        <p className="text-sm text-mono-500 max-w-md mb-6">{description}</p>
      )}
      {action && <Button onClick={action.onClick}>{action.label}</Button>}
    </div>
  );
};
export default EmptyState;
