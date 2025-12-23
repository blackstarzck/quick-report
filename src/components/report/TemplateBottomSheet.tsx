"use client";

import { Popup, List } from "antd-mobile";
import { FileOutline } from "antd-mobile-icons";
import { mockTemplates } from "@/lib/mock/data";
import type { Template } from "@/types/report";

interface TemplateBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (template: Template) => void;
}

export function TemplateBottomSheet({
  visible,
  onClose,
  onSelect,
}: TemplateBottomSheetProps) {
  return (
    <Popup
      visible={visible}
      onMaskClick={onClose}
      position="bottom"
      bodyStyle={{
        borderTopLeftRadius: "16px",
        borderTopRightRadius: "16px",
        minHeight: "40vh",
        maxHeight: "70vh",
      }}
    >
      <div className="p-4">
        <h3 className="text-lg font-bold text-gray-900 mb-4">템플릿 선택</h3>
        <List>
          {mockTemplates.map((template) => (
            <List.Item
              key={template.id}
              prefix={<FileOutline className="text-blue-500 text-xl" />}
              onClick={() => {
                onSelect(template);
                onClose();
              }}
              arrow={false}
              className="rounded-lg mb-2"
            >
              <span className="font-medium">{template.name}</span>
            </List.Item>
          ))}
        </List>
      </div>
    </Popup>
  );
}

