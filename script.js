const SELLER_WHATSAPP = "919321456084";

const cart = new Map();

const cartItemsElement = document.querySelector("#cart-items");
const cartTotalElement = document.querySelector("#cart-total");
const cartCountElement = document.querySelector(".cart-count");
const checkoutForm = document.querySelector("#checkout-form");

const orderStatus = document.createElement("p");
orderStatus.id = "order-status";
orderStatus.setAttribute("role", "status");
checkoutForm.append(orderStatus);

const toast = document.createElement("div");
toast.className = "cart-toast";
toast.setAttribute("role", "status");
toast.setAttribute("aria-live", "polite");
document.body.append(toast);

let toastTimer;

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");

  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.classList.remove("show");
  }, 2200);
}

function renderCart() {
  cartItemsElement.replaceChildren();

  if (cart.size === 0) {
    const emptyMessage = document.createElement("p");
    emptyMessage.className = "empty-cart";
    emptyMessage.textContent = "Your cart is waiting for something delicious.";
    cartItemsElement.append(emptyMessage);
  }

  let total = 0;
  let itemCount = 0;

  for (const [name, item] of cart) {
    total += item.price * item.quantity;
    itemCount += item.quantity;

    const row = document.createElement("div");
    row.className = "cart-item";

    const details = document.createElement("div");
    details.className = "cart-item-details";

    const itemName = document.createElement("strong");
    itemName.textContent = name;

    const itemPrice = document.createElement("span");
    itemPrice.textContent = `₹${item.price * item.quantity}`;

    details.append(itemName, itemPrice);

    const quantityControls = document.createElement("div");
    quantityControls.className = "quantity-controls";

    const decreaseButton = document.createElement("button");
    decreaseButton.type = "button";
    decreaseButton.textContent = "−";
    decreaseButton.setAttribute("aria-label", `Remove one ${name}`);
    decreaseButton.dataset.action = "decrease";
    decreaseButton.dataset.item = name;

    const quantity = document.createElement("span");
    quantity.textContent = item.quantity;
    quantity.setAttribute("aria-label", `Quantity: ${item.quantity}`);

    const increaseButton = document.createElement("button");
    increaseButton.type = "button";
    increaseButton.textContent = "+";
    increaseButton.setAttribute("aria-label", `Add one ${name}`);
    increaseButton.dataset.action = "increase";
    increaseButton.dataset.item = name;

    quantityControls.append(decreaseButton, quantity, increaseButton);
    row.append(details, quantityControls);
    cartItemsElement.append(row);
  }

  cartTotalElement.textContent = `₹${total}`;
  cartCountElement.textContent = itemCount;
  cartCountElement.setAttribute("aria-label", `${itemCount} items in cart`);
}

document.querySelectorAll(".add-to-cart").forEach((button) => {
  button.addEventListener("click", () => {
    const name = button.dataset.item;
    const price = Number(button.dataset.price);

    if (!name || !Number.isFinite(price)) return;

    const currentItem = cart.get(name);

    if (currentItem) {
      currentItem.quantity += 1;
    } else {
      cart.set(name, { price, quantity: 1 });
    }

    orderStatus.textContent = "";
    renderCart();
    showToast(`${name} added to your cart!`);
  });
});

cartItemsElement.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-action]");
  if (!button) return;

  const name = button.dataset.item;
  const item = cart.get(name);
  if (!item) return;

  if (button.dataset.action === "increase") {
    item.quantity += 1;
  } else if (button.dataset.action === "decrease") {
    item.quantity -= 1;

    if (item.quantity <= 0) {
      cart.delete(name);
    }
  }

  renderCart();
});

checkoutForm.addEventListener("submit", (event) => {
  event.preventDefault();
  orderStatus.textContent = "";

  if (cart.size === 0) {
    orderStatus.textContent = "Please add at least one dish to your cart.";
    return;
  }

  const selectedPayment = checkoutForm.querySelector(
    'input[name="payment"]:checked'
  )?.value;

  if (selectedPayment !== "Cash on Delivery") {
    orderStatus.textContent = "Cash on Delivery is the available payment option.";
    return;
  }

  const whatsappNumber = SELLER_WHATSAPP.replace(/\D/g, "");

  if (!/^\d{10,15}$/.test(whatsappNumber)) {
    orderStatus.textContent =
      "Please check the seller's WhatsApp number in script.js.";
    return;
  }

  const customerName = checkoutForm.elements.name.value.trim();
  const customerPhone = checkoutForm.elements.phone.value.trim();
  const customerAddress = checkoutForm.elements.address.value.trim();

  const orderLines = [];

  for (const [name, item] of cart) {
    orderLines.push(
      `${item.quantity} x ${name} — ₹${item.price * item.quantity}`
    );
  }

  const total = [...cart.values()].reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const message = [
    "NEW ORDER — Chacha Bhatija Restaurant",
    "",
    `Name: ${customerName}`,
    `Customer phone: ${customerPhone}`,
    `Delivery address: ${customerAddress}`,
    `Payment: ${selectedPayment}`,
    "",
    "Order:",
    ...orderLines,
    "",
    `Total: ₹${total}`,
  ].join("\n");

  const whatsappUrl =
    `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;

  window.open(whatsappUrl, "_blank", "noopener,noreferrer");
  orderStatus.textContent =
    "WhatsApp is opening with your order. Review it there and tap Send to place your order.";
});

renderCart();