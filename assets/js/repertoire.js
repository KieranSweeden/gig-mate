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
    <div class="card track-card rounded-corners">
      <div class="card-body row">
        <div class="col-10 text-start">
          <h3 class="card-track-name">${track.name}</h3>
        </div>
        <div class="col-2 text-end">
          <i class="track-icon fas fa-external-link-alt"></i>
        </div>
        <div class="col-8 text-start">
          <p class="card-track-artist m-0">${track.artist}</p>
        </div>
        <div class="col-4 text-end">
          <p class="card-track-key-tonality m-0 badge">${track.key} ${track.tonality}</p>
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
  card.firstElementChild.addEventListener('click', editTrack);
}

function editTrack(){
  // Retrieve track data from card & store it in an object
  let track = getTrackDataFromTrackCard(this);

  // Get the container element
  let container = document.getElementById("list-container");

  toggleSearchInputDisplay();

  clearContentSection();
  
  // Open the form element
  openForm("editTrack", container, track);
}

function getTrackDataFromTrackCard(trackCard){
  // Initialise an object to store the clicked track information
  let track = {};

  // Grab the track name & artist
  track.name = trackCard.getElementsByClassName("card-track-name")[0].textContent;
  track.artist = trackCard.getElementsByClassName("card-track-artist")[0].textContent;

  // Initialise a variable to store the full key (i.e Eb Major)
  let trackFullKey;

  // Assign track full key with two array values, 1st being the key letter, 2nd being tonality
  trackFullKey = seperateKeyFromTonality(trackCard.getElementsByClassName("card-track-key-tonality")[0].textContent);
  
  // Assign respective key info to track object
  track.key = trackFullKey[0];
  track.tonality = trackFullKey[1];

  // Return the track object
  return track;
}

function seperateKeyFromTonality(trackFullKey){
  // Seperate the full key given and return it as an array
  return trackFullKey.split(" ");
}

function createNewTrack() {
  // To create a new track we need to...
  // ... get the container of the cards & the cards themselves
  let cardContainer = document.getElementById('list-container');
  // ... clear the content section
  clearContentSection();
  // remove the search input
  toggleSearchInputDisplay();
  // ... present a form that allows the user to create a new track
  openForm("newTrack", cardContainer);
}

function getFormValues(type){

  let newTrackValues = {};

  if (type === "newTrack"){

    newTrackValues.name = capitaliseEachWord(document.getElementById('track-name').value);
    newTrackValues.artist = capitaliseEachWord(document.getElementById('track-artist').value);
    newTrackValues.key = document.getElementById('track-key').value;
    newTrackValues.tonality = document.getElementById('track-tonality').value;
  }

  return newTrackValues;
}

function removeAllListItems(list){
  list.forEach(listItem => {
    listItem.remove();
  })
}

function openForm(type, parent, track){
  let newForm = document.createElement('li');

  newForm.className = "col-12 d-flex justify-content-center align-items-center my-1";

  parent.classList.add('enlarge');
  parent.parentNode.classList.add('enlarge');

  newForm.innerHTML = `
          <form id="input-form" class="row rounded-corners animate__animated animate__fadeInUp"">
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
            <div class="col-12 col-track-key">
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
              <label for="track-tonality">Tonality:</label>
              <select name="keys" id="track-tonality" class="rounded-corners">
                  <option value="" selected="" hidden=""></option>
                  <option value="Major">Major</option>
                  <option value="Minor">Minor</option>
              </select>
            </div>
          </form>`;

  parent.appendChild(newForm);

  let formHeader, nameInput, artistInput, keySelect, tonalitySelect;
  formHeader = document.getElementById("form-title");
  nameInput = document.getElementById("track-name");
  artistInput = document.getElementById("track-artist");
  keySelect = document.getElementById("track-key");
  tonalitySelect = document.getElementById("track-tonality");

  if (type === "newTrack"){
    formHeader.textContent = "New Track";
    nameInput.placeholder = "Enter track name...";
    artistInput.placeholder = "Enter track artist...";

    footerState("addingTrack");

  } else if (type === "editTrack"){
    formHeader.textContent = "Edit " + track.name;
    nameInput.value = track.name;
    artistInput.value = track.artist;
    keySelect.value = track.key;
    tonalitySelect.value = track.tonality;

    footerState("editingTrack");
  }
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
      <label for="track-tonality">Tonality:</label>
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
function footerState(currentState, card, track){
  // Retrieve the footer container
  let btnContainer = document.getElementById("btn-footer-container");
  // Clear the contents within the footer container
  btnContainer.innerHTML = "";
  // If the user is...
  if (currentState === "viewingRepertoire"){
    // ...viewing the track repertoire, display the back & add buttons
    btnContainer.innerHTML = `
    <a id="btn-back" class="btn-bottom" href=""><i class="fas fa-arrow-left"></i>Back</a>
    <button id="btn-add" class="btn-bottom"><i class="fas fa-plus"></i>Add</button>`;
  } else if (currentState === "editingTrack"){
    // ...editing or adding a track, display the back & tick buttons
    btnContainer.innerHTML = `
    <button id="btn-delete" class="btn-bottom"><i class="fas fa-trash-alt"></i>Delete</button>
    <button id="btn-save" class="btn-bottom"><i class="fas fa-check"></i>Save</button>`;
  } else if (currentState === "addingTrack"){
    btnContainer.innerHTML = `
    <a id="btn-back" class="btn-bottom" href=""><i class="fas fa-arrow-left"></i>Back</a>
    <button id="btn-save" class="btn-bottom"><i class="fas fa-check"></i>Save</button>`;
  }
  addButtonListeners(currentState, card, track);
}

function addButtonListeners(currentState, card, track){
  // Retrieve all possible buttons
  let addBtn = document.getElementById("btn-add");
  let deleteBtn = document.getElementById("btn-delete");
  let saveBtn = document.getElementById("btn-save");


  if (currentState === "viewingRepertoire") {
    addAddBtnListener(addBtn);
  } else if (currentState === "editingTrack") {
    addSaveBtnListener(saveBtn, currentState);
    addDeleteBtnListener(deleteBtn, card, track, currentState);
  } else if (currentState === "addingTrack") {
    addSaveBtnListener(saveBtn, currentState);
  }
}

function clearContentSection () {
  let contentSection = document.getElementById("list-container");
  contentSection.innerHTML = "";
}

function addDeleteBtnListener(deleteBtn) {
  deleteBtn.addEventListener("click", function(){

    deleteObject();

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

function deleteObject(){

  let formHeader = removeFirstWord(document.getElementById("form-title").textContent);

  // Retrieve the repertoire array of objects (tracks) within local storage and store in a variable
  let repertoireArray = getJSONFromLocalStorage("repertoire");
      
  // Find the index of the track in local storage that has the same name as the track opened, store that index in a variable
  let trackIndex = repertoireArray.findIndex((localStorageTrack => localStorageTrack.name === formHeader));

  repertoireArray.splice(trackIndex, 1);

  updateLocalStorage("repertoire", JSON.stringify(repertoireArray));
}

function addSaveBtnListener(saveBtn, currentState){
  // Add a click event to the save button
  saveBtn.addEventListener("click", function(){
      if(currentState === "editingTrack"){
        // Get input values
        getInputValues();
        // Remove enlarge classes
        document.getElementById("content-section").firstElementChild.classList.remove("enlarge");
        document.getElementById("list-container").classList.remove("enlarge");
        // Clear the content section
        clearContentSection();
        // Fill with repertoire
        checkLocalStorage();
        // Insert search filter
        toggleSearchInputDisplay();
        // Revert buttons to viewing repertoire state
        footerState("viewingRepertoire");
      } 
      
      else if(currentState === "addingTrack"){

        // Get input values
        let formValues = getFormValues("newTrack");

        let emptyInput = false;
        let inputIsAllLetters = true;

        for (const [key, valueEntered] of Object.entries(formValues)){
          if (valueEntered === ""){
            emptyInput = true;
          }
          if (!checkNameIsAllLetters(valueEntered)){
            inputIsAllLetters = false;
          }
        }

        if (emptyInput === true){

          alertUser("addingTrack", "emptyInputs");

        } else if (!inputIsAllLetters) {

          alertUser("addingTrack", "illegalCharacters");

        } else {
          // Get tracks from local storage
          let localStorageTracks = getJSONFromLocalStorage("repertoire");
  
          let itemIsDuplicate = false;
  
          localStorageTracks.forEach(localStorageTrack => {
            if(formValues.name === localStorageTrack.name && formValues.artist === localStorageTrack.artist){
              
              itemIsDuplicate = true;
            }
          });
  
          if (itemIsDuplicate === true){
  
            alertUser("addingTrack", "alreadyExists");
  
          } else if (itemIsDuplicate === false){
  
            // Push input values to local storage
            pushToLocalStorage("track", formValues);
            // Clear content section
            clearContentSection();
            // Fill with repertoire
            checkLocalStorage();
            // Revert buttons to viewing repertoire state
            footerState("viewingRepertoire");
          }
        }
      }
  });
}

function alertUser(currentState, issue){
  // Initialise an alert variable that will store the alert element
  let alertElement;

  // If we're dealing with...
  if (currentState === "addingTrack"){

      // ... a new setlist, grab the alert template
      alertElement = contentTemplates("alert", issue);

      // Get the name input
      let input = document.getElementById('track-name');

      // Append the alert into the parent element of the input, alerting the user
      input.parentElement.parentElement.appendChild(alertElement);

      // After three seconds, remove the alert
      setTimeout(() => {
          input.parentElement.parentElement.removeChild(alertElement);
      }, 5000);
  }
}

function contentTemplates(request, issue){
  // Initialise a variable to store the template
  let template;

  if (request === "alert") {

    template = document.createElement('div');

    template.className = "alert alert-danger";

    template.setAttribute('role', 'alert');

      if (issue === "alreadyExists") {
        template.textContent = "This track name already exists, create a new one.";
      } else if (issue === "emptyInputs") {
        template.textContent = "Please fill in all input fields.";
      } else if (issue === "illegalCharacters"){
        template.textContent = "Please only use letters when creating a track."
      }

    return template;
  }
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

function getInputValues() {

  // Retrieve the values contained within the form elements
  let formHeader, nameInput, artistInput, keySelect, tonalitySelect;
  formHeader = document.getElementById("form-title").textContent;
  nameInput = capitaliseEachWord(document.getElementById("track-name").value);
  artistInput = capitaliseEachWord(document.getElementById("track-artist").value);
  keySelect = document.getElementById("track-key").value;
  tonalitySelect = document.getElementById("track-tonality").value;

  // Retrieve the repertoire array of objects (tracks) within local storage and store in a variable
  let repertoireArray = getJSONFromLocalStorage("repertoire");
      
  // Find the index of the track in local storage that has the same name as the track opened, store that index in a variable
  let trackIndex = repertoireArray.findIndex((localStorageTrack => localStorageTrack.name === formHeader || localStorageTrack.artist === artistInput));

  // Update the matching track within the array's values with the ones passed in through the form
  repertoireArray[trackIndex].name = nameInput;
  repertoireArray[trackIndex].artist = artistInput;
  repertoireArray[trackIndex].key = keySelect;
  repertoireArray[trackIndex].tonality = tonalitySelect;

  // Update local storage with the new array containing the updated track information
  updateLocalStorage("repertoire", JSON.stringify(repertoireArray));
}

function removeFirstWord(sentence){
  // Splice the sentence into an array, chop the first index/word and return as a joined string
  return sentence.split(" ").splice(1).join(" ");
}

function updateLocalStorage(key, data) {
  localStorage.setItem(key, data);
}

function addAddBtnListener(addBtn){
  addBtn.addEventListener('click', createNewTrack);
}

function toggleSearchInputDisplay(){
  // Initialise variables
  let searchInput, headerSection, contentSection;

  // Grab search input, header section & content section
  searchInput = document.getElementById("search-input");
  headerSection = document.getElementById("header-section");
  contentSection = document.getElementById("content-section");


  if(searchInput.style.display === "none"){
    // If the search input is not present, add it & adjust section heights
    searchInput.style.display = "block";
    headerSection.style.height = "17.5%";
    contentSection.style.height = "72.5%";
  } else {
    // If the search input is present, remove it & adjust section heights
    searchInput.style.display = "none";
    headerSection.style.height = "10%";
    contentSection.style.height = "80%";
  }
}
