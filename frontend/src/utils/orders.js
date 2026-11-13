export const ORDER_STATUS = {
  PENDING: { label: 'Chờ xác nhận', className: 'bg-amber-50 text-amber-900' },
  CONFIRMED: { label: 'Đã xác nhận', className: 'bg-sky-50 text-sky-900' },
  SHIPPED: {
    label: 'Đang giao hàng',
    className: 'bg-indigo-50 text-indigo-900',
  },
  DELIVERED: {
    label: 'Đã giao hàng',
    className: 'bg-emerald-50 text-emerald-900',
  },
  CANCELLED: { label: 'Đã hủy', className: 'bg-slate-100 text-slate-700' },
};

export const NEXT_ORDER_STATUS = {
  PENDING: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['SHIPPED', 'CANCELLED'],
  SHIPPED: ['DELIVERED'],
  DELIVERED: [],
  CANCELLED: [],
};

export function paymentLabel(method) {
  return method === 'BANK_TRANSFER'
    ? 'Chuyển khoản (mô phỏng)'
    : 'Thanh toán khi nhận hàng';
}
