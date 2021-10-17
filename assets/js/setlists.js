// When DOM content is loaded...
window.addEventListener('DOMContentLoaded', function() {
    // Determine what content the page will be dealing with and store the type within a variable
    let contentType = determineContentType();

    // Check a repertoire exists, if not, add the initialised one
    checkPresenceOfRepertoire();

    // Knowing the type of content it'll be dealing with, start the application with the contentType as a parameter
    startGigMate(contentType);
});

function determineContentType() {
    // To determine what content type this page will be dealing with, grab the current pathname
    let currentPage = window.document.location.pathname;

    // Initialise an empty variable to contain a content type value
    let contentType;

    // Assign content type depending on the value within current page variable
    if (currentPage === "/setlists.html" || currentPage === "/gig-mate/setlists.html") {
        contentType = "setlists";
    } else if (currentPage === "/repertoire.html" || currentPage === "/gig-mate/repertoire.html") {
        contentType = "repertoire";
    } else if (currentPage === "/gigs.html" || currentPage === "/gig-mate/gigs.html") {
        contentType = "gigs";
    }
    // Return the content type variable
    return contentType;
}

async function startGigMate(contentType) {
    // Firstly, start local storage functionality to determine what data items GigMate will be working with
    let contentData = await collectLocalStorage(contentType);

    // If the content type is...
    if(contentType === "setlists") {
        // ... setlists, create setlists
        displaySetlists(contentData, false);
    }

    // Determing what footer buttons should be present
    determineFooterButtons(contentType, "viewingSetlists", contentData);
}

async function collectLocalStorage(contentType) {
    // Check if there is already data present within local storage
    let hasLocalStorage = checkLocalStorage(contentType);

    // Initialise a variable that will store the recieved parsed JSON file data
    let contentData;

    // If there is...
    if (hasLocalStorage === true) {
        // ...local storage, retrieve the data from local storage
        contentData = getLocalStorageData(contentType);
    } else if (hasLocalStorage === false) {
        // ...no local storage, start GigMate with the appropriate initialised json file
        await addInitialisedJSONToLocalStorage(contentType);
        // Once the data has been added, retrieve the data from local storage
        contentData = getLocalStorageData(contentType);
    }
    return contentData;
}

function checkLocalStorage(contentType) {
    // Return true if local storage exists, return false if not
    // return (localStorage.hasOwnProperty(contentType)) ? true : false;
    return (localStorage.getItem(contentType)) ? true : false;
}

function getLocalStorageData(contentType) {  
    // Parse the stringified JSON recieved from local storage & return it

    let storedData;
    
    if(contentType === "setlists") {
        storedData = JSON.parse(localStorage.getItem("setlists"));
    } else if (contentType === "repertoire") {
        storedData = JSON.parse(localStorage.getItem("repertoire"));
    }

    return storedData;
    
}

async function addInitialisedJSONToLocalStorage(contentType) {
    // Initialise a variable to store the local JSON file data
    let localJSONData;

    // If the contentType is...
    if (contentType === "setlists") {
        // ...setlists, fetch & store the setlist JSON data
        localJSONData = await getInitialJSONData("assets/json/init-setlists.json");
    } else if (contentType === "repertoire") {
        // ...repertoire, fetch & store the repertoire JSON data
        localJSONData = await getInitialJSONData("assets/json/init-repertoire.json");
    }

    // Push the local JSON data to local storage
    pushToLocalStorage(contentType, localJSONData);
}

async function getInitialJSONData(pathToJSONFile) {
    // Fetch & store the data contained within the JSON file
    let fileData = await fetch(pathToJSONFile);

    // Collect the json within the fileData promise and return it
    return fileData.json();
}

function pushToLocalStorage(contentType, localJSONData) {
    // Push the contentType(key) & localJSONData(value) to local storage
    localStorage.setItem(contentType, JSON.stringify(localJSONData));
}

async function checkPresenceOfRepertoire(){
    // If repertoire does not exist in local storage...
    if(!localStorage.getItem('repertoire')){
        // push the initial repertoire file to local storage
        pushToLocalStorage("repertoire", await getInitialJSONData("assets/json/init-repertoire.json"));
    }
}

function displaySetlists(setlists, insertingCheckbox){
    // Display the setlists...

    // ...Get content container
    let contentContainer = document.getElementById("content-container");

    // Get accordion body
    let accordionBody = contentTemplates("setlistAccordionBody");

    // insert accordion body to content container
    contentContainer.innerHTML = accordionBody;

    // Insert accordion items
    setlists.forEach(setlist => {
        // ... retrieve the accordion template containing content respective to this setlist
        let [setlistTemplate, setButtons] = contentTemplates("setlistAccordionItem", setlist);

        // ... display the setlist with the template, set buttons & reference
        displayItems("setlist", [setlistTemplate, setButtons], removeSpaces(setlist.setlistName));
        
        // If intention is to delete setlists, avoid adding event listeners to buttons
        if (insertingCheckbox === undefined){
            // ... add event listeners to the respective set buttons
            insertButtonEventListeners();
        }
    });
}

function viewSet(setlistName, setNumber){

    let tracks = getTracks(setlistName, setNumber);

    clearContentSection();

    // Show appropriate footer buttons
    determineFooterButtons("setlists", "viewingSet");

    displayItems("tracks", tracks);
}

function prepareToEditMultipleItems(contentType){

    // If the content type is...
    if(contentType === "setlists"){

        // ... setlists, show appropriate buttons
        determineFooterButtons(contentType, "deleting");

        let setlists = getLocalStorageData(contentType);

        displaySetlists(setlists, true);

        // Get the setlists
        let setlistArray = [...document.getElementsByClassName("accordion-item")];

        // for each setlist...
        setlistArray.forEach(setlist => {

            // remove the data-bs-parent attribute so all accordion items can be open
            setlist.children[1].removeAttribute("data-bs-parent");

            // open all accordion items
            setlist.children[1].classList.add("show");

            // remove the accordion collapse functionality
            setlist.firstElementChild.firstElementChild.removeAttribute("data-bs-toggle");

            // remove the arrow
            setlist.firstElementChild.firstElementChild.className = "accordion-button removed collapsed";

            // insert a checkbox to main setlist header
            setlist.firstElementChild.firstElementChild.appendChild(getDeleteCheckBox("setlist"));

            // get all set buttons within that setlist
            let setButtons = [...setlist.children[1].firstElementChild.firstElementChild.firstElementChild.children];

            // For each set button, append a checkbox
            setButtons.forEach(setButton => {
                setButton.classList.add("remove-hover");
                setButton.appendChild(getDeleteCheckBox());
            });
        });

        addCheckBoxListeners(contentType);

    } else if (contentType === "tracks"){
        
        // ... tracks, get every track card
        let trackArray = [...document.getElementsByClassName("gig-card")];

        trackArray.forEach(trackCard => {
            // get the edit icon
            let icon = trackCard.firstElementChild.children[1].firstElementChild;

            // remove the edit icon
            trackCard.firstElementChild.children[1].removeChild(icon);

            // insert a checkbox
            trackCard.firstElementChild.children[1].appendChild(getDeleteCheckBox());
        });
    }
}

function addCheckBoxListeners(contentType){

    // get all checkboxes
    let checkboxes = [...document.getElementsByClassName("form-check-input")];

    // If the content type is...
    if(contentType === "setlists") {
        // ... setlists, add an event listener to each check box on display
        checkboxes.forEach(function(checkbox){
            // If the checkbox represents a setlist instead of a singular set...
            if (checkbox.classList.contains("set-checkbox")){
                // ... add an event listener where on click, the child sets of a setlist will also be selected or deselected
                checkbox.addEventListener('click', function(e){
                    // Prevent default checkbox click behaviour
                    e.preventDefault();
                    checkbox.toggleAttribute("checked");
                    // toggle the checked status of the sets within the setlist
                    toggleChildSets(checkbox);
                });
            } else {
                checkbox.addEventListener('click', function(e){
                    // Prevent default checkbox click behaviour
                    e.preventDefault();
                    // toggle the attribute of checked of this particular checkbox
                    checkbox.toggleAttribute("checked");
                });
            }
        });
    }
}

function toggleChildSets(checkbox){
    // Get the element containing the setlist and it's sets, in this case it's an accordion-item
    let container = checkbox.parentElement.parentElement.parentElement;

    // Get the set buttons within the setlist
    let setButtons = [...container.children[1].firstElementChild.firstElementChild.firstElementChild.children];

    // If the setlist header checkbox...
    if (checkbox.hasAttribute("checked")){
        // ... is checked, apply the attribute of checked to all sets
        setButtons.forEach(setButton => {
            setButton.firstElementChild.setAttribute("checked", '');
        });
    } else if (!checkbox.hasAttribute("checked")){
        // Else if it does not have the attribute of checked
        setButtons.forEach(setButton => {
            // make sure all sets within the setlist have the attribute of checked removed
            setButton.firstElementChild.removeAttribute("checked");
        });
    }

}

function getDeleteCheckBox(contentType) {
    // Create an input element
    let checkbox = document.createElement("input");

    // Give it the Bootstrap 5 checkbox class
    checkbox.className = "form-check-input";

    // Give it the type of checkbox
    checkbox.type = "checkbox";

    // Give the checkbox a particular class name depending on the content type
    if (contentType === "setlist") {
        checkbox.classList.add("set-checkbox");
    }

    // Return a checkbox when called
    return checkbox;
}

function determineFooterButtons(contentType, currentState, contentData){
    // Before we touch any buttons, we must first retrieve the container
    let btnContainer = document.getElementById("btn-footer-container");

    // And we must make sure before making any changes, that it's clear of content
    btnContainer.innerHTML = "";

    // Insert the back button as it's present in most states.
    btnContainer.innerHTML = insertButton("back");

    // If the user is...
    if(contentType === "setlists" && currentState === "viewingSetlists"){
        // ... viewing setlists, display the back & add buttons
        btnContainer.innerHTML += insertButton("delete");
        btnContainer.innerHTML += insertButton("add");
    } else if (contentType === "setlists" && currentState === "viewingSet"){
        btnContainer.innerHTML += insertButton("edit");
        btnContainer.innerHTML += insertButton("expand");
    } else if(contentType === "setlists" && currentState === "editingSet"){
        btnContainer.innerHTML = insertButton("add");
        btnContainer.innerHTML += insertButton("delete");
        btnContainer.innerHTML += insertButton("save");
    } else if (contentType === "setlists" && currentState === "addTracksToSet"){
        btnContainer.innerHTML += insertButton("save");
    } else if (contentType === "setlists" && currentState === "new"){
        btnContainer.innerHTML += insertButton("save");
    } else if (contentType === "setlists" && currentState === "deleting"){
        btnContainer.innerHTML += insertButton("save");
    } else if (contentType === "tracks" && currentState === "edit"){
        btnContainer.innerHTML += insertButton("save");
    }

    // Add event listeners to the buttons displayed on screen
    insertButtonEventListeners(contentType, currentState, contentData);
}


function insertButton(type){
    // Initialise a variable to store the button
    let button;

    // Set button function based on type
    switch (type){
        case "back":
            button = '<a id="btn-back" class="btn-bottom" href=""><i class="fas fa-arrow-left"></i>Back</a>';
        break;
        case "add":
            button = '<button id="btn-add" class="btn-bottom"><i class="fas fa-plus"></i>Add</button>';
        break;
        case "save":
            button = '<button id="btn-save" class="btn-bottom"><i class="fas fa-check"></i>Save</button>';
        break;
        case "delete":
            button = '<button id="btn-delete" class="btn-bottom"><i class="fas fa-trash-alt"></i>Delete</button>';
        break;
        case "edit":
            button = '<button id="btn-edit" class="btn-bottom"><i class="fas fa-edit"></i>Edit</button>';
        break;
        case "expand":
            button = '<button id="btn-expand" class="btn-bottom" data-bs-toggle="modal" data-bs-target="#liveModeModal"><i class="fas fa-expand"></i>Live</button>';
        break;
    }

    // Return the button
    return button;
}

function insertButtonEventListeners(contentType, currentState, contentData){
    // Retrieve all possible buttons
    let addButton = document.getElementById("btn-add");
    let deleteButton = document.getElementById("btn-delete");
    let saveButton = document.getElementById("btn-save");
    let editButton = document.getElementById("btn-edit");
    let expandButton = document.getElementById("btn-expand");
    let itemButtons = [...document.getElementsByClassName("list-group-btn")];

    if(contentType === "setlists" && currentState === "viewingSetlists"){
        // If the user is viewing setlists... 
        addButton.addEventListener('click', function(){
            // ... the add button will open a create new setlist form
            openForm("newSetlist");
        });
        deleteButton.addEventListener('click', function(){
            // ... the delete button will prepare the items to be deleted
            prepareToEditMultipleItems(contentType);
        });
        itemButtons.forEach(button => {
            // Add a click listener for every button in content section
            button.addEventListener('click', function(){
                openSetlist(button);
            });
        });

    } else if (contentType === "setlists" && currentState === "viewingSet"){
        // If the user is viewing a set within a setlist...
        editButton.addEventListener('click', function(){
            // ... the edit button will prepare set items to be edited
            editSet();
        });

        expandButton.addEventListener('click', function(){
            // ... the expand button will full screen the set
            fillLiveModalWithTracks();
        });

    }   else if (contentType === "setlists" && currentState === "editingSet"){
        // If the user is editing a set within a setlist...
        addButton.addEventListener('click', function(){
            // ... the add button will display the repertoire by
            // clearing the content section
            clearContentSection();

            // getting the repertoire
            let tracksInLocalStorage = getLocalStorageData("repertoire");

            // sort the repertoire
            tracksInLocalStorage.sort(sortByName);
            
            // displaying the repertoire to the user
            displayItems("addTracks", tracksInLocalStorage);

            // show appropriate footer buttons
            determineFooterButtons("setlists", "addTracksToSet");
        });

        deleteButton.addEventListener('click', function(){

            // Collecting the tracks checked
            let checkedTracks = getCheckedItems("tracks");

            // Get names of checked tracks
            let checkedTrackNames = getNames("trackCard", checkedTracks);

            // Get the current setlist name & set number
            let setlistName = document.getElementById("page-header").textContent;
            let setNumber = document.getElementById("page-subheader").textContent;

            // Create a new set array of names used to delete from array
            let namesToDelete = new Set(checkedTrackNames);

            // Get the array of set tracks from local storage
            let setTracks = getTracks(setlistName, setNumber);

            // Create a new set which filters out the checked tracks
            // Credit: code to remove array with another
            // array taken from https://melvingeorge.me/blog/remove-elements-contained-in-another-array-javascript
            let newSet = setTracks.filter(setTrack => {
                return !namesToDelete.has(setTrack.name);
            });

            // Update local storage with the new set
            updateSetInLocalStorage(newSet, setlistName, setNumber);

            viewSet(setlistName, setNumber);
        });

        saveButton.addEventListener('click', function(){
            // the save button will save the set in it's displayed order by

            // Get the tracks within the set
            let trackCards = [...document.getElementsByClassName("card-title")];

            // Get the names of the set tracks
            let trackNames = getNames("saveSetCards", trackCards);

            // Init an array that'll be the new set
            let newSet = [];

            // Get the repertoire
            let repertoireTracks = getLocalStorageData("repertoire");

            // Get the object in repertoire matching the name
            trackNames.forEach(trackName => {
                repertoireTracks.forEach(repertoireTrack => {
                    // If the names match, push the object into the newSet array
                    if(trackName === repertoireTrack.name){
                        newSet.push(repertoireTrack);
                    }
                });
            });

            // Get the current setlist name & set number
            let setlistName = document.getElementById("page-header").textContent;
            let setNumber = document.getElementById("page-subheader").textContent;

            updateSetInLocalStorage(newSet, setlistName, setNumber);

            viewSet(setlistName, setNumber);
        });

    } else if (contentType === "setlists" && currentState === "addTracksToSet"){
        // If the user is adding tracks to a set...
        saveButton.addEventListener('click', function(){
            // ... the save button will add the tracks to the set by
            // Collecting the tracks checked
            let checkedTracks = getCheckedItems("tracks");

            // Get names of checked tracks
            let checkedTrackNames = getNames("trackCard", checkedTracks);

            // Get local storage repertoire
            let tracksInLocalStorage = getLocalStorageData("repertoire");

            let trackObjectsToAdd = [];

            // For each checked track, get the matching object in local storage
            checkedTrackNames.forEach(checkedTrack => {
                tracksInLocalStorage.forEach(track => {
                    if(track.name === checkedTrack){
                        trackObjectsToAdd.push(track);
                    }
                });
            });

            let setlistName = document.getElementById("page-header").textContent;
            let setNumber = document.getElementById("page-subheader").textContent;

            // Get original set tracks from local storage
            let setlistTracks = getTracks(setlistName, setNumber);

            // Add the checked track objects to setlist tracks array
            setlistTracks.push(...trackObjectsToAdd);

            // Update local storage with new setlist
            updateSetInLocalStorage(setlistTracks, setlistName, setNumber);

            editSet();
        });

    } else if (contentType === "setlists" && currentState === "new"){
        // If the user is creating a new setlist, the save button will save the setlist info to local storage and redirect them to viewing setlists
        saveButton.addEventListener('click', function(){

            // Get input element
            let setNameInput = document.getElementById("form-name");

            // If empty, ask the user to write a name
            if (setNameInput.value === "") {
                alertUser(contentType, currentState, "emptyInput");

            } else {
                // Create a new setlist item
                let newSetlist = createNewItem("setlist");
    
                // Get the original local storage array and store it in a variable
                let originalLocalStorageArray = getLocalStorageData(contentType);
    
                let itemIsDuplicate = checkIfDuplicate(newSetlist, originalLocalStorageArray, contentType);
    
                if(itemIsDuplicate === false){
                    // Push the new setlist item into original array of setlists
                    originalLocalStorageArray.push(newSetlist);
        
                    // Push this new setlist array into local storage
                    pushToLocalStorage(contentType, originalLocalStorageArray);
        
                    // Clear the content section
                    clearContentSection();
        
                    // Reduce the content container size now the form has disappeared
                    adjustContainerSize();
        
                    // Diplay the new array of setlists
                    displaySetlists(originalLocalStorageArray);
        
                    // Change the footer buttons to viewing setlists
                    determineFooterButtons(contentType, "viewingSetlists");

                } else if (itemIsDuplicate === true){

                    alertUser(contentType, currentState, "alreadyExists");
                }
            }
        });

    } else if (contentType === "setlists" && currentState === "deleting"){
        saveButton.addEventListener("click", function(){
            let setsToBeDeleted = getCheckedItems(contentType);

            deleteItems(contentType, setsToBeDeleted, getLocalStorageData("setlists"));
        });

    } else if (contentType === "tracks" && currentState === "edit"){
        saveButton.addEventListener("click", function(){
            // Get the values from the input form
            let updatedTrackValues = getInputValues(contentType, contentData);
            
            // Get the setlist array from local storage
            let storedSetlistArray = getLocalStorageData("setlists");

            // Get the setlist name the track is currently in
            let setlistHeading = document.getElementById("page-header");

            // Shorten and lowercase the set the track is within
            let setHeading = removeSpaces(document.getElementById("page-subheader").textContent.toLowerCase());

            storedSetlistArray.forEach(setlist => {
                if(setlist.setlistName === setlistHeading.textContent){
                    let trackIndex = setlist[setHeading].findIndex((localStorageTrack => localStorageTrack.name === contentData.name));
                    setlist[setHeading][trackIndex].name = updatedTrackValues.name;
                    setlist[setHeading][trackIndex].artist = updatedTrackValues.artist;
                    setlist[setHeading][trackIndex].key = updatedTrackValues.key;
                    setlist[setHeading][trackIndex].tonality = updatedTrackValues.tonality;
                }
            });
            
            adjustContainerSize();

            pushToLocalStorage("setlists", storedSetlistArray);

            restartGigMate("setlists");
        });
    }
}

function fillLiveModalWithTracks(){
    // Get the setlist name, set number, modal title & list container
    let setlistName = document.getElementById("page-header").textContent;
    let setNumber = document.getElementById("page-subheader").textContent;
    let liveModalTitle = document.getElementById("live-mode-title");
    let liveModalListItemContainer = document.getElementById("live-mode-list");

    // Set title text to setlist name & set number
    liveModalTitle.textContent = setlistName + " - " + setNumber;

    // Make sure the list is clear before inserting tracks
    liveModalListItemContainer.innerHTML = "";

    // Get the tracks by sending the setlist name & set number
    let setTracks = getTracks(setlistName, setNumber);

    // For each track...
    setTracks.forEach(setTrack => {
        // ... create a live mode track
        let liveModeTrack = createLiveModeTrack(setTrack);

        // ... and insert it into the list container
        liveModalListItemContainer.innerHTML += liveModeTrack;
    });
}

function createLiveModeTrack(trackObject){
    // Get the template with track object data attached within
    let liveModeTrack = contentTemplates("liveModeTrack", trackObject);

    // Return the track as a live mode track
    return liveModeTrack;
}

// Credit: code for sorting an array of objects by property values
// taken from https://stackoverflow.com/questions/1129216/sort-array-of-objects-by-string-property-value
function sortByName( a, b ) {
    if ( a.name < b.name ){
      return -1;
    }
    if ( a.name > b.name ){
      return 1;
    }
    return 0;
  }

function editSet(){

    determineFooterButtons("setlists", "editingSet");

    let setName = document.getElementById("page-header").textContent;

    let setNumber = document.getElementById("page-subheader").textContent;
    
    clearContentSection();

    let tracks = getTracks(setName, setNumber);

    // Display each set track
    displayItems("checkboxTracks", tracks);
}

function getInputValues(contentType){

    let updatedTrackValues = {};

    if(contentType === "tracks"){

        updatedTrackValues.name = document.getElementById("track-name").value;
        updatedTrackValues.artist = document.getElementById("track-artist").value;
        updatedTrackValues.key = document.getElementById("track-key").value;
        updatedTrackValues.tonality = document.getElementById("track-tonality").value;
    
    }

    return updatedTrackValues;
}

function openSetlist(setButton){
    // Clear the content section
    clearContentSection();

    // Get the setlist item
    let setlistItem = ascendToParent(setButton);

    // Get the name of the setlist
    let setlistName = getSetlistName(setlistItem);

    updateHeading(setlistName, setButton.textContent);

    // Show appropriate footer buttons
    determineFooterButtons("setlists", "viewingSet");

    // Get tracks within set
    let tracks = getSetTracks(setButton);

    // Display each set track
    displayItems("tracks", tracks);
}

function updateHeading(newHeader, additionalHeader){

    // Get header section
    let headerContainer = document.getElementById("header-section").firstElementChild;

    // Create H1 element with id & class for new header
    let newFirstHeading = document.createElement("h1");
    newFirstHeading.id = "page-header";
    newFirstHeading.textContent = newHeader;

    // Create H2 element with id & class for new subheader
    let newSecondHeading = document.createElement("h2");
    newSecondHeading.id = "page-subheader";
    newSecondHeading.textContent = additionalHeader;

    while (headerContainer.firstElementChild) {
        headerContainer.removeChild(headerContainer.firstElementChild);
    }

    if(additionalHeader === undefined){
        headerContainer.appendChild(newFirstHeading);
        updateHeadingFlex("center", headerContainer);
    } else {
        headerContainer.appendChild(newFirstHeading);
        headerContainer.appendChild(newSecondHeading);
        updateHeadingFlex("between", headerContainer);
    }
}

function updateHeadingFlex(flexValue, headerSection){

    if (flexValue === "center"){
        headerSection.classList.remove("justify-content-between");
    } else {
        headerSection.classList.remove("justify-content-center");
        headerSection.classList.add("justify-content-between");
    }
}

function getSetTracks(setButton){
    // Get the setlist item
    let setlistItem = ascendToParent(setButton);

    // Get the name of the setlist
    let setlistName = getSetlistName(setlistItem);

    // Scan local storage & retrieve setlist tracks
    let setTracks = getTracks(setlistName, setButton.textContent);

    // Return the set tracks
    return setTracks;
}

function getTracks(nameOfRequestedSetlist, setName){
    // Get setlists from local storage
    let setlists = getLocalStorageData("setlists");

    // Intialise an array that'll store the tracks
    let setTracks = [];

    // For each setlist in local storage...
    setlists.forEach(setlist => {
        // ... if the setlist names match...
        if (setlist.setlistName === nameOfRequestedSetlist){
            // Get the particular set
            switch (setName){
                case 'Set 1': 
                setTracks = setlist.set1;
                break;
                case 'Set 2': 
                setTracks = setlist.set2;
                break;
                case 'Set 3': 
                setTracks = setlist.set3;
                break;
            }
        }
    });

    // Return the set tracks array
    return setTracks;
}

function updateSetInLocalStorage(newSet, setlistName, setNumber){
    // Get setlists from local storage
    let currentSetlistsInLocalStorage = getLocalStorageData("setlists");

    let setlistToChange = currentSetlistsInLocalStorage.filter(setlist => setlist.setlistName === setlistName);
    setlistToChange = setlistToChange[0];

    switch(setNumber){
        case "Set 1":
            setlistToChange.set1 = newSet;
        break;
        case "Set 2":
            setlistToChange.set2 = newSet;
        break;
        case "Set 3":
            setlistToChange.set3 = newSet;
        break;
    }

    pushToLocalStorage("setlists", currentSetlistsInLocalStorage);
}

function getSetlistName(setlistItem){
    return setlistItem.firstElementChild.firstElementChild.textContent;
}

function ascendToParent(currentPosition){
    while (currentPosition.className !== "accordion-item"){
        currentPosition = currentPosition.parentElement;
    }
    return currentPosition;
}

function getNames(elementType, tracks){

    // Init an array
    let names = [];

    if(elementType === "trackCard"){
        tracks.forEach(checkedTrack => {
            names.push(checkedTrack.parentElement.parentElement.firstElementChild.firstElementChild.textContent);
        });
    } else if (elementType === "saveSetCards"){
        tracks.forEach(savedTrack => {
            names.push(savedTrack.textContent);
        });
    }

    return names;
}

function deleteItems(contentType, itemsToBeDeleted, itemsInStorage){
    // Initialise an array that'll store a new array to be sent to local storage
    let newItemArray = [];

    if (contentType === "setlists"){

        // For each setlist in local storage...
        itemsInStorage.forEach(setlist => {
            // Look through each item to be deleted
            itemsToBeDeleted.forEach(itemToDelete => {
                // If the setlist names of both match, go through this code
                if (setlist.setlistName === itemToDelete.setlistName){
                    
                    // If the item to delete contains a set property, remove that property from the set retrieved from local storage
                    if(itemToDelete.hasOwnProperty("set1")){
                        delete setlist.set1;
                    }
                    if(itemToDelete.hasOwnProperty("set2")){
                        delete setlist.set2;
                    }
                    if(itemToDelete.hasOwnProperty("set3")){
                        delete setlist.set3;
                    }
                }

            });
            
            // Calculate amount of properties (sets) the setlist has
            let setlistSize = Object.size(setlist);
            
            // If setlist only has setlistName property, delete setlist
            if (setlistSize === 1){
                delete itemsInStorage[setlist];
            } else {
                let fixedSetlist = fixSetlist(setlist);
                newItemArray.push(fixedSetlist);
            }
        });
    }

    pushToLocalStorage(contentType, newItemArray);

    restartGigMate(contentType);
}

// Credit: code to retrieve the amount of properties an object contains was taken from: https://stackoverflow.com/a/6700/15607265
Object.size = function(obj) {
    var size = 0,
      key;
    for (key in obj) {
      if (obj.hasOwnProperty(key)) size++;
    }
    return size;
  };

function fixSetlist(setlist){

    if (setlist.hasOwnProperty("set3") && !setlist.hasOwnProperty("set2")){

        setlist.set2 = setlist.set3;
        delete setlist.set3;
    }
    if (setlist.hasOwnProperty("set3") && setlist.hasOwnProperty("set2") && !setlist.hasOwnProperty("set1")){

        setlist.set1 = setlist.set2;
        setlist.set2 = setlist.set3;
        delete setlist.set3;
    }
    if (setlist.hasOwnProperty("set2") && !setlist.hasOwnProperty("set1")){

        setlist.set1 = setlist.set2;
        delete setlist.set2;
    }

    return setlist;
}

function getCheckedItems(contentType){

    // Initialise an array that stores the checked items
    let checkedItems = [];

    // If the content type is...
    if (contentType === "setlists"){
        
        // ... setlists, get the setlist items
        let setlists = [...document.getElementsByClassName("accordion-item")];

        // For each setlist item...
        setlists.forEach(setlist => {

            // Initialise an object that'll be used to compare and then delete the setlists
            let deleteSetItem = {};

            // ... get all possible checkboxes
            let setlistHeaderCheckBox = setlist.firstElementChild.firstElementChild.firstElementChild;

            // Set the name of the delete item object of the heading in the accordion
            deleteSetItem.setlistName = setlistHeaderCheckBox.parentElement.textContent;

            // If the setlist has one set
            if (setlist.children[1].firstElementChild.firstElementChild.firstElementChild.children.length === 1){
                let set1Checkbox = setlist.children[1].firstElementChild.firstElementChild.firstElementChild.children[0].firstElementChild;

                if (set1Checkbox.hasAttribute("checked")){
                    deleteSetItem.set1 = "";
                }
            }

            // If the setlist has two sets
            if (setlist.children[1].firstElementChild.firstElementChild.firstElementChild.children.length === 2){
                let set1Checkbox = setlist.children[1].firstElementChild.firstElementChild.firstElementChild.children[0].firstElementChild;
                let set2Checkbox = setlist.children[1].firstElementChild.firstElementChild.firstElementChild.children[1].firstElementChild;

                if (set1Checkbox.hasAttribute("checked")){
                    deleteSetItem.set1 = "";
                }

                if (set2Checkbox.hasAttribute("checked")){
                    deleteSetItem.set2 = "";
                }

            }

            // If the setlist has three sets
            if (setlist.children[1].firstElementChild.firstElementChild.firstElementChild.children.length === 3){
                let set1Checkbox = setlist.children[1].firstElementChild.firstElementChild.firstElementChild.children[0].firstElementChild;
                let set2Checkbox = setlist.children[1].firstElementChild.firstElementChild.firstElementChild.children[1].firstElementChild;
                let set3Checkbox = setlist.children[1].firstElementChild.firstElementChild.firstElementChild.children[2].firstElementChild;

                if (set1Checkbox.hasAttribute("checked")){
                    deleteSetItem.set1 = "";
                }

                if (set2Checkbox.hasAttribute("checked")){
                    deleteSetItem.set2 = "";
                }

                if (set3Checkbox.hasAttribute("checked")){
                    deleteSetItem.set3 = "";
                }
            }

            checkedItems.push(deleteSetItem);
        });

    } else if (contentType === "tracks"){
        // Get all checkboxes
        let checkboxes = [...document.getElementsByClassName('form-check-input')];

        // Create a new array with checked checkboxes
        checkedItems = checkboxes.filter(checkbox => checkbox.hasAttribute("checked"));

    }

    return checkedItems;
}

function alertUser(contentType, currentState, issue){
    // Initialise an alert variable that will store the alert element
    let alertElement;

    // If we're dealing with...
    if (contentType === "setlists" && currentState === "new"){

        // ... a new setlist, grab the alert template
        alertElement = contentTemplates("alert", '' , issue);

        // Get the name input
        let input = document.getElementById('form-name');

        // Append the alert into the parent element of the input, alerting the user
        input.parentElement.appendChild(alertElement);

        // After three seconds, remove the alert
        setTimeout(() => {
            input.parentElement.removeChild(alertElement);
        }, 3000);
    }
}

function checkIfDuplicate(createdItem, originalItems, contentType) {
    // Create a variable that stores the boolean that dictates whether the created item is a duplicate
    let itemIsDuplicate = false;

    // If the content type we're dealing with is...
    if (contentType === "setlists"){

        // ... setlists, check each setlist name in each stored array
        originalItems.forEach(storedArray => {

            // If the names match, set itemIsDuplicate to true
            if(storedArray.setlistName === createdItem.setlistName){
                itemIsDuplicate = true;
            }
        });
    }

    // Return the boolean variable 
    return itemIsDuplicate;
}

function createNewItem(type){
    // Initialise an empty object variable
    let newItem = {};

    // If the newItem type provided is...
    if (type === "setlist"){
        // ... a setlist, get the form-name and add it as a setlist name property
        newItem.setlistName = document.getElementById("form-name").value;

        // Get the amount of sets requested by getting the last character of the radio button id
        let checkedSetButton = document.querySelector(
            'input[name="setlist-sets"]:checked');
        
        // Now we know the amount of sets we need, create them in the empty object
        if (checkedSetButton.id.slice(checkedSetButton.id.length -1) === "1"){
            newItem.set1 = [];
        } else if (checkedSetButton.id.slice(checkedSetButton.id.length -1) === "2"){
            newItem.set1 = [];
            newItem.set2 = [];
        } else if (checkedSetButton.id.slice(checkedSetButton.id.length -1) === "3"){
            newItem.set1 = [];
            newItem.set2 = [];
            newItem.set3 = [];
        }

        // Return the new setlist object
        return newItem;

    } else if (type === "track"){
        newItem.name = document.getElementById("");
    }

    // Return the newly created item
    return newItem;
}

function openForm(type, data){
    // Before we open the form, clear the content section
    clearContentSection();

    // Prepare the content container for the form by enlarging it
    adjustContainerSize();

    // Initialise a variable to store the form
    let form = document.createElement("form");

    // Give the form it's respective classes
    form.className = "rounded-corners row animate__animated animate__fadeInUp";

    // Give it an id
    form.id = "input-form";

    // ... get parent
    let contentContainer = document.getElementById("content-container");

    // If the type of form required is a...
    if (type === "newSetlist"){
        // ... new setlist, set the inner HTML of the form to the new setlist template
        form.innerHTML = contentTemplates("newSetlistForm");

        // ... display buttons appropriate for new setlists
        determineFooterButtons("setlists", "new");
    } else if (type === "editTrack"){

        form.innerHTML = contentTemplates("editTrack", data);

        determineFooterButtons("tracks", "edit", data);

    }

    // ... new setlist form
    contentContainer.appendChild(form);
}

function adjustContainerSize(){
    let contentContainer = document.getElementById("content-container");

    contentContainer.classList.toggle("enlarge");
    contentContainer.parentNode.classList.toggle("enlarge");
}


function displayItems(contentType, contentItems, reference){
    // If the content type is...
    if (contentType === "setlist"){
        // ... setlist, retrieve the setlist accordion & insert the setlist item (contentItems[0]) within the inner HTML of the accordion
        document.getElementById("setlistAccordion").innerHTML += contentItems[0];

        // ...then push the set buttons (contentItems[1]) into the setlist item
        document.getElementById(`collapse${reference}`).firstElementChild.firstElementChild.innerHTML = contentItems[1].outerHTML;

    } else if (contentType === "tracks"){
        // Insert & collect an ordered list container
        let container = insertListContainer("ordered");

        // For each track...
        contentItems.forEach(track => {
            container.appendChild(createCard(track, false));
        });

    } else if (contentType === "addTracks"){
        // Insert & collect an ordered list container
        let container = insertListContainer("ordered");

        // For each track...
        contentItems.forEach(track => {
            // ... create a card with the track properties
            container.appendChild(createCard(track, true, false));
        });

        // Add an event listener to every checkbox
        addCheckBoxListeners("setlists");

    } else if (contentType === "checkboxTracks"){
        // Insert & collect an ordered list container
        let container = insertListContainer("ordered");

        container.addEventListener("dragover", e => {
            e.preventDefault();
            // Credit: code to get element closest & append
            // To container taken from https://www.youtube.com/watch?v=jfYWwQrtzzY
            const afterElement = getDragAfterElement(container, e.clientY);
            const draggable = document.querySelector(".dragging");
            if (afterElement == null) {
                container.appendChild(draggable);
            } else {
                container.insertBefore(draggable, afterElement);
            }
        });

        // For each track...
        contentItems.forEach(track => {
            // ... create a card with the track properties
            container.appendChild(createCard(track, true, true));
        });

        // Add an event listener to every checkbox
        addCheckBoxListeners("setlists");
    }
}

// Credit: code to get element closest to mouse position taken from https://www.youtube.com/watch?v=jfYWwQrtzzY
function getDragAfterElement(container, mousePosition){
    let draggableElements = [...container.querySelectorAll(".draggable:not(.dragging)")];

    return draggableElements.reduce((closestElement, child) => {
        const box = child.getBoundingClientRect();
        const offset = mousePosition - box.top - box.height / 2;
        if (offset < 0 && offset > closestElement.offset){
            return { offset: offset, element: child };
        } else {
            return closestElement;
        }
    }, { offset: Number.NEGATIVE_INFINITY }).element;
}

function insertListContainer(type){

    // Init a container
    let container;

    if (type === "ordered"){
        container = document.createElement("ol");

        container.id = "list-container";

        container.className = "row p-0 m-0";
    }

    // Push list container into content container
    document.getElementById("content-container").appendChild(container);

    // Return container object
    return container;
}

function createCard(track, insertCheckbox, insertHover) {
    // Create list element
    let card = document.createElement("li");

    // Add classes to list element
    card.classList.add("col-12", "d-flex", "justify-content-center", "align-items-center", "my-1", "draggable");

    if (insertCheckbox === false){
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

        // Add event listener
        card.addEventListener("click", function(){
            openForm("editTrack", track);
        });

        // Add a hover state to the card
        addIconHover(card.firstElementChild);

    } else if (insertCheckbox === true && insertHover === true){
        card.innerHTML = 
        `<button class="btn-card animate__animated animate__fadeInUp">
        <div class="card gig-card rounded-corners">
            <div class="card-body row">
                <div class="col-8 gig-venue text-start">
                    <h3 class="card-title">${track.name}</h3>
                </div>
                <div class="col-4 text-end">
                    <i class="fas fa-arrows-alt-v rep-icon"></i>
                    <input class="form-check-input track-checkbox" type="checkbox">
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

        // Add a hover state to the card
        addIconHover(card.firstElementChild);

        // Make the card able to be dragged
        card.setAttribute("draggable", true);

        // Add eventlisteners relating to drag and drop
        card.addEventListener("dragstart", dragStart);
        card.addEventListener("dragend", dragEnd);
    } else if (insertCheckbox === true && insertHover === false){
        card.innerHTML = 
        `<button class="btn-card animate__animated animate__fadeInUp">
        <div class="card gig-card rounded-corners">
            <div class="card-body row">
                <div class="col-8 gig-venue text-start">
                    <h3 class="card-title">${track.name}</h3>
                </div>
                <div class="col-4 text-end">
                    <input class="form-check-input set-checkbox" type="checkbox">
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
    }

    // Return the card
    return card;
}

function dragStart(){
    // Add the class of dragging when dragging
    this.classList.add("dragging");
}

function dragEnd(){
    // Remove the class of dragging when dropped
    this.classList.remove("dragging");
}

// Change color of card open icon to represent hovered state
function addIconHover (card) {
    // When hovering over the button area, the icon will turn purple
    card.addEventListener('mouseenter', function(){
      paintIcon(card);
    });

    // When leaving the button area, the icon will revert to grey
    card.addEventListener('mouseleave', function(){
      paintIcon(card);
    });
}

// Toggle a class to paint the edit icon
function paintIcon (card) {
    // Grab the icon within the card
    let icon = card.firstElementChild.firstElementChild.children[1].firstElementChild;
    // Check if the icon has a class of icon-hover
    if (icon.classList.contains("icon-hover")){
      // If so, remove the class to revert back to the grey color
      icon.classList.remove("icon-hover");
    }  else {
      // If not, add the class to turn the icon color to purple
      icon.classList.add("icon-hover");
    }
  }

// This function contains all templates that are used within GigMate
function contentTemplates(request, contentData, issue){
    // Initialise a variable to store the template
    let template;

    // If the request is...
    if (request === "setlistAccordionBody"){
        //... a section accordion body, create a ul element
        template = document.createElement("ul");

        // then set the class name of the ul element to the bootstrap accordion
        template.className = "accordion";

        // give the ul element a unique id of setlistAccordion
        template.id = "setlistAccordion";

        // then return the HTML
        return template.outerHTML;

    } else if (request === "setlistAccordionItem") {
        // ... a setlist accordion, create a reference of the setlistname without spaces so the accordion can function properly
        let reference = removeSpaces(contentData.setlistName);

        // ... then assign the template variable to the setlist template with data & references attached
        template = 
        `
        <li class="accordion-item">
            <h2 class="accordion-header" id="heading${reference}">
              <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapse${reference}" aria-expanded="false" aria-controls="collapse${reference}">${contentData.setlistName}</button>
            </h2>
            <div id="collapse${reference}" class="accordion-collapse collapse" aria-labelledby="heading${reference}" data-bs-parent="#setlistAccordion">
              <div class="accordion-body p-0">
                <ul class="list-group list-group-flush">
                </ul>
              </div>
            </div>
          </li>
        `;

        // ... evaluate how many set buttons need to be created and store them in a variable
        let setButtons = createSetButtons(contentData);

        // ... then return the setlist template along with the set buttons
        return [template, setButtons];
        
    } else if (request === "newSetlistForm") {
        template = 
        `
        <div class="col-12">
            <h3>New Setlist</h3>
        </div>
        <div class="col-12">
            <label for="form-name">Name:</label>
            <input id="form-name" type="text" value="" class="rounded-corners" required>
        </div>
        <div class="row">
            <label>Amount Of Sets:</label>
            <div class="col-4">
                <input class="form-check-input" type="radio" name="setlist-sets" id="setlist-sets-1">
                <label class="form-check-label" for="setlist-sets-1">1</label>
            </div>
            <div class="col-4">
                <input class="form-check-input" type="radio" name="setlist-sets" id="setlist-sets-2" checked>
                <label class="form-check-label" for="setlist-sets-1">2</label>
            </div>
            <div class="col-4">
                <input class="form-check-input" type="radio" name="setlist-sets" id="setlist-sets-3">
                <label class="form-check-label" for="setlist-sets-1">3</label>
            </div>
        </div>
        `;

        return template;

    }  else if (request === "alert") {
        template = document.createElement('div');

        template.className = "alert alert-danger";

        template.setAttribute('role', 'alert');

        if (issue === "alreadyExists") {
            template.textContent = "Sorry this setlist name already exists, create a new one!";
        } else if (issue === "emptyInput") {
            template.textContent = "The name input was empty, please enter a name!";
        }

        return template;
    } else if (request === "editTrack") {

        template = 
        `
        <div class="col-12">
            <h3>Edit Track</h3>
        </div>
        <div class="col-12">
        <label for="track-name">Track:</label>
        <input id="track-name" type="text" value="${contentData.name}" class="rounded-corners">
        </div>
        <div class="col-12">
        <label for="track-artist">Artist:</label>
        <input id="track-artist" type="text" value="${contentData.artist}" class="rounded-corners">
        </div>
        <div class="col-12">
        <label for="track-key">Key:</label>
        <select name="keys" id="track-key" class="rounded-corners">
            <option value="${contentData.key}" selected hidden>${contentData.key}</option>
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
            <option value="${contentData.tonality}" selected hidden>${contentData.tonality}</option>
            <option value="Major">Major</option>
            <option value="Minor">Minor</option>
        </select>
        </div>
        `;

        return template;
    } else if (request === "liveModeTrack"){

        // Create a variable that holds both the key & tonality
        let keyInFull = contentData.key + " " + contentData.tonality;
        
        template = 
        `
        <li class="live-mode-track list-group-item">
              <div class="live-track-content row">
                <div class="col">
                  <h5 class="live-track-title d-inline-block m-0">${contentData.name}</h5>
                </div>
                <div class="col-4">
                  <h5 class="live-track-key m-0">${keyInFull}</h5>
                </div>
              </div>
            </li>
        `;

        return template;
    }

    // Return the template
    return [template, setButtons];
}

// Credit: the code below that removes spaces within strings was found from: https://stackoverflow.com/a/51321865/15607265
function removeSpaces(string){
    // Return the received string without spaces
    return string.replace(/ /g, '');
}

function createSetButtons(setlist){
    // To create set buttons for a setlist...
    // ... firstly, we must create an li element, which will contain the buttons
    let setButtonContainer = document.createElement("li");

    // ... we'll give the container the appropriate accordion Bootstrap 5 classes
    setButtonContainer.className = "list-group-item list-group-item-action";

    // ... then initialise a variable that will store the button elements the particular set needs
    let setlistSetButtons;
    
    // If the setlist has...
    if (!("set2" in setlist)) {
        // ... no set 2, this means there is only 1 set so only 1 button is needed
        setlistSetButtons = '<button type="button" class="list-group-btn">Set 1</button>';
    } else if (!("set3" in setlist)) {
        // ... no set 3, this means there are two sets, so two buttons are needed
        setlistSetButtons = '<button type="button" class="list-group-btn">Set 1</button>';
        setlistSetButtons += '<button type="button" class="list-group-btn">Set 2</button>';
    } else {
        // ... all 3 sets, it needs 3 buttons
        setlistSetButtons = '<button type="button" class="list-group-btn">Set 1</button>';
        setlistSetButtons += '<button type="button" class="list-group-btn">Set 2</button>';
        setlistSetButtons += '<button type="button" class="list-group-btn">Set 3</button>';
    }

    // Insert the buttons within the button container
    setButtonContainer.innerHTML = setlistSetButtons;

    // Return the button container containing the appropriate amount of buttons
    return setButtonContainer;
}

function restartGigMate(contentType){
    clearContentSection();
    startGigMate(contentType);
}

function clearContentSection () {
    let contentSection = document.getElementById("content-container");
    contentSection.firstElementChild.className += " animate__animated animate__fadeOutUp";
    contentSection.innerHTML = "";
  }