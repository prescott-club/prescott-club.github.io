const CART_KEY="prescott_cart_v1";
const readCart=()=>{try{return JSON.parse(localStorage.getItem(CART_KEY)||"[]")}catch{return []}};
const saveCart=c=>{localStorage.setItem(CART_KEY,JSON.stringify(c));updateCount()};
const money=n=>"$"+Number(n).toFixed(2);
function updateCount(){const el=document.getElementById("cart-count");if(el)el.textContent=readCart().reduce((s,x)=>s+x.qty,0)}
function toast(msg){const el=document.getElementById("toast");if(!el)return;el.textContent=msg;el.style.display="block";setTimeout(()=>el.style.display="none",2200)}
document.querySelectorAll(".menu-toggle").forEach(b=>b.addEventListener("click",()=>document.querySelector(".site-header nav")?.classList.toggle("open")));
document.querySelectorAll(".add-button").forEach(b=>b.addEventListener("click",()=>{const product=b.dataset.product,colorEl=b.dataset.color?document.getElementById(b.dataset.color):null,color=colorEl?colorEl.value:(b.dataset.colorValue||"Único"),size=document.getElementById(b.dataset.size).value,price=Number(b.dataset.price||60);const cart=readCart();const found=cart.find(x=>x.product===product&&x.color===color&&x.size===size);if(found)found.qty++;else cart.push({product,color,size,price,qty:1});saveCart(cart);toast(product+" añadido a tu bolsa")}));
function renderCart(){const wrap=document.getElementById("cart-items");if(!wrap)return;const cart=readCart();wrap.innerHTML="";if(!cart.length)wrap.innerHTML='<p class="empty">Tu bolsa está vacía. <a class="text-link" href="tienda.html">Explorar tienda ↗</a></p>';cart.forEach((x,i)=>{const row=document.createElement("div");row.className="cart-row";row.innerHTML=`<div><h3>${x.product}</h3><p>${x.color} · Talla ${x.size}</p><p>${money(x.price)} c/u</p></div><div class="qty-controls"><button data-action="minus" data-i="${i}">−</button> ${x.qty} <button data-action="plus" data-i="${i}">+</button><p><strong>${money(x.price*x.qty)}</strong></p><button data-action="remove" data-i="${i}">Eliminar</button></div>`;wrap.appendChild(row)});document.getElementById("cart-total").textContent=money(cart.reduce((s,x)=>s+x.price*x.qty,0));wrap.querySelectorAll("button").forEach(b=>b.addEventListener("click",()=>{const c=readCart(),i=Number(b.dataset.i),a=b.dataset.action;if(a==="plus")c[i].qty++;if(a==="minus")c[i].qty--;if(a==="remove"||c[i].qty<=0)c.splice(i,1);saveCart(c);renderCart()}))}
const form=document.getElementById("order-form");if(form)form.addEventListener("submit",e=>{e.preventDefault();const cart=readCart();if(!cart.length){alert("Tu bolsa está vacía.");return}const d=new FormData(form);const lines=cart.map(x=>`${x.product} | ${x.color} | Talla ${x.size} | Cantidad ${x.qty} | ${money(x.price*x.qty)}`).join("%0D%0A");const total=cart.reduce((s,x)=>s+x.price*x.qty,0);const body=`Pedido Prescott Club%0D%0A%0D%0A${lines}%0D%0A%0D%0ATOTAL: ${money(total)}%0D%0A%0D%0ANombre: ${encodeURIComponent(d.get("name"))}%0D%0ATeléfono: ${encodeURIComponent(d.get("phone"))}%0D%0ADirección: ${encodeURIComponent(d.get("address"))}%0D%0ANotas: ${encodeURIComponent(d.get("notes")||"—")}`;window.location.href=`mailto:clubprescott@gmail.com?subject=Nuevo%20pedido%20Prescott%20Club&body=${body}`});


const siennaColor = document.getElementById("sienna-color");
const siennaImage = document.getElementById("sienna-image");

if (siennaColor && siennaImage) {
  function updateSienna() {
    siennaImage.src = siennaColor.value === "Gris oscuro"
      ? "assets/sienna-gris-oscuro.jpeg"
      : "assets/sienna-verde-olivo.jpeg";
  }
  siennaColor.addEventListener("change", updateSienna);
  updateSienna();
}

const milanoColor = document.getElementById("milano-color");
const milanoImage = document.getElementById("milano-image");

if (milanoColor && milanoImage) {
  function updateMilano() {
    milanoImage.src = milanoColor.value === "Blanco"
      ? "assets/milano-blanco.jpeg"
      : "assets/milano-celeste.jpeg";
  }
  milanoColor.addEventListener("change", updateMilano);
  updateMilano();
}


updateCount();renderCart();
