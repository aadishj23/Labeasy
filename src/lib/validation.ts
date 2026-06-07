import { z } from "zod";
import { isStrongPassword, PASSWORD_RULE } from "@/lib/password";

const strongPassword = z
  .string()
  .refine(isStrongPassword, { message: PASSWORD_RULE });

export const signupUserSchema = z.object({
  name: z.string(),
  password: strongPassword,
  email: z.string().email(),
  phone: z.string().min(10),
});

export const signupLabSchema = z.object({
  lab_name: z.string(),
  owner_name: z.string(),
  email: z.string().email(),
  phone: z.string().min(10),
  password: strongPassword,
  license_no: z.string(),
  gst_no: z.string(),
  address: z.string(),
  state: z.string(),
  city: z.string(),
  pincode: z.string(),
});

// Sign-in only checks the password is present (existing accounts).
export const signinSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const testSchema = z.object({
  test_name: z.string(),
  test_description: z.string(),
});
