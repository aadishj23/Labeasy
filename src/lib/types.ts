export interface Lab {
  lab_id: string;
  lab_name: string;
  test_id?: string;
  test_name?: string;
  test_description?: string;
  test_price: number | string;
}

export interface Test {
  id: string;
  test_name: string;
  test_description?: string;
  slug?: string | null;
  turnaround_hours?: number;
}

export interface CartItem {
  testId: string;
  testName: string;
  labId: string;
  labName: string;
  price: number;
}
