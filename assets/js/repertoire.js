window.addEventListener('DOMContentLoaded', () => {

    fillWithInitialRepertoire();
    // Init an empty array, retrieve the cards and store them in the array
    let cards = [];
    cards = document.getElementsByClassName('btn-card');
    let cardsArray = [].slice.call(cards);
    
    // Add a click event for each card that calls a function that opens the clicked card
    cardsArray.forEach(card => {
        card.addEventListener('click', function(){
            openCard(card);
        });
    })
})

function openCard(card) {
    // To open the card, we must first remove it's siblings
    removeSiblingCards(card);
    // When the siblings are removed, enlarge the card
    enlargeCard(card);
}

function enlargeCard(card) {

    // Retrive the card's container & row parents
    let cardContainer = card.parentNode.parentNode.parentNode;
    let cardRow = card.parentNode.parentNode;

    // Now the siblings are removed, increase the height of the card, it's row and container with the enlarge class
    cardContainer.classList.toggle("enlarge");
    cardRow.classList.toggle("enlarge");
    card.classList.toggle("enlarge");
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
    let sibling = card.parentNode.parentNode.firstChild;
    // Loop through & push each sibling
    while (sibling) {
        // If sibling is an element (nodeType = 1) & is not the original element
        if (sibling.nodeType === 1 && sibling !== card.parentNode) {
            // Push this element to the siblings array
            cardSiblings.push(sibling);
        }
    // Continue to the next sibling
    sibling = sibling.nextSibling;
    }
// Return the card siblings array
return cardSiblings;
}

async function fillWithInitialRepertoire() {
    // Store the location of the JSON within a variable
    let tracks = await fetchInitialJSON('assets/json/initRepertoire.json');

    // Create a card for each track
    tracks.forEach(track => {
      createCard(track)
    });
}


async function fetchInitialJSON(url) {
    let response = await fetch(url);
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

  addIconHoverState(card);

  // Retrieve the unordered list element (the container/parent)
  let cardContainer = document.getElementById("list-container");

  // Append card into the container
  cardContainer.appendChild(card);
}

// Change color of card open icon to represent hovered state
function addIconHoverState () {
  // Gather a HTML collection of cards
  let cards = [];
  cards = document.getElementsByClassName('btn-card');

  // Convert the HTML collection into an array
  // Credit: method to convert HTML collection into an array was found at: https://stackoverflow.com/questions/222841/most-efficient-way-to-convert-an-htmlcollection-to-an-array
  let cardsArray = [].slice.call(cards);

  // Add an eventlistener to each card button, which waits for a mouseenter and mouseleave
  cardsArray.forEach(card => {
      card.addEventListener('mouseenter', function(){
          paintIcon(card)
      });
      card.addEventListener('mouseleave', function(){
          paintIcon(card)
      });
  })
  console.log(cards);
}

// Toggle between classes to paint icon
function paintIcon (card) {
  let icon = card.firstElementChild.firstElementChild.children[1].firstElementChild;
  icon.classList.toggle("icon-hover");
}


