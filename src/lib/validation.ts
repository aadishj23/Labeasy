import { z } from "zod";

export const signupUserSchema = z.object({
  name: z.string(),
  password: z.string().min(8),
  email: z.string().email(),
  phone: z.string().min(10),
});

export const signupLabSchema = z.object({
  lab_name: z.string(),
  owner_name: z.string(),
  email: z.string().email(),
  phone: z.string().min(10),
  password: z.string().min(8),
  license_no: z.string(),
  gst_no: z.string(),
  address: z.string(),
  state: z.string(),
  city: z.string(),
  pincode: z.string(),
});

export const signinSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const testSchema = z.object({
  test_name: z.string(),
  test_description: z.string(),
});
