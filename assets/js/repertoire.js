// When all DOM content is loaded...
window.addEventListener('DOMContentLoaded', () => {

  // Check the presence of local storage
  checkLocalStorage();

  // Add the filter input listener to the search input
  addFilterInputListener();

  // ... initialise the footer state
  footerState("viewingRepertoire");
})

function addFilterInputListener(){
  // Get input search element
  let searchInput = document.getElementById("search-input");

  // When search input value changes, filter repertoire tracks
  searchInput.addEventListener("input", filterRepertoireTracks);
}

function filterRepertoireTracks(){

  // Get inputs
  let searchInput = document.getElementById("search-input");
  let filterTyped = searchInput.value.toUpperCase();
  let trackItems = [...document.getElementsByClassName("btn-card")];

  // Credit: search filter partially 
  // taken from https://www.w3schools.com/howto/howto_js_filter_lists.asp
  // For each track item...
  trackItems.forEach(trackItem => {
    // ... get the track name
    let trackName = trackItem.getElementsByClassName("card-title")[0].textContent;
    // If the track name when uppercased matches the filter...
    // ...typed by the user...
    if (trackName.toUpperCase().indexOf(filterTyped) > -1 ) {
      // ...make sure it's displayed
      trackItem.parentElement.style.display = "";
    } else {
      // ... remove it from the list
      trackItem.parentElement.style.display = "none";
    }
  })
}

// Check the user's local storage, to determine if initial repertoire is needed
async function checkLocalStorage() {
  if (!localStorage.getItem('repertoire')){
    addJSONToLocalStorage("repertoire");
  } else {
    fillWithLocalStorage("repertoire");
  }
}

async function addJSONToLocalStorage(data) {
  if (data === "repertoire") {
    let repertoire = await fetchInitialJSON('assets/json/init-repertoire.json');
  
    localStorage.setItem('repertoire', JSON.stringify(repertoire));
  }
  fillWithLocalStorage(data);
}

function fillWithLocalStorage(data){
  let storageData = localStorage.getItem(data);

  let storageArray = JSON.parse(storageData);

  storageArray.sort(sortByName);

  storageArray.forEach(element => {
    createCard(element);
  });
}

// Credit: code for sorting an array of objects by property values taken from https://stackoverflow.com/questions/1129216/sort-array-of-objects-by-string-property-value
function sortByName( a, b ) {
  if ( a.name < b.name ){
    return -1;
  }
  if ( a.name > b.name ){
    return 1;
  }
  return 0;
}

function getJSONFromLocalStorage(data) {
  if (data === "repertoire") { 
    return JSON.parse(localStorage.getItem('repertoire'));
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
  card.classList.add("list-track-item", "col-12", "justify-content-center", "align-items-center", "my-1");

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
    footerState("editingTrack", card, track);
}

function removeSiblingCards(card) {
  // Store siblings of the clicked card in a variable
  let siblings = getCardSiblings(card);

  // Remove siblings from the page 
  siblings.forEach(sibling => {
      sibling.remove();
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

function createNewTrack() {
  // To create a new track we need to...
  // ... get the container of the cards & the cards themselves
  let cardContainer = document.getElementById('list-container');
  let cards = [...cardContainer.children];
  // ... remove all cards within the container
  removeAllListItems(cards);
  // ... open up a form that allows the user to create a new track
  openForm("newTrack", cardContainer);
  // ... when the values are entered and the user presses save, a new object is created using the values given within the form
  
  // ... we then retrieve the current repertoire stored in local storage in object form
  
  // ... push the new object track into the array retrieved from local storage
  
  // ... push the array with a new track contained within to local storage
}

function getFormValues(type){

  if (type === "newTrack"){
    let newTrackValues = {};

    newTrackValues.name = document.getElementById('track-name').value;
    newTrackValues.artist = document.getElementById('track-artist').value;
    newTrackValues.key = document.getElementById('track-key').value;
    newTrackValues.tonality = document.getElementById('track-tonality').value;

    return newTrackValues;
  }

  console.log(newTrackValues);
  return newTrackValues;
}

function removeAllListItems(list){
  list.forEach(listItem => {
    listItem.remove();
  })
}

function openForm(type, parent){
  let newForm = document.createElement('li');

  newForm.className = "col-12 d-flex justify-content-center align-items-center my-1";

  parent.classList.add('enlarge');
  parent.parentNode.classList.add('enlarge');

  newForm.innerHTML = `
    <button class="btn-card animate__animated animate__fadeInUp enlarge">
      <div class="card gig-card rounded-corners">
        <div class="card-body d-flex justify-content-center align-items-center">
          <form id="enlarged-card" class="row justify-content-center align-items-center h-100 w-100">
            <div class="col-12">
              <h3 id="form-title"></h3>
            </div>
            <div class="col-12">
              <label for="track-name">Track:</label>
              <input id="track-name" type="text" value="" class="rounded-corners">
            </div>
            <div class="col-12">
              <label for="track-artist">Artist:</label>
              <input id="track-artist" type="text" value="" class="rounded-corners">
            </div>
            <div class="col-6">
              <label class="d-block" for="track-key">Key:</label>
              <select name="keys" id="track-key" class="rounded-corners">
                  <option value="" selected="" hidden=""></option>
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
              <label for="track-tonality">Tonality:</label>
              <select name="keys" id="track-tonality" class="rounded-corners">
                  <option value="" selected="" hidden=""></option>
                  <option value="Major">Major</option>
                  <option value="Minor">Minor</option>
              </select>
            </div>
          </form>
        </div>
      </div>
    </button>
  `;

  parent.appendChild(newForm);

  if (type === "newTrack"){
    document.getElementById('form-title').textContent = 'New Track';
    document.getElementById('track-name').placeholder = 'Enter track name...';
    document.getElementById('track-artist').placeholder = 'Enter track artist...';
  }


  footerState("addingTrack");
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
  <form id="enlarged-card" class="row justify-content-center align-items-center h-100 w-100">
    <div class="col-12">
      <h3>Edit Track</h3>
    </div>
    <div class="col-12">
      <label for="track-name">Track:</label>
      <input id="track-name" type="text" value="${track.name}" class="rounded-corners">
    </div>
    <div class="col-12">
      <label for="track-artist">Artist:</label>
      <input id="track-artist" type="text" value="${track.artist}" class="rounded-corners">
    </div>
    <div class="col-6">
      <label for="track-key">Key:</label>
      <select name="keys" id="track-key" class="rounded-corners">
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
      <select name="keys" id="track-tonality" class="rounded-corners">
          <option value="${track.tonality}" selected hidden>${track.tonality}</option>
          <option value="Major">Major</option>
          <option value="Minor">Minor</option>
      </select>
    </div>
  </form>
  `;
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
function footerState(currentState, card, track) {
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
  } else if (currentState === "editingTrack" || currentState === "addingTrack") {
    // ...editing or adding a track, display the back & tick buttons
    btnContainer.innerHTML = `
    <button id="btn-delete" class="btn-bottom"><i class="fas fa-trash-alt"></i></button>
    <button id="btn-save" class="btn-bottom"><i class="fas fa-check"></i></button>
    `;
  }
  addButtonListeners(currentState, card, track);
}

function addButtonListeners(currentState, card, track){
  // Retrieve all possible buttons
  let backBtn = document.getElementById("btn-back");
  let addBtn = document.getElementById("btn-add");
  let deleteBtn = document.getElementById("btn-delete");
  let saveBtn = document.getElementById("btn-save");


  if (currentState === "viewingRepertoire") {
    addAddBtnListener(addBtn);
  } else if (currentState === "editingTrack") {
    addSaveBtnListener(saveBtn, card, track, currentState);
    addDeleteBtnListener(deleteBtn, card, track, currentState);
  } else if (currentState === "addingTrack") {
    addSaveBtnListener(saveBtn, card, track, currentState);
  }
}

function clearContentSection () {
  let contentSection = document.getElementById("list-container");
  contentSection.innerHTML = "";
}

function addDeleteBtnListener(deleteBtn, card, track, currentState) {
  deleteBtn.addEventListener("click", function(){
    deleteObject(card, track, currentState)

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

function deleteObject(card, track){
  console.log(card);
  console.log(track);

  // Retrieve the repertoire array of objects (tracks) within local storage and store in a variable
  let repertoireArray = getJSONFromLocalStorage("repertoire");
      
  // Find the index of the track in local storage that has the same name as the track opened, store that index in a variable
  let trackIndex = repertoireArray.findIndex((localStorageTrack => localStorageTrack.name === track.name));

  console.log(trackIndex);

  repertoireArray.splice(trackIndex, 1);

  updateLocalStorage("repertoire", JSON.stringify(repertoireArray));
}

function addSaveBtnListener(saveBtn, card, track, currentState){
  // Add a click event to the save button
  saveBtn.addEventListener("click", function(){
      if(currentState === "editingTrack"){
        // Get input values
        getInputValues(card, track);
        // Remove enlarge classes
        document.getElementById("content-section").firstElementChild.classList.remove("enlarge");
        document.getElementById("list-container").classList.remove("enlarge");
        // Clear the content section
        clearContentSection();
        // Fill with repertoire
        checkLocalStorage();
        // Revert buttons to viewing repertoire state
        footerState("viewingRepertoire");
      } 
      
      else if(currentState === "addingTrack"){
        // Get input values
        let formValues = getFormValues("newTrack");
        // Push input values to local storage
        pushToLocalStorage("track", formValues);
        // Clear content section
        clearContentSection();
        // Fill with repertoire
        checkLocalStorage();
        // Revert buttons to viewing repertoire state
        footerState("viewingRepertoire");
      }
  });
}

function pushToLocalStorage(type, data){

  // If the data type is track data...
  if(type === "track"){
    // ... get the repertoire stored in local storage
    let repertoireArray = getJSONFromLocalStorage("repertoire");
    // ... create a new array from the stored repertoire array
    let newArray = [...repertoireArray];
    // ... push the new object into the repertoire array
    newArray.push(data);
    // ...then update the array in local storage with the new one containing a new object
    updateLocalStorage("repertoire", JSON.stringify(newArray));
  }
}

function getInputValues(card, track) {

  // Retrieve the values contained within the form elements
  let cardForm = card.firstElementChild.firstElementChild.firstElementChild.firstElementChild;
  let newTrackName = cardForm.children[1].children[1].value;
  let newTrackArtist = cardForm.children[2].children[1].value;
  let newTrackKey = cardForm.children[3].children[1].value;
  let newTrackTonality = cardForm.children[4].children[1].value;

  // Retrieve the repertoire array of objects (tracks) within local storage and store in a variable
  let repertoireArray = getJSONFromLocalStorage("repertoire");
      
  // Find the index of the track in local storage that has the same name as the track opened, store that index in a variable
  let trackIndex = repertoireArray.findIndex((localStorageTrack => localStorageTrack.name === track.name));

  // Update the matching track within the array's values with the ones passed in through the form
  repertoireArray[trackIndex].name = newTrackName;
  repertoireArray[trackIndex].artist = newTrackArtist;
  repertoireArray[trackIndex].key = newTrackKey;
  repertoireArray[trackIndex].tonality = newTrackTonality;

  // Update local storage with the new array containing the updated track information
  updateLocalStorage("repertoire", JSON.stringify(repertoireArray));
}

function updateLocalStorage(key, data) {
  localStorage.setItem(key, data);
}

function addAddBtnListener(addBtn){
  addBtn.addEventListener('click', createNewTrack);
}

