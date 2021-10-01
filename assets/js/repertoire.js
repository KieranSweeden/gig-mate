// When all DOM content is loaded...
window.addEventListener('DOMContentLoaded', () => {

  checkLocalStorage();
  // ... initialise the footer state
  footerState("viewingRepertoire");
})

// Check the user's local storage, to determine if initial repertoire is needed
async function checkLocalStorage() {
  if (!localStorage.getItem('repertoire')){
    addJSONToLocalStorage("repertoire");
  } else {
    fillWithLocalStorage("repertoire");
  }
}

function fillWithLocalStorage(data){
  let storageData = localStorage.getItem(data);

  let storageArray = JSON.parse(storageData);

    storageArray.forEach(element => {
    createCard(element);
  });
}

async function addJSONToLocalStorage(data) {
  if (data === "repertoire") {
    let repertoire = await fetchInitialJSON('assets/json/initRepertoire.json');
  
    localStorage.setItem('repertoire', JSON.stringify(repertoire));
  }
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
  `<button class="btn-card animate__animated animate__fadeInUp">
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
          <p class="m-0 badge">${track.key} ${track.tonality}</p>
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
  card.firstElementChild.addEventListener('click', function(){
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
    cardContainer.classList.add("enlarge");
    cardRow.classList.add("enlarge");
    card.firstElementChild.classList.add("enlarge");

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
      <input id="track-name" type="text" value=${track.name}>
    </div>
    <div class="col-12">
      <label for="track-artist">Artist:</label>
      <input id="track-artist" type="text" value=${track.artist}>
    </div>
    <div class="col-6">
      <label for="track-key">Key:</label>
      <select name="keys" id="track-key">
          <option value="${track.key}" selected hidden>${track.key}</option>
          <option class="key-option" value="A">A</option>
          <option class="key-option" value="Bb">Bb</option>
          <option class="key-option" value="B">B</option>
          <option class="key-option" value="C">C</option>
          <option class="key-option" value="Db">Db</option>
          <option class="key-option" value="D">D</option>
          <option class="key-option" value="Eb">Eb</option>
          <option class="key-option" value="E">E</option>
          <option class="key-option" value="F">F</option>
          <option class="key-option" value="Gb">Gb</option>
          <option class="key-option" value="G">G</option>
          <option class="key-option" value="Ab">Ab</option>
      </select>
    </div>
    <div class="col-6">
      <label for="track-tonality">Key:</label>
      <select name="keys" id="track-tonality">
          <option value="${track.tonality}" selected hidden>${track.tonality}</option>
          <option value="Major">Major</option>
          <option value="Minor">Minor</option>
      </select>
    </div>
  </form>
  `;

  displaySavedKeyAndTonality(card, track);
}

function displaySavedKeyAndTonality(card, track){
  let keyOptions = Array.from(document.getElementsByClassName("key-option"));

  // keyOptions.forEach(keyOption => {

  // });

  console.log(keyOptions);

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
  }  else {
    // If not, add the class to turn the icon color to purple
    icon.classList.add("icon-hover");
  }
}

// Change the buttons within the footer
function footerState(currentState) {
  // Retrieve the footer container
  let btnContainer = document.getElementById("btn-footer-container");
  // Clear the contents within the footer container
  btnContainer.innerHTML = "";
  // If the user is...
  if (currentState === "viewingRepertoire") {
    // ...viewing the track repertoire, display the back & add buttons
    btnContainer.innerHTML = `
    <a id="btn-back" class="btn-bottom" href=""><i class="fas fa-arrow-left"></i></a>
    <button id="btn-add" class="btn-bottom"><i class="fas fa-plus"></i></button>
    `;
  } else if (currentState === "editingTrack") {
    // ...editing a track, display the back & tick buttons
    btnContainer.innerHTML = `
    <button id="btn-save" class="btn-bottom"><i class="fas fa-check"></i></button>
    `;
  }
  addButtonListeners(currentState);
}

function addButtonListeners(currentState){
  // Retrieve all possible buttons
  let backBtn = document.getElementById("btn-back");
  let addBtn = document.getElementById("btn-add");
  let saveBtn = document.getElementById("btn-save");


  if (currentState === "viewingRepertoire") {
    addAddBtnListener(addBtn);
  } else if (currentState === "editingTrack") {
    addSaveBtnListener(saveBtn);
  }
}

function clearContentSection () {
  let contentSection = document.getElementById("list-container");
  contentSection.innerHTML = "";
}

function addSaveBtnListener(saveBtn){
  saveBtn.addEventListener("click", function(){
    // Get input values
    getInputValues();
    // Remove enlarge classes
    document.getElementById("content-section").firstElementChild.classList.remove("enlarge");
    document.getElementById("list-container").classList.remove("enlarge");
    // Clear the content section
    clearContentSection();
    // Fill with repertoire
    checkLocalStorage();
    // Revert buttons to viewing repertoire state
    footerState("viewingRepertoire");
  });
}

function getInputValues() {
  let openedCard = document.getElementsByClassName("btn-card animate__animated animate__fadeInUp enlarge")[0];
  let cardForm = openedCard.firstElementChild.firstElementChild.firstElementChild;

  let newTrackName = cardForm.children[1].children[1].value;
  let newTrackArtist = cardForm.children[2].children[1].value;
  let newTrackKey = cardForm.children[3].children[1].value;
  let newTrackTonality = cardForm.children[4].children[1].value;


  // console.log(newTrackName);
  // console.log(newTrackArtist);
  // console.log(newTrackKey);
  // console.log(newTrackTonality);
  
}

function addAddBtnListener(addBtn){

}

