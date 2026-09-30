// Nexa Store — client-side routing + application state
const PRODUCTS = [
 {id:1,name:"Minimal Watch",category:"Accessories",price:79,image:"https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=700&q=70"},
 {id:2,name:"Everyday Sneakers",category:"Footwear",price:94,image:"https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=700&q=70"},
 {id:3,name:"Classic Headphones",category:"Tech",price:129,image:"https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=700&q=70"},
 {id:4,name:"Leather Backpack",category:"Bags",price:115,image:"https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=700&q=70"},
 {id:5,name:"Running Jacket",category:"Clothing",price:88,image:"https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=700&q=70"},
 {id:6,name:"Desk Lamp",category:"Home",price:49,image:"https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=700&q=70"},
 {id:7,name:"Travel Bottle",category:"Accessories",price:29,image:"https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=700&q=70"},
 {id:8,name:"Smart Speaker",category:"Tech",price:69,image:"https://images.unsplash.com/photo-1589492477829-5e65395b66cc?auto=format&fit=crop&w=700&q=70"}
];

const state = {
 cart: JSON.parse(localStorage.getItem("nexa-cart") || "[]"),
 query: "",
 category: "All"
};
const app = document.querySelector("#app");
const cartCount = document.querySelector("#cartCount");

const money = n => `$${n.toFixed(2)}`;
const findProduct = id => PRODUCTS.find(p => p.id === Number(id));

function saveCart(){ localStorage.setItem("nexa-cart", JSON.stringify(state.cart)); updateCartCount(); }
function updateCartCount(){ cartCount.textContent = state.cart.reduce((s,i)=>s+i.qty,0); }
function addToCart(id){
 const item=state.cart.find(i=>i.id===Number(id));
 if(item) item.qty++; else state.cart.push({id:Number(id),qty:1});
 saveCart(); toast("Added to cart"); render();
}
function changeQty(id,delta){
 const item=state.cart.find(i=>i.id===Number(id)); if(!item)return;
 item.qty += delta; if(item.qty<=0) state.cart=state.cart.filter(i=>i.id!==Number(id));
 saveCart(); render();
}

function navigate(path){ location.hash=path; }
function router(){
 const path=location.hash.slice(1)||"/";
 if(path==="/") renderHome();
 else if(path==="/products") renderProducts();
 else if(path==="/about") renderAbout();
 else if(path==="/cart") renderCart();
 else renderNotFound();
 window.scrollTo(0,0);
}

function productCard(p){
 return `<article class="product-card">
   <img src="${p.image}" alt="${p.name}" loading="lazy" width="700" height="700">
   <div class="product-info">
    <small>${p.category}</small><h3>${p.name}</h3><div class="price">${money(p.price)}</div>
    <button class="btn btn-dark" data-add="${p.id}">Add to Cart</button>
   </div>
 </article>`;
}

function renderHome(){
 app.innerHTML=`<section class="hero">
   <div class="hero-copy"><p class="eyebrow">CURATED • SIMPLE • MODERN</p><h1>Better products for everyday life.</h1>
   <p>Discover a focused collection of useful products, presented in a fast and responsive shopping experience.</p>
   <div class="actions"><a class="btn btn-dark" href="#/products" data-link>Shop Collection</a><a class="btn btn-light" href="#/about" data-link>Our Story</a></div></div>
   <div class="hero-image" role="img" aria-label="Featured watch"></div>
 </section>
 <section class="section"><div class="section-head"><div><p class="eyebrow">FEATURED</p><h2>Popular products</h2></div><a class="btn btn-light" href="#/products" data-link>View all</a></div>
 <div class="product-grid">${PRODUCTS.slice(0,4).map(productCard).join("")}</div></section>`;
}

function renderProducts(){
 const categories=["All",...new Set(PRODUCTS.map(p=>p.category))];
 const filtered=PRODUCTS.filter(p=>(state.category==="All"||p.category===state.category)&&p.name.toLowerCase().includes(state.query.toLowerCase()));
 app.innerHTML=`<section class="section"><div class="section-head"><div><p class="eyebrow">COLLECTION</p><h2>All products</h2></div><span class="muted">${filtered.length} items</span></div>
 <div class="product-toolbar"><input class="search" id="search" value="${escapeHTML(state.query)}" placeholder="Search products..." aria-label="Search products">
 <select class="select" id="category" aria-label="Filter by category">${categories.map(c=>`<option ${c===state.category?"selected":""}>${c}</option>`).join("")}</select></div>
 <div class="product-grid">${filtered.length?filtered.map(productCard).join(""):`<div class="empty" style="grid-column:1/-1">No products match your search.</div>`}</div></section>`;
 document.querySelector("#search").addEventListener("input",e=>{state.query=e.target.value;renderProducts()});
 document.querySelector("#category").addEventListener("change",e=>{state.category=e.target.value;renderProducts()});
}

function renderAbout(){
 app.innerHTML=`<section class="section"><p class="eyebrow">ABOUT NEXA</p><h2>Designed as a real-world web architecture exercise.</h2>
 <div class="about-grid" style="margin-top:1.5rem"><article class="panel"><h3>Modular frontend</h3><p class="muted">The application separates product data, state management, routing, rendering and UI helpers into reusable JavaScript functions.</p></article>
 <article class="panel"><h3>Performance minded</h3><p class="muted">Images use responsive query parameters, lazy loading is applied to product images, and only the required view is rendered for each route.</p></article>
 <article class="panel"><h3>Production ready</h3><p class="muted">The project is static-host friendly and can be deployed to Vercel, Netlify or GitHub Pages. Cart state persists through localStorage.</p></article></div></section>`;
}

function renderCart(){
 const detailed=state.cart.map(i=>({...i,product:findProduct(i.id)})).filter(i=>i.product);
 const total=detailed.reduce((s,i)=>s+i.product.price*i.qty,0);
 app.innerHTML=`<section class="section"><div class="section-head"><div><p class="eyebrow">YOUR BAG</p><h2>Shopping cart</h2></div></div>
 ${detailed.length?`<div class="checkout-grid"><div class="panel">${detailed.map(i=>`<div class="cart-row"><img src="${i.product.image}" alt="${i.product.name}"><div><strong>${i.product.name}</strong><p class="muted">${money(i.product.price)}</p><div class="qty"><button data-qty="${i.id}" data-delta="-1">−</button><span>${i.qty}</span><button data-qty="${i.id}" data-delta="1">+</button></div></div><strong>${money(i.product.price*i.qty)}</strong></div>`).join("")}</div>
 <aside class="panel summary"><h3>Order summary</h3><div class="summary-line"><span>Subtotal</span><strong>${money(total)}</strong></div><div class="summary-line"><span>Shipping</span><strong>Free</strong></div><div class="summary-line total"><span>Total</span><strong>${money(total)}</strong></div><button class="btn btn-dark" data-checkout>Checkout</button></aside></div>`:`<div class="empty panel"><h3>Your cart is empty</h3><p>Explore the collection and add something you like.</p><a class="btn btn-dark" href="#/products" data-link style="margin-top:1rem">Browse Products</a></div>`}</section>`;
}

function renderNotFound(){app.innerHTML=`<section class="section empty"><h2>Page not found</h2><a class="btn btn-dark" href="#/" data-link>Go Home</a></section>`}

function escapeHTML(v){const d=document.createElement("div");d.textContent=v??"";return d.innerHTML}
function toast(message){const t=document.createElement("div");t.className="toast";t.textContent=message;document.body.appendChild(t);setTimeout(()=>t.remove(),1800)}

document.addEventListener("click",e=>{
 const add=e.target.closest("[data-add]"); if(add){addToCart(add.dataset.add);return}
 const qty=e.target.closest("[data-qty]"); if(qty){changeQty(qty.dataset.qty,Number(qty.dataset.delta));return}
 const checkout=e.target.closest("[data-checkout]"); if(checkout){toast("Demo checkout — payment integration can be added here");}
});
window.addEventListener("hashchange",router);
updateCartCount(); router();
