
"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import { medicines as initialMedicines } from "@/data/inventory";

const PharmacyContext = createContext(null);

const STORAGE_KEY = "mediflow_pharmacy_data";

export function PharmacyProvider({ children }) {
  const [medicines, setMedicines] = useState(initialMedicines);
  const [sales, setSales] = useState([]);
  const [loaded, setLoaded] = useState(false);

  // Load previously saved pharmacy data from localStorage.
  useEffect(() => {
    try {
      const savedData = localStorage.getItem(STORAGE_KEY);

      if (savedData) {
        const parsedData = JSON.parse(savedData);

        if (Array.isArray(parsedData.medicines)) {
          setMedicines(parsedData.medicines);
        }

        if (Array.isArray(parsedData.sales)) {
          setSales(parsedData.sales);
        }
      }
    } catch (error) {
      console.error("Could not load pharmacy data:", error);
    } finally {
      setLoaded(true);
    }
  }, []);

  // Save changes whenever medicines or sales are updated.
  useEffect(() => {
    if (!loaded) return;

    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          medicines,
          sales,
        })
      );
    } catch (error) {
      console.error("Could not save pharmacy data:", error);
    }
  }, [medicines, sales, loaded]);

  // Add a new medicine to the shared inventory.
  const addMedicine = (newMedicine) => {
    if (!loaded) {
      throw new Error("Pharmacy data is still loading.");
    }

    const medicine = {
      ...newMedicine,
      id: newMedicine.id || `MED-${Date.now()}`,
      batches: newMedicine.batches || [],
    };

    setMedicines((previousMedicines) => [
      medicine,
      ...previousMedicines,
    ]);

    return medicine;
  };

  // Update an existing medicine using its ID.
  const updateMedicine = (updatedMedicine) => {
    if (!loaded) {
      throw new Error("Pharmacy data is still loading.");
    }

    setMedicines((previousMedicines) =>
      previousMedicines.map((medicine) =>
        medicine.id === updatedMedicine.id
          ? {
              ...medicine,
              ...updatedMedicine,
            }
          : medicine
      )
    );
  };

  // Complete a sale and deduct stock using FEFO.
  // FEFO means First Expiry, First Out.
  const completeSale = (saleDetails) => {
    const { items } = saleDetails;

    if (!Array.isArray(items) || items.length === 0) {
      throw new Error("A sale must contain at least one item.");
    }

    // Validate every item before changing inventory.
    for (const item of items) {
      const medicine = medicines.find(
        (med) => med.id === item.id
      );

      if (!medicine) {
        throw new Error(
          `${item.name} was not found in inventory.`
        );
      }

      const available = (medicine.batches || []).reduce(
        (total, batch) =>
          total + Number(batch.quantity || 0),
        0
      );

      if (Number(item.quantity) <= 0) {
        throw new Error(
          `Invalid quantity for ${item.name}.`
        );
      }

      if (Number(item.quantity) > available) {
        throw new Error(
          `Insufficient stock for ${item.name}. Available: ${available}.`
        );
      }
    }

    // Deduct stock from batches with the earliest expiry dates first.
    const updatedMedicines = medicines.map((medicine) => {
      const soldItem = items.find(
        (item) => item.id === medicine.id
      );

      if (!soldItem) return medicine;

      let remainingToDeduct = Number(soldItem.quantity);

      const sortedBatches = [
        ...(medicine.batches || []),
      ].sort((a, b) => {
        const dateA = new Date(a.expiryDate).getTime();
        const dateB = new Date(b.expiryDate).getTime();

        return dateA - dateB;
      });

      const updatedBatches = sortedBatches.map((batch) => {
        if (remainingToDeduct <= 0) return batch;

        const batchQuantity = Number(batch.quantity || 0);

        const deduction = Math.min(
          batchQuantity,
          remainingToDeduct
        );

        remainingToDeduct -= deduction;

        return {
          ...batch,
          quantity: batchQuantity - deduction,
        };
      });

      return {
        ...medicine,
        batches: updatedBatches,
      };
    });

    // Create the completed sale record.
    const sale = {
      ...saleDetails,
      id: `SALE-${Date.now().toString().slice(-8)}`,
      date: new Date().toISOString(),
      status: "Completed",
    };

    setMedicines(updatedMedicines);

    setSales((previousSales) => [
      sale,
      ...previousSales,
    ]);

    return sale;
  };

  // Restore the original demo data.
  const resetPharmacyData = () => {
    setMedicines(initialMedicines);
    setSales([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <PharmacyContext.Provider
      value={{
        medicines,
        sales,
        loaded,
        addMedicine,
        updateMedicine,
        completeSale,
        resetPharmacyData,
      }}
    >
      {children}
    </PharmacyContext.Provider>
  );
}

export function usePharmacy() {
  const context = useContext(PharmacyContext);

  if (!context) {
    throw new Error(
      "usePharmacy must be used inside PharmacyProvider."
    );
  }

  return context;
}
