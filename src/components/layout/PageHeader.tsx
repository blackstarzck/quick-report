"use client";

import { NavBar } from "antd-mobile";
import { useRouter } from "next/navigation";

interface PageHeaderProps {
  title: string;
  showBack?: boolean;
  onBack?: () => void;
  right?: React.ReactNode;
}

export function PageHeader({
  title,
  showBack = true,
  onBack,
  right,
}: PageHeaderProps) {
  const router = useRouter();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  return (
    <NavBar
      onBack={showBack ? handleBack : undefined}
      back={showBack ? undefined : null}
      right={right}
      style={{
        "--height": "56px",
        "--border-bottom": "1px solid #f0f0f0",
        background: "white",
      }}
    >
      <span className="font-semibold text-gray-900">{title}</span>
    </NavBar>
  );
}

