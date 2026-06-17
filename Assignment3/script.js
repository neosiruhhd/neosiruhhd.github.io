// === CONSTANTS ===

// instantiating the uniform price of each of the shoes
const Price = 80;

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
    return `<img class="shoe" src="shoes/shoe-${id}.jpg" alt="Shoe ${id}" draggable="false">`;
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
    btn.setAttribute("aria-label", "Reset cart");   // describe the button for screen readers
    btn.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
           stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
        <path d="M3 12a9 9 0 1 1 2.636 6.364"/>
        <path d="M3 21v-5h5"/>
      </svg>
      Reset`;   // put the circular-arrow icon and the word "Reset" inside the button
    btn.addEventListener("click", resetEverything);   // when clicked, run the resetEverything function
    shelf.appendChild(btn);   // add the reset button to the shelf
  }
});
