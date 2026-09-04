const THB_FORMATTER = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "THB",
  currencyDisplay: "code",
  maximumFractionDigits: 0,
})

export function formatCurrency(amount: number | string): string {
  return THB_FORMATTER.format(Number(amount))
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-US").format(value)
}
