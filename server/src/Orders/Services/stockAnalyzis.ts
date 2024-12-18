import Order from "../Model/orderModel";

interface Product {
  productId: string;
  productName: string;
  stockStatus: number; // Initial stock (maximum stock across all months)
  leftOver: number; // Final leftover stock
  availability: string; // Availability status
  average: number; // Average sales per month
}

export const stockAnalyzisBulk = async () => {
  try {
    // Fetch all orders (each order represents a month with rows of products)
    const orders = await Order.find().select(
      "-top10StockStatusProducts -totalStockStatus"
    );
    if (!orders || orders.length === 0) return [];

    const monthlyConsolidatedData: { [key: string]: Product[] } = {};
    const totalMonths = orders.length;

    // Step 1: Consolidate products for each month
    for (const order of orders) {
      const rows = Array.isArray(order.rows) ? order.rows : []; // Ensure rows is always an array
      const consolidatedStocks: { [key: string]: Product } = {};

      // Sum up stock statuses for duplicate products within the same month
      for (const product of rows) {
        const productId = product.productId;
        if (consolidatedStocks[productId]) {
          // If the product already exists in the month's consolidated list, add the stock status
          consolidatedStocks[productId].stockStatus += product.stockStatus;
        } else {
          // Add the product to the month's consolidated list
          consolidatedStocks[productId] = {
            productId: product.productId,
            productName: product.productName,
            stockStatus: product.stockStatus,
            leftOver: 0, // Placeholder, will calculate later
            availability: "Unknown", // Placeholder
            average: 0, // Placeholder
          };
        }
      }

      // Store consolidated data for the current month
      monthlyConsolidatedData[order.name] = Object.values(consolidatedStocks);
    }

    // Step 2: Calculate initial stock, sales, leftOvers, and averages
    const finalStockStatus: Product[] = [];
    const productIds = new Set<string>();

    // Gather all product IDs across all months
    Object.values(monthlyConsolidatedData).forEach((monthData) => {
      monthData.forEach((product) => productIds.add(product.productId));
    });

    // Process each product to calculate stats
    productIds.forEach((productId) => {
      let totalSales = 0;
      let initialStock = 0;
      let leftOver = 0;

      // Iterate over months in chronological order
      const monthKeys = Object.keys(monthlyConsolidatedData).sort(); // Ensure chronological order
      let previousStock = 0;

      // Find the maximum stock as the initial stock
      monthKeys.forEach((monthKey) => {
        const monthData = monthlyConsolidatedData[monthKey];
        const product = monthData.find((p) => p.productId === productId);
        if (product) {
          if (product.stockStatus > initialStock) {
            initialStock = product.stockStatus; // Set maximum stock as initial stock
          }
        }
      });

      // Calculate sales and leftover based on the initial stock
      for (let i = 0; i < monthKeys.length; i++) {
        const monthData = monthlyConsolidatedData[monthKeys[i]];
        const product = monthData.find((p) => p.productId === productId);

        if (product) {
          if (i === 0) {
            // For the first month, set previousStock to the maximum (initial stock)
            previousStock = initialStock;
          } else {
            // Calculate sales as the difference between previous stock and current stock
            const sales = previousStock - product.stockStatus;
            if (sales > 0) {
              totalSales += sales;
              previousStock = product.stockStatus; // Update the stock for the next iteration
            }
          }

          // Set leftover stock as the stock in the last month
          if (i === monthKeys.length - 1) {
            leftOver = product.stockStatus;
          }
        }
      }

      // Calculate availability based on leftover stock
      const availability = leftOver > 0 ? "Available" : "Out of Stock";

      // Calculate the average sales per month
      const average =
        totalMonths > 0 ? parseFloat((totalSales / totalMonths).toFixed(2)) : 0;

      // Push the final product details
      const productName =
        monthlyConsolidatedData[monthKeys[0]].find(
          (product) => product.productId === productId
        )?.productName || "";

      finalStockStatus.push({
        productId,
        productName,
        stockStatus: initialStock, // Maximum stock as initial stock
        leftOver, // Final leftover stock after all months
        availability, // Availability status
        average, // Average sales per month
      });
    });

    return finalStockStatus;
  } catch (error) {
    console.error("Error while consolidating stock data:", error);
    throw new Error("Error While searching data");
  }
};
