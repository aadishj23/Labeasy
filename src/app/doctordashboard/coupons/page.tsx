import CouponManager from "@/views/CouponManager";

export default function Page() {
  return <CouponManager endpoint="/api/v1/vendor/coupons" />;
}
