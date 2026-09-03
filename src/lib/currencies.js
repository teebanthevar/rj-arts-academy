export const CURRENCIES = [
  { code: "MYR", symbol: "RM", label: "MYR — Malaysian Ringgit" },
  { code: "USD", symbol: "$", label: "USD — US Dollar" },
  { code: "SGD", symbol: "S$", label: "SGD — Singapore Dollar" },
  { code: "GBP", symbol: "£", label: "GBP — British Pound" },
  { code: "EUR", symbol: "€", label: "EUR — Euro" },
  { code: "INR", symbol: "₹", label: "INR — Indian Rupee" },
  { code: "AUD", symbol: "A$", label: "AUD — Australian Dollar" },
  { code: "IDR", symbol: "Rp", label: "IDR — Indonesian Rupiah" },
  { code: "PHP", symbol: "₱", label: "PHP — Philippine Peso" },
  { code: "THB", symbol: "฿", label: "THB — Thai Baht" },
];

export const getCurrencySymbol = (code) =>
  CURRENCIES.find((c) => c.code === code)?.symbol || "RM";