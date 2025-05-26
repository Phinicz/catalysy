import { NextResponse } from "next/server";
import { VouchersController } from "./vouchers/vouchers-controller";

export async function GET(request: Request) {
  const result = await VouchersController.getVouchers();
  return NextResponse.json(result);
}
