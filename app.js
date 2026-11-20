
const SUPABASE_URL = "https://inrqvnddcjaarjrwqbei.supabase.co";
const SUPABASE_KEY = "sb_publishable_OuYXRM31Ih71RVCswfTOsw_S9zXTXMU";

const sb = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const CART_KEY = "prescott_cart_v1";

const readCart = () => {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY) || "[]");
  } catch {
    return [];
  }
};

const saveCart = cart => {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  updateCount();
};

const money = n => "$" + Number(n).toFixed(2);

function esc(s) {
  return String(s ?? "").replace(/[&<>"']/g, c => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  }[c]));
}

function updateCount() {
  const el = document.getElementById("cart-count");
  if (el) {
    el.textContent = readCart().reduce((s, x) => s + x.qty, 0);
  }
}

function toast(msg) {
  const el = document.getElementById("toast");
  if (!el) return;
  el.textContent = msg;
  el.style.display = "block";
  setTimeout(() => el.style.display = "none", 2200);
}

document.querySelectorAll(".menu-toggle").forEach(b => {
  b.addEventListener("click", () => {
    document.querySelector(".site-header nav")?.classList.toggle("open");
  });
});

/* TIENDA */

async function loadShop() {
  const container = document.getElementById("products-container");
  if (!container) return;

  const { data, error } = await sb
    .from("products")
    .select("*")
    .eq("active", true);

  if (error) {
    container.innerHTML = "<p>No se pudo cargar la tienda.</p>";
    console.error(error);
    return;
  }

  if (!data || !data.length) {
    container.innerHTML = "<p>Próximamente nuevas piezas.</p>";
    return;
  }

  // Orden de categorías
  const categoryOrder = ["Camisas", "Camisetas", "Pantalones", "Accesorios", "Otros"];

  data.sort((a, b) => {
    const ai = categoryOrder.indexOf(a.category);
    const bi = categoryOrder.indexOf(b.category);
    return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
  });

  const categories = [...new Set(data.map(p => p.category || "Otros"))];

  // Imágenes específicas por color
  function colorImage(product, color) {
    const name = product.name.toUpperCase();

    if (name === "SIENNA") {
      if (color === "Gris oscuro")
        return "assets/sienna-gris-oscuro.jpeg";

      if (color === "Verde olivo")
        return "assets/sienna-verde-olivo.jpeg";
    }

    if (name === "MILANO") {
      if (color === "Blanco")
        return "assets/milano-blanco.jpeg";

      if (color === "Celeste")
        return "assets/milano-celeste.jpeg";
    }

    return product.image_url || "";
  }

  container.innerHTML = categories.map(category => {
    const products = data.filter(p => (p.category || "Otros") === category);

    return `
      <h2>${esc(category)}</h2>

      <div class="product-grid">

        ${products.map(p => {
          const sizes = Array.isArray(p.sizes) ? p.sizes : [];
          const colors = Array.isArray(p.colors) ? p.colors : [];

          const firstColor = colors[0] || "Único";
          const firstImage = colorImage(p, firstColor);

          return `
            <article class="product-card" data-product="${esc(p.name)}">

              <div class="product-image">
                ${
                  firstImage
                    ? `<img class="product-photo"
                        src="${esc(firstImage)}"
                        alt="${esc(p.name)}">`
                    : `<div class="product-placeholder"></div>`
                }
              </div>

              <div class="product-info">
                <div>
                  <h3>${esc(p.name)}</h3>
                  <p>${esc(p.description || "")}</p>
                </div>
                <strong>${money(p.price)}</strong>
              </div>

              ${
                colors.length
                  ? `<label>Color
                      <select class="color-select">
                        ${colors.map(c => `<option>${esc(c)}</option>`).join("")}
                      </select>
                    </label>`
                  : ""
              }

              ${
                sizes.length
                  ? `<label>Talla
                      <select class="size-select">
                        ${sizes.map(s => `<option>${esc(s)}</option>`).join("")}
                      </select>
                    </label>`
                  : ""
              }

              <button class="button dynamic-add">
                Añadir al carrito
              </button>

            </article>
          `;
        }).join("")}

      </div>
    `;
  }).join("");

  // Cambiar imagen al seleccionar color
  container.querySelectorAll(".product-card").forEach(card => {
    const product = data.find(p => p.name === card.dataset.product);
    const colorSelect = card.querySelector(".color-select");
    const image = card.querySelector(".product-photo");

    if (colorSelect && image && product) {
      colorSelect.addEventListener("change", () => {
        image.src = colorImage(product, colorSelect.value);
      });
    }
  });

  // Añadir al carrito
  container.querySelectorAll(".dynamic-add").forEach(button => {
    button.addEventListener("click", () => {
      const card = button.closest(".product-card");
      const product = data.find(p => p.name === card.dataset.product);

      const color = card.querySelector(".color-select")?.value || "Único";
      const size = card.querySelector(".size-select")?.value || "Única";

      addToCart(product, color, size);
    });
  });
}

function addToCart(product, color, size) {
  const cart = readCart();

  const found = cart.find(x =>
    x.product === product.name &&
    x.color === color &&
    x.size === size
  );

  if (found) {
    found.qty++;
  } else {
    cart.push({
      product: product.name,
      color,
      size,
      price: Number(product.price),
      qty: 1,
      image: product.image_url || ""
    });
  }

  saveCart(cart);
  toast(product.name + " añadido a tu bolsa");
}

/* CARRITO */

function renderCart() {
  const wrap = document.getElementById("cart-items");
  if (!wrap) return;

  const cart = readCart();

  if (!cart.length) {
    wrap.innerHTML = `
      <p class="empty">
        Tu bolsa está vacía.
        <a class="text-link" href="tienda.html">Explorar tienda ↗</a>
      </p>
    `;
    document.getElementById("cart-total").textContent = money(0);
    return;
  }

  wrap.innerHTML = cart.map((x, i) => `
    <div class="cart-row">
      <div>
        <h3>${esc(x.product)}</h3>
        <p>${esc(x.color)} · Talla ${esc(x.size)}</p>
        <p>${money(x.price)} c/u</p>
      </div>

      <div class="qty-controls">
        <button data-action="minus" data-i="${i}">−</button>
        ${x.qty}
        <button data-action="plus" data-i="${i}">+</button>

        <p><strong>${money(x.price * x.qty)}</strong></p>

        <button data-action="remove" data-i="${i}">Eliminar</button>
      </div>
    </div>
  `).join("");

  document.getElementById("cart-total").textContent = money(
    cart.reduce((s, x) => s + x.price * x.qty, 0)
  );

  wrap.querySelectorAll("button").forEach(button => {
    button.addEventListener("click", () => {
      const cart = readCart();
      const i = Number(button.dataset.i);
      const action = button.dataset.action;

      if (action === "plus") cart[i].qty++;
      if (action === "minus") cart[i].qty--;

      if (action === "remove" || cart[i].qty <= 0) {
        cart.splice(i, 1);
      }

      saveCart(cart);
      renderCart();
    });
  });
}

/* ENVIAR PEDIDO A SUPABASE */

const form = document.getElementById("order-form");

if (form) {
  form.addEventListener("submit", async e => {
    e.preventDefault();

    const cart = readCart();

    if (!cart.length) {
      alert("Tu carrito está vacío.");
      return;
    }

    const button = form.querySelector('button[type="submit"]');
    const originalText = button.textContent;

    button.disabled = true;
    button.textContent = "Enviando pedido...";

    const formData = new FormData(form);
    const total = cart.reduce((s, x) => s + x.price * x.qty, 0);

    try {
      /* Crear pedido */

      const { data: order, error: orderError } = await sb
        .from("orders")
        .insert({
          customer_name: formData.get("name"),
          phone: formData.get("phone"),
          address: formData.get("address"),
          notes: formData.get("notes") || "",
          total: total,
          status: "Pendiente"
        })
        .select()
        .single();

      if (orderError) throw orderError;

      /* Guardar productos del pedido */

      const items = cart.map(x => ({
        order_id: order.id,
        product_name: x.product,
        color: x.color,
        size: x.size,
        quantity: x.qty,
        unit_price: x.price
      }));

      const { error: itemsError } = await sb
        .from("order_items")
        .insert(items);

      if (itemsError) {
        /* Si falla guardar los productos, eliminar el pedido incompleto */
        await sb.from("orders").delete().eq("id", order.id);
        throw itemsError;
      }

      alert("¡Pedido enviado correctamente! Prescott Club se pondrá en contacto contigo.");

      saveCart([]);
      form.reset();
      renderCart();

    } catch (error) {
      console.error(error);
      alert("Error al enviar el pedido: " + (error.message || "Inténtalo nuevamente."));
    } finally {
      button.disabled = false;
      button.textContent = originalText;
    }
  });
}

updateCount();
loadShop();
renderCart();
