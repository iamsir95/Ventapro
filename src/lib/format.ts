export const formatVND = (usdPrice: number) => {
  // Assume a fixed exchange rate for the mock store (e.g. 1 USD = 25,000 VND)
  const vndPrice = usdPrice * 25000;
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(vndPrice);
};
