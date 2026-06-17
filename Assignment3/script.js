// === CONSTANTS ===

// instantiating the uniform price of each of the shoes
const PRICE = 80;

// the vertical distance in pixels the slider knob moves
const NOD_TRAVEL = 30;

// the amount of repeats the user needs to nod the knob before confirming the purchase
const NOD_TARGET = 4;

// the 'impulse?' text revealed on the slider
// couple things to note here: 
//  its a string in js so we're using html syntax instead of js
//  \u2019 is the unicode for a curly apostrophe
//  \u00a0 is the unicode for a'non-breaking space', which is different to a normal space as it explicitly prevents the browser from wrapping the text at that point. handy for forceful formatting of text.
const IMPULSE_HTML = '<p class="impulse-copy">This isn\u2019t an <span class="hot">impulse\u00a0buy</span>, right?</p>';

// this const is specifically for codewriting convinience, as it makes every future mention of the $ symbol in the js file mean 'document.querySelector'
const $ = (sel) => document.querySelector(sel);

// very hard to wrap my head around but its a two parter
// before =>: always keeps a record of what the x position of the slider knob is, as well as the furthest left and right coordinate on the slider (these two are fixed)
// after =>: two nested js functions that output the position of the slider knob, but limit it to the furthest left and right coordinate to prevent the knob from being draggable from off the slider.
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

// === SHOE IMAGES ===

// once again in html syntax as once this function activated by js code later on, it generates the visual element of the shoe image in its requested location. will output a different shoe depending on its attached ID
function makeSneaker(id) {
    return `<img class="shoe" src="Shoes/shoe-${id}.jpg" alt="Shoe ${id}" draggable="false">`;
}

// in a numerical array, attaches IDs from 0-10 for the 11 shoes being sold on the website 
const SHOES = Array.from({ length: 11 }, (_, i) => i);   // [0, 1, 2, … 10]

// === CENTRAL STATE ===

// a core object that tracks the various states of the website, written up in their default states
const state = {  
  inCart: new Set(),   // ids of the shoes currently in the cart. 'Set' prevents duplicate shoes from being thrown into the cart, preventing looping errors later on in the code
  total: 0,            // the subtotal in dollars
  phase: "idle",       // one of the three different states for the slider: "idle" → "slid" → "confirmed"
  knobX: 0,            // how much the knob is offset on the slider horizontally
};

// === LOOKUP TABLE ===
// this is pretty much letting the js know that these website elements are going to be called upon repeatedly, so for convinience we'll refer to them using these variables

// the ui showing off all the shoes on the left (the rest of the variables are self explanatory)
const shelf       = $("#shelf");  
const cart        = $("#cart");  
const slider      = $("#slider");   
const knob        = $("#knob");   
const sliderLabel = $("#sliderLabel");   
// this is the whole subtotal block
const subtotal    = $("#subtotal");   
// this is specifically the span in html that contains just the calculated then displayed dollar number, WITHIN the subtotal block
const subtotalVal = $("#subtotalValue"); 

// === KNOB ICONS ===

// returns nothing, used for the idle slider state
const ICON_BLANK = "";

// the up and down svg arrows for the nodding knob
const ICON_NOD = `
  <svg viewBox="0 0 24 24" fill="none" stroke="#111" stroke-width="2.6"
       stroke-linecap="round" stroke-linejoin="round">
    <path d="M12 4v16"/>
    <path d="M7 8l5-4 5 4"/>
    <path d="M7 16l5 4 5-4"/>
  </svg>`;

// the svg tick icon when the purchase is confirmed by the user
  const ICON_CHECK = `
  <svg viewBox="0 0 24 24" fill="none" stroke="#111" stroke-width="3"
       stroke-linecap="round" stroke-linejoin="round">
    <path d="M5 13l4 4L19 7"/>
  </svg>`;

// ===SHELF===

SHOES.forEach((shoe, id) => {   // repeats this process for every shoe, id 0 to 11
  const card = document.createElement("div");   // create a new div in the html to contain the following:
  card.className = "product";   // all cards recieve .product class for the CSS to style it as a card
  card.draggable = true;    // enables dragging
  card.dataset.id = id; // while the shoe has an id, the new div eleemnt doesnt yet, this just stores the js id onto the html div
  card.style.setProperty("--shake-delay", (Math.random() * -0.28) + "s"); // this is an equation to randomly delay the shake animation to prevent the impulse shake from moving in unison
  card.innerHTML = makeSneaker(id);   // match the card id with the corresponding shoe photo
  shelf.appendChild(card);   // add the finished card to the shelf

    
  // the following if function only activates in between the creation of the first and second shoe, as to position it at the top right of the shelf visually  

  if (id === 0) {   // only if the code above is running for the first shoe, then:
    const btn = document.createElement("button");   // make a button element
    btn.className = "reset-btn";   // give it the .reset-btn class for unique styling in css
    btn.type = "button";   // have it function as a mappable button, since in html there are actually 3 differnt types (weird)
    btn.innerHTML = ` 
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
           stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
        <path d="M3 12a9 9 0 1 1 2.636 6.364"/>
        <path d="M3 21v-5h5"/>
      </svg>
      Reset`;   // the svg reset icon and the word 'reset' inside the button, formatted in html syntax
    btn.addEventListener("click", resetEverything);   // when clicked, run the resetEverything function, coded below
    shelf.appendChild(btn);   // after all that, finally add the reset button to the shelf
  }
});

// === DRAG AND DROP ===

let dragInfo = null; // null is simply the default state of this variable, when a shoe IS being dragged between the cart and the shelf, it will output the ID and the origin of drag (either shelf or cart)

document.addEventListener("dragstart", (e) => { //when the user starts to drag an item, treat it as an event and capture all the obtainable data in that moment to then do the following to:
    const el = e.target.closest("[data-id]"); // locate and target the nearest draggable shoe from the drag point using data-id
    const from = el.classList.contains("cart-item") ? "cart" : "shelf"; // this identifies whether the drag is originating from the shelf or the cart using the class 'cart-item'
    dragInfo = { id: Number(el.dataset.id), from }; // remembers both the shoe id and the origin
     e.dataTransfer.setData("text/plain", el.dataset.id); // this code is fulfilling a weird drag criteria specific to firefox? ensures compatibility with their browser
     e.dataTransfer.effectAllowed = "move"; // changes the default cursor to a move cursor

    if (!el || state.phase === "confirmed") return; // this if statement completely locks the drag functionality when the slider is in the confirmed state
});

document.addEventListener("dragend", () => { // this runs after the shoe has been dropped
    dragInfo = null; // resets the dragInfo variable to forget all the retained information above
    cart.classList.remove("is-over"); // removes the cart's subtle hover styling
});

// when the CART is the "add" drop target
cart.addEventListener("dragover", (e) => {   // fires while something is dragged over the cart
  if (dragInfo && dragInfo.from === "shelf") {   // only reacts if something from the shelf is dragged in, not something from the cart being moved back into the cart
    e.preventDefault(); // tells the browser that the user is allowed to drop the item in this zone
    cart.classList.add("is-over");   // adding a class to verify that it's a valid drop spot
  }
});
cart.addEventListener("dragleave", (e) => {   // fires when the pointer leaves the cart area
  // only clears the hover highlight when the pointer truly exits the cart box
  if (!cart.contains(e.relatedTarget)) cart.classList.remove("is-over");
});
cart.addEventListener("drop", (e) => {   // fires when something is actually dropped on the cart
  e.preventDefault();   // prevents the browser from running its default response to a drop behaviour
  cart.classList.remove("is-over");   // removes the hover highlight
  if (dragInfo && dragInfo.from === "shelf") addToCart(dragInfo.id);   // if a shelf shoe was dropped, add it to the cart
});

// when the SHELF is the "remove" drop target
shelf.addEventListener("dragover", (e) => {   // fires while a shoe is dragged over the shelf
  if (dragInfo && dragInfo.from === "cart") e.preventDefault();   // allow a drop only if a cart shoe is being dragged back, not if a shoe from the shelf is being dropped back onto the shelf
});
shelf.addEventListener("drop", (e) => {   // fires when something is dropped on the shelf
  e.preventDefault();   // stop the browser's default drop behaviour, same as before
  if (dragInfo && dragInfo.from === "cart") removeFromCart(dragInfo.id);   // if a cart shoe was dropped here, remove it from the cart
});

// === ADD AND REMOVE ===

function applyScatter(el) {   // assign each shoe in the cart a random tilt and nudge to look more organic and 'thrown in'
  const angle = (Math.random() - 0.5) * 16;   // random selection from −8° to +8° of rotation
  const tx    = (Math.random() - 0.5) * 20;   // random selection from −10px to +10px of xpos
  const ty    = (Math.random() - 0.5) * 14;   // random selection from −7px  to +7px of ypos
  el.style.setProperty("--angle", angle + "deg");   // store the random tilt as --angle so CSS can recognise it
  el.style.setProperty("--tx",    tx    + "px");   // store the random xpos as --tx
  el.style.setProperty("--ty",    ty    + "px");   // store the random ypos as --ty
}

function addToCart(id) {   // add the shoe with this id to the cart (this function is ran earlier when a shelf shoe is dropped into the cart)
  if (state.inCart.has(id)) return; // orevents the same shoe from being added in the cart twice
  state.inCart.add(id);   // record this shoe as being in the cart array

  shelf.querySelector(`.product[data-id="${id}"]`)?.classList.add("is-used"); // fades the shelf card to 25% opacity after the shoe is dragged into cart, also disables any functionality previously attached to the card

  // this is to create the card copy of the shoe that will be dragged and dropped into the card
  const item = document.createElement("div");   // creates a new <div> for the shoe-going-to-cart copy
  item.className = "cart-item";   // give it the .cart-item class for styling
  item.draggable = true;   // make it draggable (so it can be dragged back out)
  item.dataset.id = id;   // tag it with the same shoe id as its original
  item.innerHTML = makeSneaker(id);   // insert the corresponsing product photo inside it
  applyScatter(item); // toss it in at a random angle
  cart.appendChild(item);   // add the shoe copy into the cart

  setTotal(state.total + PRICE, +PRICE);   // raises the subtotal amount by $80 for inputting a shoe and displays a "+$80" text
  cart.classList.add("has-items");
  refreshSlider();
}

function removeFromCart(id) {   // remove the shoe with this id from the cart
  if (!state.inCart.has(id)) return;   // do nothing if it isn't actually in the cart
  state.inCart.delete(id);   // forget that this shoe was in the cart using its id

  shelf.querySelector(`.product[data-id="${id}"]`)?.classList.remove("is-used");   // bring the shelf card back to full opacity from 25%
  cart.querySelector(`.cart-item[data-id="${id}"]`)?.remove();   // delete the shoe's copy from the cart

  setTotal(state.total - PRICE, -PRICE);   // lower the subtotal by $80 and show a "−$80" text

  // this code runs when the cart returns to a completely empty state
  if (state.inCart.size === 0) {   // if cart items equal nothing
    cart.classList.remove("has-items");         // bring back the hint
    if (state.phase !== "confirmed") resetSlider();   // reset the slider too (unless the purchase was already confirmed)
  }
  refreshSlider();   // re-check whether the confirm slider should be enabled
}

// === SUBTOTAL ANIMATION ===

function setTotal(newTotal, delta) {   // updates the subtotal; delta represents the positive or negative change (+80 or −80)
  const from = state.total;   // stores the old total to animate away from
  state.total = newTotal;   // stores the new total in the state

  countTo(subtotalVal, from, newTotal, 450);   // animates the displayed number from old to new over 450ms

  // (b) floating delta text
  const chip = document.createElement("span");   // makes a new <span> for the floating "+$80"/"−$80" label
  chip.className = "delta " + (delta > 0 ? "delta--up" : "delta--down");   // picks the up (green) or down (red) style based on whether the change is adding or subtracting
  chip.textContent = (delta > 0 ? "+$" : "\u2212$") + Math.abs(delta);   // set its text, e.g. "+$80" or "−$80" (\u2212 is a real minus sign, not just a hyphen)
  subtotal.appendChild(chip);   // place the text next to the subtotal
  chip.addEventListener("animationend", () => chip.remove());   // once its float animation ends, delete the text

}

function countTo(el, from, to, duration) {   // smoothly animates a number in an element from `from` to `to`
  const start = performance.now();   // records the exact start time
  function frame(now) {   // this will run once per screen refresh; `now` is the current time
    const t     = clamp((now - start) / duration, 0, 1);   // progress from 0 (start) to 1 (done)
    const eased = 1 - Math.pow(1 - t, 3); // easing values
    const value = from + (to - from) * eased;   // the in-between number for this moment
    el.textContent = "$" + value.toFixed(2);   // format it with a dollar sign and 2 decimal places
    if (t < 1) requestAnimationFrame(frame);   // if the animation is yet to finish, schedule the next frame
    else el.textContent = "$" + to.toFixed(2); // land exactly on target
  }
  requestAnimationFrame(frame);   // kicks off the animation loop
}

// === SLIDER ===

let knobDrag = null;

// enables or disables the slider whether the cart has shoes or not
function refreshSlider() {
  if (state.phase !== "idle") return;
  const enabled = state.inCart.size > 0;
  slider.classList.toggle("is-disabled", !enabled);
  slider.setAttribute("aria-disabled", String(!enabled));
}

// moves the knob using a css transform property, xpos for sliding, ypos for nodding
function placeKnob(x, y = 0) {
  state.knobX = x;
  knob.style.transform = `translate(${x}px, ${y}px)`;
  const kw = knob.offsetWidth || 48;
  slider.style.setProperty("--knob-right", (8 + kw + x) + "px");
  slider.style.setProperty("--knob-left",  (8 + x)      + "px");
}

// toggles the impulse buy state, inducing shoe shake, red subtotal, swaps the text label on the slider
function setImpulse(on) {
  shelf.classList.toggle("is-panic", on);
  subtotal.classList.toggle("is-panic", on);
}

// these lines of code runs passing checks to make sure it makes sense for the user to be able to drag the knob across the slider
knob.addEventListener("pointerdown", (e) => {
  if (state.phase === "confirmed") return;
  if (state.phase === "idle" && state.inCart.size === 0) return;

  knob.setPointerCapture(e.pointerId); // keep receiving moves even off-element
  knob.classList.remove("is-springing");

  const trackW = slider.clientWidth;
  const pad    = 8;
  const maxX   = trackW - knob.offsetWidth - pad * 2;

// these lines of code allows for the text to smoothly transition from its idle state to its impulsive state
  if (state.phase === "idle") {
    const impulseEl = document.createElement("span");
    impulseEl.className = "slider__impulse-text";
    impulseEl.id = "sliderImpulse";
    impulseEl.innerHTML = IMPULSE_HTML;
    slider.appendChild(impulseEl);
    slider.classList.add("is-impulse");
    knobDrag = { axis: "x", startX: e.clientX, startKnobX: state.knobX, maxX };
  } else {
    // phase === "slid": axis decided by first significant movement
    knobDrag = { axis: null, startX: e.clientX, startY: e.clientY, lastY: e.clientY, dir: 0, reversals: 0, maxX };
  }
});

// these lines of code are all related to what is shown while the knob is moving
knob.addEventListener("pointermove", (e) => {
  if (!knobDrag) return;

  // Commit axis on first significant movement
  if (knobDrag.axis === null) {
    const dx = e.clientX - knobDrag.startX;
    const dy = e.clientY - knobDrag.startY;
    if (Math.abs(dx) > 6 || Math.abs(dy) > 6) {
      knobDrag.axis = (Math.abs(dx) > Math.abs(dy) && dx < 0) ? "x-back" : "y";
      knobDrag.startY = e.clientY;
      if (knobDrag.axis === "x-back") {
        const confirmEl = document.createElement("span");
        confirmEl.className = "slider__confirm-text";
        confirmEl.id = "sliderConfirm";
        confirmEl.textContent = "Confirm Purchase";
        slider.appendChild(confirmEl);
        slider.classList.add("is-reverting");
      }
    }
    return;
  }

  if (knobDrag.axis === "x") {
    // specifically for if the knob is sliding right:
    const x = clamp(
      knobDrag.startKnobX + (e.clientX - knobDrag.startX),
      0,
      knobDrag.maxX
    );
    placeKnob(x);
    setImpulse(x > knobDrag.maxX * 0.5);
    if (x >= knobDrag.maxX - 1) lockSlid(knobDrag.maxX);

  } else if (knobDrag.axis === "x-back") {
    // specifically for if the knob is sliding left:
    const x = clamp(knobDrag.maxX + (e.clientX - knobDrag.startX), 0, knobDrag.maxX);
    placeKnob(x);
    if (x <= 0) revertFromSlid();

  } else {
    // specifically for when the knob is being nodded up and down:
    const offset = clamp(e.clientY - knobDrag.startY, -NOD_TRAVEL, NOD_TRAVEL);
    placeKnob(state.knobX, offset);

    const d = e.clientY - knobDrag.lastY;
    if (Math.abs(d) > 4) {
      const dir = d > 0 ? 1 : -1;
      if (knobDrag.dir && dir !== knobDrag.dir) knobDrag.reversals++;
      knobDrag.dir = dir;
      knobDrag.lastY = e.clientY;
      if (knobDrag.reversals >= NOD_TARGET) confirmPurchase();
    }
  }
});

// these lines of code are all related to what happens when the user let goes of the knob
knob.addEventListener("pointerup", () => {
  if (!knobDrag) return;

  if (knobDrag.axis === "x" && state.phase === "idle") {
    knob.classList.add("is-springing");
    placeKnob(0);
    setImpulse(false);
    document.getElementById("sliderImpulse")?.remove();
    slider.classList.remove("is-impulse");
  }
  if (knobDrag.axis === "x-back") {
    if (state.knobX < knobDrag.maxX * 0.5) {
      revertFromSlid();
    } else {
      document.getElementById("sliderConfirm")?.remove();
      slider.classList.remove("is-reverting");
      knob.classList.add("is-springing");
      placeKnob(knobDrag.maxX, 0);
    }
  }
  if ((knobDrag.axis === "y" || knobDrag.axis === null) && state.phase === "slid") {
    knob.classList.add("is-springing");
    placeKnob(state.knobX, 0);
  }
  knobDrag = null;
});

// if the knob is less than 50% slid, reset knob to idle position
function _resetKnobToIdle() {
  state.phase = "idle";
  knobDrag = null;
  setImpulse(false);
  sliderLabel.innerHTML = "Confirm Purchase";
  knob.classList.add("is-springing");
  placeKnob(0, 0);
  knob.innerHTML = ICON_BLANK;
  refreshSlider();
}

function revertFromSlid() {
  document.getElementById("sliderConfirm")?.remove();
  slider.classList.remove("is-reverting", "is-slid");
  _resetKnobToIdle();
}

// if the knob is more than 50% slid, progress knob to slid position
function lockSlid(maxX) {
  state.phase = "slid";
  knobDrag = null;
  placeKnob(maxX, 0);
  setImpulse(true);
  document.getElementById("sliderImpulse")?.remove();
  sliderLabel.innerHTML = IMPULSE_HTML;
  slider.classList.remove("is-impulse");
  slider.classList.add("is-slid");
  knob.innerHTML = ICON_NOD;
}

// these lines of code are all for the final confirmed state
function confirmPurchase() {
  state.phase = "confirmed";
  knobDrag = null;
  shelf.classList.remove("is-panic");
  subtotal.classList.remove("is-panic");
  subtotal.classList.add("is-confirmed");
  cart.classList.add("is-confirmed");
  slider.classList.add("is-confirmed");
  sliderLabel.textContent = "Purchase Confirmed";
  knob.innerHTML = ICON_CHECK;
  knob.classList.add("is-springing");
  placeKnob(state.knobX, 0);
  document.querySelectorAll("[data-id]").forEach((el) => {
    el.draggable = false;
  });
}

function resetSlider() {
  document.getElementById("sliderImpulse")?.remove();
  slider.classList.remove("is-slid", "is-impulse");
  _resetKnobToIdle();
}

// === FULL RESET ===

function resetEverything() {   // this function wipes the whole app back to its initial state
  cart.querySelectorAll(".cart-item").forEach((el) => el.remove());   // deletes every shoe copy from the cart

  shelf.querySelectorAll(".product.is-used").forEach((el) => {   // goes through every "used" (faded) shelf card
    el.classList.remove("is-used");   // un-fades them
  });
  document.querySelectorAll("[data-id]").forEach((el) => {   // goes through every shoe element
    el.draggable = true;   // makes them draggable again
  });

  state.inCart.clear();   // empties the set of in-cart shoe ids
  state.total = 0;   // resets the subtotal to $0
  state.phase = "idle";   // set the slider back to its idle state
  state.knobX = 0;   // reset the knob's stored position

  subtotalVal.textContent = "$0.00";   // show $0.00 in the subtotal
  subtotal.classList.remove("is-panic", "is-confirmed");   // remove the red/green colours
  cart.classList.remove("has-items", "is-confirmed", "is-over");   // return the cart hint text
  document.getElementById("sliderImpulse")?.remove();   // remove the impulse overlay if present
  slider.classList.remove("is-slid", "is-confirmed", "is-disabled", "is-impulse");   // clear all the slider's state classes
  sliderLabel.innerHTML = "Confirm Purchase";   // reset the slider label text
  knob.innerHTML = ICON_BLANK;   // clears the knob icon
  knob.classList.remove("is-springing");   // turns off the glide transition
  placeKnob(0, 0);   // moves the knob back to the start
  refreshSlider();   // re-checks whether the slider should be enabled (now disabled, since cart is empty)
}
