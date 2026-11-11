
export const medicineCategories = [
  "Pain Relief",
  "Antibiotics",
  "Antihistamines",
  "Vitamins",
  "Antimalarials",
  "Antidiabetics",
  "Other",
];

export const medicines = [
  {
    id: 1,
    name: "Paracetamol",
    genericName: "Paracetamol",
    strength: "500mg",
    category: "Pain Relief",
    dosageForm: "Tablet",
    manufacturer: "Shelys Pharmaceuticals",
    sku: "MED-0001",
    barcode: "620100000001",
    purchasePrice: 150,
    sellingPrice: 250,
    reorderLevel: 100,
    batches: [
      { batchNumber: "PCM-2026-01", quantity: 450, expiryDate: "2027-08-15" },
      { batchNumber: "PCM-2026-02", quantity: 200, expiryDate: "2028-02-20" },
    ],
  },
  {
    id: 2,
    name: "Amoxicillin",
    genericName: "Amoxicillin",
    strength: "500mg",
    category: "Antibiotics",
    dosageForm: "Capsule",
    manufacturer: "Zenufa Laboratories",
    sku: "MED-0002",
    barcode: "620100000002",
    purchasePrice: 350,
    sellingPrice: 600,
    reorderLevel: 150,
    batches: [
      { batchNumber: "AMX-2026-01", quantity: 85, expiryDate: "2027-03-10" },
    ],
  },
  {
    id: 3,
    name: "Cetirizine",
    genericName: "Cetirizine Hydrochloride",
    strength: "10mg",
    category: "Antihistamines",
    dosageForm: "Tablet",
    manufacturer: "Tanzania Pharmaceutical Industries",
    sku: "MED-0003",
    barcode: "620100000003",
    purchasePrice: 120,
    sellingPrice: 200,
    reorderLevel: 80,
    batches: [
      { batchNumber: "CTZ-2026-01", quantity: 320, expiryDate: "2027-11-12" },
    ],
  },
  {
    id: 4,
    name: "Vitamin C",
    genericName: "Ascorbic Acid",
    strength: "1000mg",
    category: "Vitamins",
    dosageForm: "Tablet",
    manufacturer: "Shelys Pharmaceuticals",
    sku: "MED-0004",
    barcode: "620100000004",
    purchasePrice: 500,
    sellingPrice: 850,
    reorderLevel: 100,
    batches: [
      { batchNumber: "VTC-2026-01", quantity: 60, expiryDate: "2026-12-15" },
    ],
  },
  {
    id: 5,
    name: "Ibuprofen",
    genericName: "Ibuprofen",
    strength: "400mg",
    category: "Pain Relief",
    dosageForm: "Tablet",
    manufacturer: "Keko Pharmaceuticals",
    sku: "MED-0005",
    barcode: "620100000005",
    purchasePrice: 250,
    sellingPrice: 400,
    reorderLevel: 100,
    batches: [
      { batchNumber: "IBU-2026-01", quantity: 0, expiryDate: "2027-06-30" },
    ],
  },
  {
    id: 6,
    name: "Artemether + Lumefantrine",
    genericName: "Artemether + Lumefantrine",
    strength: "20mg/120mg",
    category: "Antimalarials",
    dosageForm: "Tablet",
    manufacturer: "Ajanta Pharma",
    sku: "MED-0006",
    barcode: "620100000006",
    purchasePrice: 1800,
    sellingPrice: 2500,
    reorderLevel: 30,
    batches: [
      { batchNumber: "AL-2026-01", quantity: 45, expiryDate: "2027-01-20" },
    ],
  },
  {
    id: 7,
    name: "Metformin",
    genericName: "Metformin Hydrochloride",
    strength: "500mg",
    category: "Antidiabetics",
    dosageForm: "Tablet",
    manufacturer: "Tanzania Pharmaceutical Industries",
    sku: "MED-0007",
    barcode: "620100000007",
    purchasePrice: 300,
    sellingPrice: 500,
    reorderLevel: 100,
    batches: [
      { batchNumber: "MET-2026-01", quantity: 280, expiryDate: "2028-05-15" },
    ],
  },
  {
    id: 8,
    name: "Loratadine",
    genericName: "Loratadine",
    strength: "10mg",
    category: "Antihistamines",
    dosageForm: "Tablet",
    manufacturer: "Shelys Pharmaceuticals",
    sku: "MED-0008",
    barcode: "620100000008",
    purchasePrice: 180,
    sellingPrice: 300,
    reorderLevel: 80,
    batches: [
      { batchNumber: "LOR-2026-01", quantity: 15, expiryDate: "2026-11-25" },
    ],
  },
];

export const getMedicineStock = (medicine) =>
  medicine.batches.reduce((total, batch) => total + batch.quantity, 0);

export const getStockStatus = (medicine) => {
  const stock = getMedicineStock(medicine);

  if (stock === 0) return "Out of Stock";
  if (stock <= medicine.reorderLevel) return "Low Stock";

  return "In Stock";
};

export const getMedicineValue = (medicine) =>
  getMedicineStock(medicine) * medicine.sellingPrice;

export const getMedicineCostValue = (medicine) =>
  getMedicineStock(medicine) * medicine.purchasePrice;

export const getExpiryStatus = (date) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const expiry = new Date(`${date}T00:00:00`);
  const daysRemaining = Math.ceil(
    (expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (daysRemaining < 0) return "Expired";
  if (daysRemaining <= 90) return "Expiring Soon";

  return "Valid";
};

export const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-TZ", {
    style: "currency",
    currency: "TZS",
    maximumFractionDigits: 0,
  }).format(amount);
