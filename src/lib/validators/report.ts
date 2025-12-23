import { z } from "zod";

export const reportFormSchema = z.object({
  title: z
    .string()
    .min(1, "제목을 입력해주세요")
    .max(100, "제목은 100자 이내로 입력해주세요"),
  content: z
    .string()
    .min(10, "내용을 10자 이상 입력해주세요")
    .max(5000, "내용은 5000자 이내로 입력해주세요"),
});

export type ReportFormData = z.infer<typeof reportFormSchema>;

