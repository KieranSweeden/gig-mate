// When all DOM content is loaded...
window.addEventListener('DOMContentLoaded', () => {
  // ... fill the unordered list with cards
  fillWithInitialRepertoire();
  // ... initialise the footer state
  footerState("viewingRepertoire");
})

async function fillWithInitialRepertoire() {
  // Store the location of the JSON within a variable
  let tracks = await fetchInitialJSON('assets/json/initRepertoire.json');

  // Create a card for each track
  tracks.forEach(track => {
    createCard(track)
  });
}

// A utility function that can be used to fetch local JSON files
async function fetchInitialJSON(url) {
  // Fetch the JSON with a provided URL and store the promise reponse within a variable
  let response = await fetch(url);
  // Return the promise as a JavaScript object using .json()
  return response.json();
  }

function createCard(track) {
  // Create list element
  let card = document.createElement("li");

  // Add classes to list element
  card.classList.add("col-12", "d-flex", "justify-content-center", "align-items-center", "my-1");

  // Add inner HTML within each card
  card.innerHTML = 
  `<button class="btn-card">
    <div class="card gig-card rounded-corners">
      <div class="card-body row">
        <div class="col-10 gig-venue">
          <h3 class="card-title">${track.name}</h3>
        </div>
        <div class="col-2 text-end">
          <i class="fas fa-external-link-alt rep-icon"></i>
        </div>
        <div class="col-8 gig-artist">
          <p class="m-0">${track.artist}</p>
        </div>
        <div class="col-4 gig-date text-end">
          <p class="m-0 badge">${track.key}</p>
        </div>
      </div>
    </div>
  </button>`;

// Add the click listener to enlarge to the card
addCardEnlarge(card, track);

// Add a hover state to the card
addIconHover(card.firstElementChild);

// Retrieve the unordered list element (the container/parent)
let cardContainer = document.getElementById("list-container");

// Append card into the container
cardContainer.appendChild(card);
}

function addCardEnlarge(card, track) {
  // When the card is clicked, trigger the necessary functions to enlarge it, filling the content section
  card.addEventListener('click', function(){
    openCard(card, track);
  }, { once: true });
}

function openCard(card, track) {
    // To open the card, we must first remove it's siblings to provide screen space
    removeSiblingCards(card);
    // When the siblings are removed, enlarge the card, it's row & container
    enlargeCard(card, track);
    // Change the footer state to editing track
    footerState("editingTrack");
}

function removeSiblingCards(card) {
  // Store siblings of the clicked card in a variable
  let siblings = getCardSiblings(card);

  // Remove siblings from the page 
  siblings.forEach(sibling => {
      sibling.style.display = 'none';
      sibling.classList.toggle('d-flex');
  })
}

function getCardSiblings(card) {
  // An empty array ready to contain siblings
  let cardSiblings = [];
  // Retrieve the first sibling
  let sibling = card.parentNode.firstChild;

  // Loop through & push each sibling
  while (sibling) {
      // If sibling is an element (nodeType = 1) & is not the original element
      if (sibling.nodeType === 1 && sibling !== card) {
          // Push this element to the siblings array
          cardSiblings.push(sibling);
      }
  // Continue to the next sibling
  sibling = sibling.nextSibling;
  }
// Return the card siblings array
return cardSiblings;
}

function enlargeCard(card, track) {
    // Retrieve the card's container & row parents
    let cardContainer = card.parentNode.parentNode;
    let cardRow = card.parentNode;

    // Now the siblings are removed, increase the height of the card, it's row and container with the enlarge class
    cardContainer.classList.toggle("enlarge");
    cardRow.classList.toggle("enlarge");
    card.firstElementChild.classList.toggle("enlarge");

    styleLargeCard(card, track);
}

function styleLargeCard(card, track) {
  let cardBody = card.firstElementChild.firstElementChild.firstElementChild;

  cardBody.className = 'card-body d-flex justify-content-center align-items-center';

  cardBody.innerHTML = `
  <form class="row justify-content-center align-items-center h-100 w-100">
    <div class="col-12">
      <h3>Edit Track</h3>
    </div>
    <div class="col-12">
      <label for="track-name">Track:</label>
      <input id="track-name" type="text" placeholder="${track.name}" disabled>
    </div>
    <div class="col-12">
      <label for="track-artist">Artist:</label>
      <input id="track-artist" type="text" placeholder="${track.artist}" disabled>
    </div>
    <div class="col-6">
      <label for="track-key">Key:</label>
      <select name="keys" id="track-key" disabled>
          <option value="A">A</option>
          <option value="B">B</option>
          <option value="C">C</option>
          <option value="D">D</option>
          <option value="E">E</option>
          <option value="F">F</option>
          <option value="G">G</option>
      </select>
    </div>
    <div class="col-6">
      <label for="track-tonality">Key:</label>
      <select name="keys" id="track-tonality" disabled>
          <option value="Major">Major</option>
          <option value="Minor">Minor</option>
      </select>
    </div>
  </form>
  `;

  // Retrieve form elements
  let trackName = document.getElementById('track-name');
  let trackArtist = document.getElementById('track-artist');
  let trackKey = document.getElementById('track-key');
  let trackTonality = document.getElementById('track-tonality');
}

// Change color of card open icon to represent hovered state
function addIconHover (card) {
  // When hovering over the button area, the icon will turn purple
  card.addEventListener('mouseenter', function(){
    paintIcon(card)
  })
  // When leaving the button area, the icon will revert to grey
  card.addEventListener('mouseleave', function(){
    paintIcon(card)
  })
}

// Toggle a class to paint the edit icon
function paintIcon (card) {
  // Grab the icon within the card
  let icon = card.firstElementChild.firstElementChild.children[1].firstElementChild;
  // Check if the icon has a class of icon-hover
  if (icon.classList.contains("icon-hover")){
    // If so, remove the class to revert back to the grey color
    icon.classList.remove("icon-hover")
  } else {
    // If not, add the class to turn the icon color to purple
    icon.classList.add("icon-hover");
  }
}

// Change the buttons within the footer
function footerState(currentState) {
  // Retrieve the footer container
  let btnContainer = document.getElementById("btn-footer-container");
  // Clear the contents within the footer container
  btnContainer.innerHTML = '';

  if (currentState === "viewingRepertoire") {
    btnContainer.innerHTML = `
    <a id="btn-back" class="btn-bottom" href=""><i class="fas fa-arrow-left"></i></a>
    <button class="btn-bottom"><i class="fas fa-plus"></i></button>
    `;
  } else if (currentState === "editingTrack") {
    btnContainer.innerHTML = `
    <a id="btn-back" class="btn-bottom" href=""><i class="fas fa-arrow-left"></i></a>
    <button class="btn-bottom"><i class="fas fa-check"></i></button>
    `;
  }
}

