import React from "react";

type SectionHeaderProps = {
  title: string;
  description?: string;
  className?: string;
};

export default function SectionHeader({ title, description, className }: SectionHeaderProps) {
  return (
    <div className={className ?? "mb-4"}>
      <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
      {description ? (
        <p className="text-gray-600 mt-1">{description}</p>
      ) : null}
    </div>
  );
}

