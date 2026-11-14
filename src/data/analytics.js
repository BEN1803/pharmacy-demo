export const analyticsKpis = [
  {
    id: "revenue",
    label: "Total Revenue",
    value: 18450000,
    change: 14.8,
    trend: "up",
    caption: "vs. TZS 16.07M last month",
  },
  {
    id: "profit",
    label: "Gross Profit",
    value: 5280000,
    change: 9.3,
    trend: "up",
    caption: "vs. TZS 4.83M last month",
  },
  {
    id: "orders",
    label: "Average Order Value",
    value: 34800,
    change: 4.2,
    trend: "up",
    caption: "based on 530 orders",
  },
  {
    id: "returns",
    label: "Returning Customers",
    value: 68,
    change: 2.1,
    trend: "down",
    caption: "percent of monthly customers",
    suffix: "%",
  },
];

export const monthlyPerformance = [
  { label: "Jan", revenue: 12500000, profit: 3200000, target: 12000000 },
  { label: "Feb", revenue: 14200000, profit: 3800000, target: 13000000 },
  { label: "Mar", revenue: 11800000, profit: 3100000, target: 13500000 },
  { label: "Apr", revenue: 15600000, profit: 4200000, target: 14000000 },
  { label: "May", revenue: 16300000, profit: 4500000, target: 14500000 },
  { label: "Jun", revenue: 14800000, profit: 3900000, target: 15000000 },
  { label: "Jul", revenue: 17200000, profit: 4700000, target: 15500000 },
  { label: "Aug", revenue: 15900000, profit: 4300000, target: 16000000 },
  { label: "Sep", revenue: 18500000, profit: 5100000, target: 16500000 },
  { label: "Oct", revenue: 16800000, profit: 4600000, target: 17000000 },
  { label: "Nov", revenue: 18450000, profit: 5280000, target: 17500000 },
];

export const categoryPerformance = [
  { name: "Pain Relief", value: 34, revenue: 6273000 },
  { name: "Antibiotics", value: 26, revenue: 4797000 },
  { name: "Antimalarials", value: 17, revenue: 3136500 },
  { name: "Vitamins", value: 12, revenue: 2214000 },
  { name: "Antidiabetics", value: 7, revenue: 1291500 },
  { name: "Antihistamines", value: 4, revenue: 738000 },
];

export const paymentMix = [
  { name: "M-Pesa", value: 46, color: "#8b5cf6" },
  { name: "Cash", value: 31, color: "#22d3ee" },
  { name: "Bank transfer", value: 15, color: "#34d399" },
  { name: "Card", value: 8, color: "#fbbf24" },
];

export const hourlySales = [
  { label: "8am", value: 420000 },
  { label: "10am", value: 980000 },
  { label: "12pm", value: 1360000 },
  { label: "2pm", value: 1120000 },
  { label: "4pm", value: 1580000 },
  { label: "6pm", value: 1890000 },
  { label: "8pm", value: 940000 },
];

export const topSellingMedicines = [
  {
    id: 1,
    name: "Paracetamol 500mg",
    category: "Pain Relief",
    units: 842,
    revenue: 1684000,
    margin: 40,
  },
  {
    id: 2,
    name: "Amoxicillin 500mg",
    category: "Antibiotics",
    units: 624,
    revenue: 3120000,
    margin: 42,
  },
  {
    id: 3,
    name: "Cetirizine 10mg",
    category: "Antihistamines",
    units: 486,
    revenue: 972000,
    margin: 40,
  },
  {
    id: 4,
    name: "Vitamin C 1000mg",
    category: "Vitamins",
    units: 392,
    revenue: 1176000,
    margin: 41,
  },
  {
    id: 5,
    name: "Ibuprofen 400mg",
    category: "Pain Relief",
    units: 318,
    revenue: 954000,
    margin: 38,
  },
  {
    id: 6,
    name: "Metformin 500mg",
    category: "Antidiabetics",
    units: 244,
    revenue: 854000,
    margin: 40,
  },
];

export const analyticsInsights = [
  {
    id: 1,
    tone: "positive",
    title: "Revenue is ahead of target",
    detail:
      "November revenue is 5.4% above target, driven by strong antibiotic and pain relief sales.",
  },
  {
    id: 2,
    tone: "warning",
    title: "Evening peak needs staffing",
    detail:
      "Sales between 4 PM and 8 PM contribute 41% of daily revenue. Consider adding a cashier to the evening shift.",
  },
  {
    id: 3,
    tone: "neutral",
    title: "M-Pesa remains the top channel",
    detail:
      "Mobile money accounts for 46% of collected payments. Keep the float topped up during weekends.",
  },
];
