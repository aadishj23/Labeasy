import prisma from "@/lib/prisma";

export const DISCOUNT_RATE = 0.2; // 20% storefront discount on tests (packages are pre-priced)

// Recompute a per-lab cart group's pricing from the DB (paise). Never trust
// client-sent amounts. Shared by checkout and coupon validation.
export async function priceGroup(
  labId: string,
  testIds: string[],
  packageIds: string[]
) {
  const labTests = testIds.length
    ? await prisma.labTest.findMany({
        where: { lab_id: labId, test_id: { in: testIds } },
      })
    : [];
  const packages = packageIds.length
    ? await prisma.package.findMany({
        where: { lab_id: labId, id: { in: packageIds }, active: true },
      })
    : [];

  const testSubtotal = labTests.reduce(
    (s, lt) => s + Math.round(Number(lt.test_price) * 100),
    0
  );
  const packageSubtotal = packages.reduce(
    (s, p) => s + Math.round(p.price * 100),
    0
  );
  const subtotal = testSubtotal + packageSubtotal;
  const storefrontDiscount = Math.round(testSubtotal * DISCOUNT_RATE);
  const payable = subtotal - storefrontDiscount;

  return { labTests, packages, subtotal, storefrontDiscount, payable };
}
