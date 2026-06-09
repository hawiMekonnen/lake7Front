/** Resolve restaurant name from order API data or stored delivery payload. */
export function getRestaurantName(order: any): string | null {
  if (!order) return null;
  if (order.restaurant?.name) return order.restaurant.name;
  if (order.delivery?.senderName) return order.delivery.senderName;

  if (order.delivery?.itemDescription) {
    try {
      const parsed = JSON.parse(order.delivery.itemDescription);
      if (parsed.restaurantName) return parsed.restaurantName;
    } catch {
      /* plain text description */
    }
  }

  return null;
}

export function getPaymentMethod(order: any): string | null {
  if (!order) return null;
  if (order.paymentMethod) return order.paymentMethod;
  const payment = order.payments?.[0];
  if (payment?.method) return payment.method;
  return null;
}
