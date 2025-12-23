"use client";

import { Button, Space } from "antd-mobile";

interface CTAButton {
  label: string;
  onClick: () => void;
  type?: "primary" | "default";
  disabled?: boolean;
  loading?: boolean;
}

interface BottomCTAProps {
  buttons: CTAButton[];
}

export function BottomCTA({ buttons }: BottomCTAProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-4 py-3 safe-area-bottom">
      <div className="max-w-md mx-auto">
        <Space direction="vertical" block style={{ "--gap": "8px" }}>
          {buttons.map((button, index) => (
            <Button
              key={index}
              block
              color={button.type === "primary" ? "primary" : "default"}
              fill={button.type === "primary" ? "solid" : "outline"}
              size="large"
              onClick={button.onClick}
              disabled={button.disabled}
              loading={button.loading}
              className="btn-animate"
              style={{
                borderRadius: "12px",
                height: "52px",
                fontWeight: 600,
              }}
            >
              {button.label}
            </Button>
          ))}
        </Space>
      </div>
    </div>
  );
}

