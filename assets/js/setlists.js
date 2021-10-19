// When DOM content is loaded...
window.addEventListener("DOMContentLoaded", function () {

    // Check a repertoire exists in local storage, if not add the initialised JSON
    checkPresenceOfRepertoire();

    // Check if dark mode is enabled
    checkDarkMode();

    // Knowing the type of content it'll be dealing with, start the application with the contentType as a parameter
    startGigMate("setlists");
});

async function startGigMate(contentType) {
    // Firstly, start local storage functionality to determine what data items GigMate will be working with
    let contentData = await collectLocalStorage(contentType);

    // If the content type is...
    if (contentType === "setlists") {
        // ... setlists, create setlists
        displaySetlists(contentData, false);
    }

    // Set the footer buttons to viewing setlists on initial load
    determineFooterButtons(contentType, "viewingSetlists", contentData);
}

async function collectLocalStorage(contentType) {
    // To collect local storage...
    // Firstly check if there is already data present within local storage using the contentType provided
    let hasLocalStorage = checkLocalStorage(contentType);

    // Initialise a variable that will store the recieved parsed JSON file data
    let contentData;

    // If there is...
    if (hasLocalStorage === true) {
        // ...local storage, retrieve the data from local storage
        contentData = getLocalStorageData(contentType);
    } else if (hasLocalStorage === false) {
        // ...no local storage, add the initialised JSON file to local storage
        await addInitialisedJSONToLocalStorage(contentType);
        // Once the data has been added, retrieve the data from local storage
        contentData = getLocalStorageData(contentType);
    }
    // Return the content data from local storage
    return contentData;
}

function checkLocalStorage(contentType) {
    // Return true if local storage exists, return false if not
    return (localStorage.getItem(contentType)) ? true : false;
}

function getLocalStorageData(contentType) {
    // Init a variable that'll store the received data from local storage
    let storedData;

    // Depending on the content type, store the recieved item(s) from local storage
    if (contentType === "setlists") {
        storedData = JSON.parse(localStorage.getItem("setlists"));
    } else if (contentType === "repertoire") {
        storedData = JSON.parse(localStorage.getItem("repertoire"));
    } else if (contentType === "darkMode") {
        storedData = JSON.parse(localStorage.getItem("darkMode"));
    }

    // Return the recieved items from local storage
    return storedData;
}

function checkDarkMode() {
    // Init a variable that'll store the current dark mode setting in local storage
    let darkModeStatus = getLocalStorageData("darkMode");;

    if (darkModeStatus === undefined) {
        /* If undefined, it's likely going to be an initial load of GigMate,
        so push an intial key value item to local storage for dark mode */
        pushToLocalStorage("darkMode", "off");
    } else if (darkModeStatus === "on") {
        /* If dark mode has been set to on, set the data-theme HTML attribute
        to dark to change element colours to dark colours */
        document.documentElement.setAttribute("data-theme", "dark");
        // Set the switch on initial load to the on position
        document.getElementById("dark-mode-switch").checked = true;
    }
}

async function addInitialisedJSONToLocalStorage(contentType) {
    // Init a variable that'll store the local JSON file data
    let localJSONData;

    // If the contentType is...
    if (contentType === "setlists") {
        // ...setlists, fetch & store the setlists from the init setlists JSON file
        localJSONData = await getInitialJSONData("assets/json/init-setlists.json");
    } else if (contentType === "repertoire") {
        // ...repertoire, fetch & store the repertoire tracks from the init setlists JSON file
        localJSONData = await getInitialJSONData("assets/json/init-repertoire.json");
    }

    // Push the JSON data received from local JSON files to local storage
    pushToLocalStorage(contentType, localJSONData);
}

async function getInitialJSONData(pathToJSONFile) {
    // Fetch & store the data contained within the JSON file
    let fileData = await fetch(pathToJSONFile);

    // Collect the json within the fileData promise and return it
    return fileData.json();
}

function pushToLocalStorage(contentType, contentData) {
    // Push the given content type (key) & content data (value) to local storage
    localStorage.setItem(contentType, JSON.stringify(contentData));
}

async function checkPresenceOfRepertoire() {
    // If repertoire does not exist in local storage...
    if (!localStorage.getItem("repertoire")) {
        // push the initial repertoire tracks from the init repertoire JSON file to local storage
        pushToLocalStorage("repertoire", await getInitialJSONData("assets/json/init-repertoire.json"));
    }
}

function displaySetlists(setlists, insertingCheckbox) {
    // Get the content container
    let contentContainer = document.getElementById("content-container");

    // Get the accordion body element
    let accordionBody = contentTemplates("setlistAccordionBody");

    // Insert the accordion body element within the content container
    contentContainer.innerHTML = accordionBody;

    // For each setlist within the setlist array provided...
    setlists.forEach(setlist => {
        // ... build an accordion item with a setlist header & set buttons using the setlist data
        let [setlistTemplate, setButtons] = contentTemplates("setlistAccordionItem", setlist);

        // ... display the accordion item containing the respective setlist data
        displayItems("setlist", [setlistTemplate, setButtons], removeSpaces(setlist.setlistName));

        // If the intention is to simply display and not delete the items...
        if (insertingCheckbox === undefined) {
            // ... add event listeners to the respective set buttons
            insertButtonEventListeners();
        }
    });
}

function viewSet(setlistName, setNumber) {

    // Init a variable that'll hold the tracks given using the setlist name & set number
    let tracks = getTracksFromLocalStorage(setlistName, setNumber);

    // Clear the contents within the content container
    clearContentSection();

    // Present the buttons for viewing sets
    determineFooterButtons("setlists", "viewingSet");

    // Display the set using the tracks previously retrieved
    displayItems("tracks", tracks);
}

function prepareToEditMultipleItems(contentType) {

    // If the content type is...
    if (contentType === "setlists") {

        // Setlists, show the buttons for deleting setlists
        determineFooterButtons(contentType, "deleting");

        // Store the setlists in local storage within a variable
        let setlists = getLocalStorageData(contentType);

        // Display the setlists with insertCheckbox set to true
        displaySetlists(setlists, true);

        // Get the setlist accordion items currently displayed
        let setlistArray = [...document.getElementsByClassName("accordion-item")];

        // For each setlist accordion item displayed...
        setlistArray.forEach(setlist => {

            // Remove the bootstrap data-bs-parent attribute so all accordion items can be opened
            setlist.children[1].removeAttribute("data-bs-parent");

            // Open all accordion items
            setlist.children[1].classList.add("show");

            // Remove the accordion collapse functionality so accordions are statically open
            setlist.firstElementChild.firstElementChild.removeAttribute("data-bs-toggle");

            // Remove the icon beside each accordion header
            setlist.firstElementChild.firstElementChild.className = "accordion-button removed collapsed";

            // Insert a checkbox that'll replace the icon
            setlist.firstElementChild.firstElementChild.appendChild(getDeleteCheckBox("setlist"));

            // Get all set buttons within that particular setlist
            let setButtons = [...setlist.children[1].firstElementChild.firstElementChild.firstElementChild.children];

            // For each set button, append a checkbox
            setButtons.forEach(setButton => {
                // Add class that removes hover functionality
                setButton.classList.add("remove-hover");
                // Add a delete checkbox for a set (not a setlist)
                setButton.appendChild(getDeleteCheckBox());
            });
        });

        // Apply checkbox listeners to recently appended checkboxes
        addCheckBoxListeners(contentType);
    } 
}

function addCheckBoxListeners(contentType) {

    // Get all checkboxes currently onscreen
    let checkboxes = [...document.getElementsByClassName("form-check-input")];

    // If the content type is...
    if (contentType === "setlists") {
        // Setlists, add an event listener to each check box on display
        checkboxes.forEach(function (checkbox) {
            // If the checkbox represents a setlist instead of a singular set...
            if (checkbox.classList.contains("set-checkbox")) {
                // ... add an event listener where on click, the child sets of a setlist will also be selected or deselected
                checkbox.addEventListener('click', function (e) {
                    // Prevent default checkbox click behaviour
                    e.preventDefault();

                    // Toggle the checked attribute when clicked
                    checkbox.toggleAttribute("checked");

                    // If the checkbox is within an accordion meaning it's not a track card
                    if (checkbox.parentElement.parentElement.className !== "card-body row") {
                        // Toggle the checked status of the sets within the setlist
                        toggleChildSets(checkbox);
                    }
                });
            } else {
                // Else if it's a checkbox representing a singular set
                checkbox.addEventListener('click', function (e) {
                    // Prevent default checkbox click behaviour
                    e.preventDefault();
                    // Toggle the attribute of checked of this particular checkbox
                    checkbox.toggleAttribute("checked");
                });
            }
        });
    }
}

function toggleChildSets(checkbox) {
    // Get the accordion item containing the setlist and it's sets
    let container = ascendToParent(checkbox, "accordion-item");

    // Grab the set buttons within the setlist
    let setButtons = [...container.getElementsByClassName("list-group-btn remove-hover")];

    // If the setlist header checkbox...
    if (checkbox.hasAttribute("checked")) {
        // ... is checked, apply the attribute of checked to all set checkboxes
        setButtons.forEach(setButton => {
            setButton.firstElementChild.setAttribute("checked", '');
        });
    } else if (!checkbox.hasAttribute("checked")) {
        // Else if it does not have the attribute of checked
        setButtons.forEach(setButton => {
            // Make sure all sets within the setlist have the attribute of checked removed
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

    // Return a checkbox to function called
    return checkbox;
}

function determineFooterButtons(contentType, currentState, contentData) {
    // Before we touch any buttons, we must first retrieve the container
    let btnContainer = document.getElementById("btn-footer-container");

    // And we must make sure before making any changes, that it's clear of any content
    btnContainer.innerHTML = "";

    // Insert the back button as it's present in most states.
    btnContainer.innerHTML = insertButton("back");

    // If the user is...
    if (contentType === "setlists" && currentState === "viewingSetlists") {
        // ... viewing setlists, display the back & add buttons
        btnContainer.innerHTML += insertButton("edit");
        btnContainer.innerHTML += insertButton("add");
    } else if (contentType === "setlists" && currentState === "viewingSet") {
        btnContainer.innerHTML += insertButton("edit");
        btnContainer.innerHTML += insertButton("expand");
    } else if (contentType === "setlists" && currentState === "editingSet") {
        btnContainer.innerHTML = insertButton("add");
        btnContainer.innerHTML += insertButton("delete");
        btnContainer.innerHTML += insertButton("save");
    } else if (contentType === "setlists" && currentState === "addTracksToSet") {
        btnContainer.innerHTML += insertButton("save");
    } else if (contentType === "setlists" && currentState === "new") {
        btnContainer.innerHTML += insertButton("save");
    } else if (contentType === "setlists" && currentState === "deleting") {
        btnContainer.innerHTML += insertButton("delete");
    } else if (contentType === "tracks" && currentState === "edit") {
        btnContainer.innerHTML += insertButton("save");
    }

    // Add event listeners to the buttons displayed on screen
    insertButtonEventListeners(contentType, currentState, contentData);
}


function insertButton(type) {
    // Initialise a variable to store the button
    let button;

    // Set button function based on type
    switch (type) {
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

function insertButtonEventListeners(contentType, currentState, contentData) {
    // Retrieve all possible buttons
    let addButton = document.getElementById("btn-add");
    let deleteButton = document.getElementById("btn-delete");
    let saveButton = document.getElementById("btn-save");
    let editButton = document.getElementById("btn-edit");
    let expandButton = document.getElementById("btn-expand");
    let itemButtons = [...document.getElementsByClassName("list-group-btn")];

    if (contentType === "setlists" && currentState === "viewingSetlists") {
        // If the user is viewing setlists... 
        addButton.addEventListener('click', function () {
            // The add button will open a create new setlist form
            openForm("newSetlist");
        });
        editButton.addEventListener('click', function () {
            // The edit button will prepare the items to be deleted
            prepareToEditMultipleItems(contentType);
        });
        itemButtons.forEach(button => {
            // Add a click listener for every button in content section
            button.addEventListener('click', function () {
                openSetlist(button);
            });
        });

    } else if (contentType === "setlists" && currentState === "viewingSet") {
        // If the user is viewing a set within a setlist...
        editButton.addEventListener('click', function () {
            /* The edit button will prepare set items to be edited by
            getting the setlist name & set number */
            let setlistName = document.getElementById("page-header").textContent;
            let setNumber = document.getElementById("page-subheader").textContent;

            /* And calling the edit set function sending the setlist
            name and set number */
            editSet(setlistName, setNumber);
        });

        expandButton.addEventListener('click', function () {
            // The expand button will full screen the set
            fillLiveModalWithTracks();
            // The dark mode switch will be given it's event listener
            addDarkModeSwitchListener();
        });

    } else if (contentType === "setlists" && currentState === "editingSet") {
        // If the user is editing a set within a setlist...
        addButton.addEventListener('click', function () {
            /* The add button will display the repertoire
            by clearing the content section */
            clearContentSection();

            // Getting the repertoire tracks from local storage
            let tracksInLocalStorage = getLocalStorageData("repertoire");

            // Sorting the tracks by track name from A-Z
            tracksInLocalStorage.sort(sortByName);

            // Displaying the tracks as track cards to the user
            displayItems("addTracks", tracksInLocalStorage);

            // Show the footer buttons for saving the tracks
            determineFooterButtons("setlists", "addTracksToSet");
        });

        deleteButton.addEventListener('click', function () {
            /* The delete button will the tracks checked by
            Collecting the tracks checked */
            let checkedTracks = getCheckedItems("tracks");

            // Getting the names of tracks that have checked checkboxes
            let checkedTrackNames = getNames("trackCard", checkedTracks);

            // Get the current setlist name & set number
            let setlistName = document.getElementById("page-header").textContent;
            let setNumber = document.getElementById("page-subheader").textContent;
            
            // Get the array of set tracks from local storage
            let setTracks = getTracksFromLocalStorage(setlistName, setNumber);

            /* Create a new set array of names that'll be used to
            delete from the array created from local storage */
            let namesToDelete = new Set(checkedTrackNames);

            // Create a new set which filters out the checked tracks
            // Credit: code to remove array with another
            // array taken from https://melvingeorge.me/blog/remove-elements-contained-in-another-array-javascript
            let newSet = setTracks.filter(setTrack => {
                return !namesToDelete.has(setTrack.name);
            });

            // Update local storage with the new set created
            updateSetInLocalStorage(newSet, setlistName, setNumber);

            // Revert back to viewing the set after editing
            viewSet(setlistName, setNumber);
        });

        saveButton.addEventListener('click', function () {
            /* The save button will save the set in it's displayed order by
            getting the tracks currently displayed within the set */
            let trackCards = [...document.getElementsByClassName("track-card")];

            // Init an array that'll be the new set to replace the original
            let newSet = [];

            /* Create objects with each track card displayed and push that
            object into the new set to be pushed to local storage */
            trackCards.forEach(trackCard => {
                newSet.push(createTrackObject(trackCard));
            })

            // Get the setlist name from the header
            let setlistName = document.getElementById("page-header").textContent;
            let setNumber = document.getElementById("page-subheader").textContent;

            // Push the new set into local storage
            updateSetInLocalStorage(newSet, setlistName, setNumber);

            // Revert back to viewing the set after saving
            viewSet(setlistName, setNumber);
        });

    } else if (contentType === "setlists" && currentState === "addTracksToSet") {
        // If the user is adding tracks to a set...
        saveButton.addEventListener('click', function () {
            /* The save button will add the tracks to the set by
            collecting the tracks checked */
            let checkedTracks = getCheckedItems("tracks");

            // Getting the names of tracks that have been checked
            let checkedTrackNames = getNames("trackCard", checkedTracks);

            // Getting the repertoire tracks from local storage
            let tracksInLocalStorage = getLocalStorageData("repertoire");

            // Initialising an array to store the track objects to add
            let trackObjectsToAdd = [];

            // For each checked track, get the matching track object in local storage
            checkedTrackNames.forEach(checkedTrack => {
                tracksInLocalStorage.forEach(track => {
                    if (track.name === checkedTrack) {
                        trackObjectsToAdd.push(track);
                    }
                });
            });

            // Getting the setlist name & set number
            let setlistName = document.getElementById("page-header").textContent;
            let setNumber = document.getElementById("page-subheader").textContent;

            // Getting the original set tracks from local storage
            let setlistTracks = getTracksFromLocalStorage(setlistName, setNumber);

            // Adding the checked track objects to setlist tracks array
            setlistTracks.push(...trackObjectsToAdd);

            // Update local storage with new setlist
            updateSetInLocalStorage(setlistTracks, setlistName, setNumber);

            // Revert to editing the set state using the setlist name & set number
            editSet(setlistName, setNumber);
        });

    } else if (contentType === "setlists" && currentState === "new") {
        // If the user is creating a new setlist... 
        saveButton.addEventListener('click', function () {
            /*the save button will save the setlist info to local storage
            and redirect them to viewing setlists by */

            // Getting the name input element
            let setNameInput = document.getElementById("form-name");

            // Check the name is all letters and store the status in a variable
            let nameIsAllLetters = checkNameIsAllLetters(setNameInput.value);

            if (setNameInput.value === "") {
                // If the name input is empty, ask the user to write a name
                alertUser(contentType, currentState, "emptyInput");
            } else if (nameIsAllLetters === false) {
                /* Else if the name inserted is not all letters & spaces,
                alert the user to remove illegal characters */
                alertUser(contentType, currentState, "notAllLetters")
            } else {
                /* If the name input has passed the tests and is legal,
                create a new setlist item */
                let newSetlist = createNewItem("setlist");

                // Get the original local storage array and store it in a variable
                let originalLocalStorageArray = getLocalStorageData(contentType);

                /* Check if the setlist name inserted is a duplicate
                and store the status in a varible */
                let itemIsDuplicate = checkIfDuplicate(newSetlist, originalLocalStorageArray, contentType);

                // If the name given is not a duplicate...
                if (itemIsDuplicate === false) {
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

                } else if (itemIsDuplicate === true) {
                    /* Else if it is a duplicate, alert the user that it already exists
                    and must provide a new name */
                    alertUser(contentType, currentState, "alreadyExists");
                }
            }
        });

    } else if (contentType === "setlists" && currentState === "deleting") {
        // If the user is deleting a set or setlists...
        deleteButton.addEventListener("click", function () {
            // Get the sets displayed that have been checked
            let setsToBeDeleted = getCheckedItems(contentType);

            // Delete the sets and update local storage
            deleteItems(contentType, setsToBeDeleted, getLocalStorageData("setlists"));
        });

    } else if (contentType === "tracks" && currentState === "edit") {
        // If the user is intending on editing a track...
        saveButton.addEventListener("click", function () {
            // Get the values from the input form
            let updatedTrackValues = getInputValues(contentType, contentData);

            // Get the setlist array from local storage
            let storedSetlistArray = getLocalStorageData("setlists");

            // Get the setlist name & set number the track is currently in
            let setlistHeading = document.getElementById("page-header").textContent;
            let setNumber = document.getElementById("page-subheader").textContent;

            // Shorten and lowercase the set the track is within
            let setHeading = removeSpaces(document.getElementById("page-subheader").textContent.toLowerCase());

            // For each setlist within local storage...
            storedSetlistArray.forEach(setlist => {
                // If the name of the setlists match
                if (setlist.setlistName === setlistHeading) {
                    // Get the index of the track in local storage to edit
                    let trackIndex = setlist[setHeading].findIndex((localStorageTrack => localStorageTrack.name === contentData.name));
                    // Update the local storage track with values given by the user
                    setlist[setHeading][trackIndex].name = updatedTrackValues.name;
                    setlist[setHeading][trackIndex].artist = updatedTrackValues.artist;
                    setlist[setHeading][trackIndex].key = updatedTrackValues.key;
                    setlist[setHeading][trackIndex].tonality = updatedTrackValues.tonality;
                }
            });

            // Push the setlist array with updated track to local storage
            pushToLocalStorage("setlists", storedSetlistArray);

            // Remove the enlarge container classes
            toggleEnlargeContainerClass();

            // Apply scrolling to the content container
            toggleContainerScroll();

            // Revert to viewing the set using the setlist name & set number
            viewSet(setlistHeading, setNumber);
        });
    }
}

function addDarkModeSwitchListener() {
    // Grab dark mode switch
    let darkModeSwitch = document.getElementById("dark-mode-switch");

    // When changed/clicked, toggle dark mode by
    darkModeSwitch.addEventListener("change", function () {
        if (this.checked) {
            /* Changing the html data-them attribute to dark and setting
            darkMode in localStorage to on if checked */
            document.documentElement.setAttribute("data-theme", "dark");
            pushToLocalStorage("darkMode", "on");
        } else {
            /* Changing the html data-them attribute to light and setting
            darkMode in localStorage to off if unchecked */
            document.documentElement.setAttribute("data-theme", "light");
            pushToLocalStorage("darkMode", "off");
        }
    });
}

function toggleEnlargeContainerClass() {
    // Grab the containers that'll be toggled
    let wrapper, contentContainer;
    wrapper = document.getElementById("content-section").firstElementChild;
    contentContainer = document.getElementById("content-container");

    // Toggle the containers enlarge class when function is called
    wrapper.classList.toggle("enlarge");
    contentContainer.classList.toggle("enlarge");
}

// Credit: code to check all letters taken from https://stackoverflow.com/a/5196710/15607265 
function checkNameIsAllLetters(nameEntered) {
    // Initialise a variable that holds a regular expression
    let allowedLetters = /^[a-zA-Z\s]*$/;

    if (String(nameEntered).match(allowedLetters)) {
        // If the name provided is all letters, return true
        return true;
    } else {
        // Else return false as an illegal character has been found
        return false;
    }
}

function fillLiveModalWithTracks() {
    /* To fill the live modal with tracks from a selected set,
    get the setlist name, set number, modal title & list container */
    let setlistName = document.getElementById("page-header").textContent;
    let setNumber = document.getElementById("page-subheader").textContent;
    let liveModalTitle = document.getElementById("live-mode-title");
    let liveModalListItemContainer = document.getElementById("live-mode-list");

    // Set title text to setlist name & set number
    liveModalTitle.textContent = setlistName + " - " + setNumber;

    // Make sure the list is clear before inserting tracks
    liveModalListItemContainer.innerHTML = "";

    // Get the tracks by sending the setlist name & set number
    let setTracks = getTracksFromLocalStorage(setlistName, setNumber);

    // For each track...
    setTracks.forEach(setTrack => {
        // ... create a live mode track
        let liveModeTrack = createLiveModeTrack(setTrack);

        // ... and insert it into the list container
        liveModalListItemContainer.innerHTML += liveModeTrack;
    });
}

function createLiveModeTrack(trackObject) {
    /* To create a live mode track item,
    get the template with track object data attached within */
    let liveModeTrack = contentTemplates("liveModeTrack", trackObject);

    // Return the track as a live mode track
    return liveModeTrack;
}

// Credit: code for sorting an array of objects by property values
// taken from https://stackoverflow.com/questions/1129216/sort-array-of-objects-by-string-property-value
function sortByName(a, b) {
    if (a.name < b.name) {
        return -1;
    }
    if (a.name > b.name) {
        return 1;
    }
    return 0;
}

function editSet(setlistName, setNumber) {
    /* To initialise an editing state for sets
    set the footer buttons to ones ready for editing sets */
    determineFooterButtons("setlists", "editingSet");

    // Clear the container container
    clearContentSection();

    // Grab the tracks from the set in local storage
    let tracks = getTracksFromLocalStorage(setlistName, setNumber);

    // Display each track within the set as a track card
    displayItems("checkboxTracks", tracks);
}

function getInputValues(contentType) {
    /* To retrieve the values given from the user,
    intialise an object to store the values */
    let updatedTrackValues = {};

    // If the content type is tracks...
    if (contentType === "tracks") {
        // Insert the values within the updated track object
        updatedTrackValues.name = document.getElementById("track-name").value;
        updatedTrackValues.artist = document.getElementById("track-artist").value;
        updatedTrackValues.key = document.getElementById("track-key").value;
        updatedTrackValues.tonality = document.getElementById("track-tonality").value;
    }

    // Return the updated track object
    return updatedTrackValues;
}

function openSetlist(setButton) {
    /* To open a setlist,
    clear the content section */
    clearContentSection();

    // Get the setlist accordion item
    let setlistItem = ascendToParent(setButton, "accordion-item");

    // Get the name of the setlist
    let setlistName = getSetlistName(setlistItem);

    // Update the heading with setlist name and set number
    updateHeading(setlistName, setButton.textContent);

    // Show footer buttons that are used for viewing sets
    determineFooterButtons("setlists", "viewingSet");

    // Get tracks within a set
    let tracks = getSetTracks(setButton);

    // Display each set track to the user
    displayItems("tracks", tracks);
}

function updateHeading(newHeader, additionalHeader) {
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

    // While there's an element within the header container, remove it
    while (headerContainer.firstElementChild) {
        headerContainer.removeChild(headerContainer.firstElementChild);
    }

    if (additionalHeader === undefined) {
        /* If additional header has not been provided,
        simply append a singular heading */
        headerContainer.appendChild(newFirstHeading);
        // Update the container flex for center one element
        updateHeadingFlex("center", headerContainer);
    } else {
        /* Else there will be two headings provided,
        so append both */
        headerContainer.appendChild(newFirstHeading);
        headerContainer.appendChild(newSecondHeading);
        // Update the container to provide equal space for two headings
        updateHeadingFlex("between", headerContainer);
    }
}

function updateHeadingFlex(flexValue, headerSection) {
    // If there is only a header...
    if (flexValue === "center") {
        // Remove the justify content between value so the header is centered
        headerSection.classList.remove("justify-content-between");
    } else {
        // Else if there's also a subheader, add the between value
        headerSection.classList.remove("justify-content-center");
        headerSection.classList.add("justify-content-between");
    }
}

function getSetTracks(setButton) {
    // Get the setlist item
    let setlistItem = ascendToParent(setButton, "accordion-item");

    // Get the name of the setlist
    let setlistName = getSetlistName(setlistItem);

    // Scan local storage & retrieve setlist tracks
    let setTracks = getTracksFromLocalStorage(setlistName, setButton.textContent);

    // Return the set tracks
    return setTracks;
}

function getTracksFromLocalStorage(nameOfRequestedSetlist, setName) {
    // Get setlists from local storage
    let setlists = getLocalStorageData("setlists");

    // Intialise an array that'll store the tracks
    let setTracks = [];

    // For each setlist in local storage...
    setlists.forEach(setlist => {
        // ... if the setlist names match...
        if (setlist.setlistName === nameOfRequestedSetlist) {
            // Get the particular set
            switch (setName) {
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

function createTrackObject(trackCard) {
    /* To create a track object,
    intialise a new object for the new track */
    let track = {};

    // Set the name and artist properties of the track object to the track card info
    track.name = trackCard.getElementsByClassName("card-track-name")[0].textContent;
    track.artist = trackCard.getElementsByClassName("card-track-artist")[0].textContent;

    // Initialise a variable that'll hold the full key of a track (i.e Eb Major)
    let trackFullKey;

    // Assign the variable an array, index 0 containing the key, index 1 containing the tonality
    trackFullKey = seperateKeyFromTonality(trackCard.getElementsByClassName("card-track-key-tonality")[0].textContent);

    // Assign the array values to the track object respectively
    track.key = trackFullKey[0];
    track.tonality = trackFullKey[1];

    // Return the track to the function calling it
    return track;
}

function updateSetInLocalStorage(newSet, setlistName, setNumber) {
    // Get the setlists from local storage
    let currentSetlistsInLocalStorage = getLocalStorageData("setlists");

    // Initialise a variable that'll store the setlist to be changed as an array
    let setlistToChange = currentSetlistsInLocalStorage.filter(setlist => setlist.setlistName === setlistName);

    // Get setlist to be changed that's in index position 0
    setlistToChange = setlistToChange[0];

    // Depending on the set number provided, update the set within setlist to be changed
    switch (setNumber) {
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

    // Push the new setlist to local storage
    pushToLocalStorage("setlists", currentSetlistsInLocalStorage);
}

function getSetlistName(setlistItem) {
    return setlistItem.firstElementChild.firstElementChild.textContent;
}

function ascendToParent(currentPosition, targetPosition) {
    /* While the current position's class name does not match
    the target position provided */
    while (currentPosition.className !== targetPosition) {
        // Ascend up the DOM
        currentPosition = currentPosition.parentElement;
    }
    // Return current position when at target location
    return currentPosition;
}

function getNames(elementType, tracks) {
    // Initialise an array of names
    let names = [];

    if (elementType === "trackCard") {
        /* If the element type is track cards,
        for checked track card */
        tracks.forEach(checkedTrack => {
            // Ascend to accordion item and grab the name of the track
            names.push(ascendToParent(checkedTrack, "card-body row").getElementsByClassName("card-track-name")[0].textContent);
        });
    } else if (elementType === "saveSetCards") {
        /* Else if the element type is saving set cards,
        for selected saved track */
        tracks.forEach(savedTrack => {
            // Grab the name from the saved track
            names.push(savedTrack.getElementsByClassName("card-track-name")[0].textContent);
        });
    }

    // Return the array names
    return names;
}

async function deleteItems(contentType, itemsToBeDeleted, itemsInStorage) {
    // Initialise an array that'll store a new array to be sent to local storage
    let newItemArray = [];

    if (contentType === "setlists") {
        // For each setlist in local storage...
        itemsInStorage.forEach(setlist => {
            // Look through each item to be deleted
            itemsToBeDeleted.forEach(itemToDelete => {
                // If the setlist names of both match...
                if (setlist.setlistName === itemToDelete.setlistName) {

                    // If the item to delete contains a set property, remove that property from the set retrieved from local storage
                    if (itemToDelete.hasOwnProperty("set1")) {
                        delete setlist.set1;
                    }
                    if (itemToDelete.hasOwnProperty("set2")) {
                        delete setlist.set2;
                    }
                    if (itemToDelete.hasOwnProperty("set3")) {
                        delete setlist.set3;
                    }
                }
            });

            // Calculate amount of properties (sets) the setlist has
            let setlistSize = Object.size(setlist);

            /* If the setlist only has the setlistName property,
            delete that particular setlist */
            if (setlistSize === 1) {
                delete itemsInStorage[setlist];
            } else {
                /* Else if the setlist still has sets within it,
                fix it by naming set2 to set1, set3 to set2 etc. */
                let fixedSetlist = fixSetlist(setlist);
                newItemArray.push(fixedSetlist);
            }
        });
    }

    // Push the new setlist into local storage
    pushToLocalStorage(contentType, newItemArray);

    // Go back to viewing setlists by restarting GigMate
    restartGigMate(contentType);
}


// Credit: code to retrieve the amount of properties an object contains was taken from: https://stackoverflow.com/a/6700/15607265
Object.size = function (obj) {
    var size = 0,
        key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) size++;
    }
    return size;
};

function fixSetlist(setlist) {
    /* This function makes sure there are no gaps within a setlist
    due to deletions made by the user */
    if (setlist.hasOwnProperty("set3") && !setlist.hasOwnProperty("set2")) {
        // If set3 exists but set2 doesn't, push set3 into set2
        setlist.set2 = setlist.set3;
        delete setlist.set3;
    }
    if (setlist.hasOwnProperty("set3") && setlist.hasOwnProperty("set2") && !setlist.hasOwnProperty("set1")) {
        // If set1 doesn't exist but set2 and set3 do, push them up a set respectively
        setlist.set1 = setlist.set2;
        setlist.set2 = setlist.set3;
        delete setlist.set3;
    }
    if (setlist.hasOwnProperty("set2") && !setlist.hasOwnProperty("set1")) {
        // If set2 exists but set1 doesn't, push set2 to set1
        setlist.set1 = setlist.set2;
        delete setlist.set2;
    }

    // Return the fixed setlist
    return setlist;
}

function getCheckedItems(contentType) {
    // Initialise an array that'll store the checked items
    let checkedItems = [];

    // If the content type is...
    if (contentType === "setlists") {

        // ... setlists, get the setlist items
        let setlists = [...document.getElementsByClassName("accordion-item")];

        // For each setlist item...
        setlists.forEach(setlist => {

            // Initialise an object that'll be used to compare and then delete the setlists
            let deleteSetItem = {};

            // ... get all possible checkboxes
            let setlistHeaderCheckBox = setlist.getElementsByClassName("form-check-input set-checkbox")[0];

            // Set the name of the delete item object of the heading in the accordion
            deleteSetItem.setlistName = setlistHeaderCheckBox.parentElement.textContent;

            // If the setlist has one set
            if (setlist.getElementsByClassName("list-group-item list-group-item-action")[0].children.length === 1) {
                // Get checkbox
                let set1Checkbox = setlist.children[1].firstElementChild.firstElementChild.firstElementChild.children[0].firstElementChild;

                // If set 1 was checked by the user...
                if (set1Checkbox.hasAttribute("checked")) {
                    // Add a set1 property to the delete set item object
                    deleteSetItem.set1 = "";
                }
            }

            // If the setlist has two sets
            if (setlist.getElementsByClassName("list-group-item list-group-item-action")[0].children.length === 2) {
                // Get checkboxes
                let set1Checkbox = setlist.getElementsByClassName("list-group-item list-group-item-action")[0].children[0].firstElementChild;
                let set2Checkbox = setlist.getElementsByClassName("list-group-item list-group-item-action")[0].children[1].firstElementChild;

                // If set 1 was checked by the user...
                if (set1Checkbox.hasAttribute("checked")) {
                    // Add a set1 property to the delete set item object
                    deleteSetItem.set1 = "";
                }

                // If set 2 was checked by the user...
                if (set2Checkbox.hasAttribute("checked")) {
                    // Add a set2 property to the delete set item object
                    deleteSetItem.set2 = "";
                }
            }

            // If the setlist has three sets
            if (setlist.getElementsByClassName("list-group-item list-group-item-action")[0].children.length === 3) {
                // Get checkboxes
                let set1Checkbox = setlist.getElementsByClassName("list-group-item list-group-item-action")[0].children[0].firstElementChild;
                let set2Checkbox = setlist.getElementsByClassName("list-group-item list-group-item-action")[0].children[1].firstElementChild;
                let set3Checkbox = setlist.getElementsByClassName("list-group-item list-group-item-action")[0].children[2].firstElementChild;

                // If set 1 was checked by the user...
                if (set1Checkbox.hasAttribute("checked")) {
                    // Add a set1 property to the delete set item object
                    deleteSetItem.set1 = "";
                }
                
                // If set 2 was checked by the user...
                if (set2Checkbox.hasAttribute("checked")) {
                    // Add a set2 property to the delete set item object
                    deleteSetItem.set2 = "";
                }

                // If set 3 was checked by the user...
                if (set3Checkbox.hasAttribute("checked")) {
                    // Add a set3 property to the delete set item object
                    deleteSetItem.set3 = "";
                }
            }

            // Push the delete set item object into the checked items array
            checkedItems.push(deleteSetItem);
        });

    } else if (contentType === "tracks") {
        // Get all checkboxes
        let checkboxes = [...document.getElementsByClassName('form-check-input')];

        // Create a new array with checked checkboxes
        checkedItems = checkboxes.filter(checkbox => checkbox.hasAttribute("checked"));

    }

    // Return the checked items array to the function calling it
    return checkedItems;
}

function alertUser(contentType, currentState, issue) {
    // Initialise an alert variable that will store the alert element
    let alertElement;

    // If the content type is...
    if (contentType === "setlists" && currentState === "new") {

        // A new setlist, grab the alert template
        alertElement = contentTemplates("alert", '', issue);

        // Get the name input
        let form = document.getElementById('input-form');

        // Append the alert into the parent element of the input, alerting the user
        form.appendChild(alertElement);

        // After three seconds, remove the alert
        setTimeout(() => {
            form.removeChild(alertElement);
        }, 5000);
    }
}

function checkIfDuplicate(createdItem, originalItems, contentType) {
    // Create a variable that stores the boolean that dictates whether the created item is a duplicate
    let itemIsDuplicate = false;

    // If the content type we're dealing with is...
    if (contentType === "setlists") {

        // Setlists, check each setlist name in each stored array
        originalItems.forEach(storedArray => {

            // If the names match, set itemIsDuplicate to true
            if (storedArray.setlistName === createdItem.setlistName) {
                itemIsDuplicate = true;
            }
        });
    }

    // Return the boolean variable 
    return itemIsDuplicate;
}

// Credit: code the capitalize the first letter within a string was taken from https://stackoverflow.com/a/1026087/15607265
function capitaliseFirstLetter(name) {
    return name.charAt(0).toUpperCase() + name.slice(1);
}

function createNewItem(type) {
    // Initialise an empty object variable
    let newItem = {};

    // If the newItem type provided is...
    if (type === "setlist") {
        // ... a setlist, get the form-name and add it as a setlist name property
        newItem.setlistName = capitaliseFirstLetter(document.getElementById("form-name").value);

        // Get the amount of sets requested by getting the last character of the radio button id
        let checkedSetButton = document.querySelector(
            'input[name="setlist-sets"]:checked');

        // Now we know the amount of sets we need, create them in the empty object
        if (checkedSetButton.id.slice(checkedSetButton.id.length - 1) === "1") {
            newItem.set1 = [];
        } else if (checkedSetButton.id.slice(checkedSetButton.id.length - 1) === "2") {
            newItem.set1 = [];
            newItem.set2 = [];
        } else if (checkedSetButton.id.slice(checkedSetButton.id.length - 1) === "3") {
            newItem.set1 = [];
            newItem.set2 = [];
            newItem.set3 = [];
        }
        // Return the new setlist object
        return newItem;
    } 
    // Return the newly created item
    return newItem;
}

function openForm(type, data) {
    // Before we open the form, clear the content section
    clearContentSection();

    // Prepare the content container for the form by enlarging it
    toggleEnlargeContainerClass();

    // Initialise a variable to store the form
    let form = document.createElement("form");

    // Give the form it's respective classes
    form.className = "rounded-corners row animate__animated animate__fadeInUp";

    // Give it an id
    form.id = "input-form";

    // If the type of form required is...
    if (type === "newSetlist") {
        // A new setlist form, set the inner HTML of the form to the new setlist template
        form.innerHTML = contentTemplates("newSetlistForm");

        // Display the footer button to save a new setlist
        determineFooterButtons("setlists", "new");

    } else if (type === "editTrack") {
        // An edit track form, set the inner HTML of the form to the new setlist template    
        form.innerHTML = contentTemplates("editTrack", data);

        // Display the footer buttons to edit tracks
        determineFooterButtons("tracks", "edit", data);
    }

    // Get the content container 
    let contentContainer = document.getElementById("content-container");

    // Make sure container scroll is turned off to reduce glitchy visuals
    toggleContainerScroll();

    // Append the newly created form into the content container
    contentContainer.appendChild(form);
}

function displayItems(contentType, contentItems, reference) {
    // If the content type is...
    if (contentType === "setlist") {
        // ... setlist, retrieve the setlist accordion & insert the setlist item (contentItems[0]) within the inner HTML of the accordion
        document.getElementById("setlistAccordion").innerHTML += contentItems[0];

        // ...then push the set buttons (contentItems[1]) into the setlist item
        document.getElementById(`collapse${reference}`).firstElementChild.firstElementChild.innerHTML = contentItems[1].outerHTML;

    } else if (contentType === "tracks") {
        // Insert & collect an ordered list container
        let container = insertListContainer();

        // For each track...
        contentItems.forEach(track => {
            container.appendChild(createCard(track, false));
        });

    } else if (contentType === "addTracks") {
        // Insert & collect an ordered list container
        let container = insertListContainer();

        // For each track...
        contentItems.forEach(track => {
            // ... create a card with the track properties
            container.appendChild(createCard(track, true, false));
        });

        // Add an event listener to every checkbox
        addCheckBoxListeners("setlists");

    } else if (contentType === "checkboxTracks") {
        // Insert & collect an ordered list container
        let container = insertListContainer();

        // Make the container able to dropped within
        container.addEventListener("dragover", e => {
            e.preventDefault();
            // Credit: code to get element closest & append
            // To container taken from https://www.youtube.com/watch?v=jfYWwQrtzzY
            // Get element underneath mouse position
            const afterElement = getDragAfterElement(container, e.clientY);
            const draggable = document.querySelector(".dragging");
            if (afterElement == null) {
                // If nothing exists, insert the dragged item anyway
                container.appendChild(draggable);
            } else {
                /* Else insert the item before the item underneath
                the mouse position */
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
function getDragAfterElement(container, mousePosition) {
    let draggableElements = [...container.querySelectorAll(".draggable:not(.dragging)")];

    // Return the closest element
    return draggableElements.reduce((closestElement, child) => {
        const box = child.getBoundingClientRect();
        const offset = mousePosition - box.top - box.height / 2;
        if (offset < 0 && offset > closestElement.offset) {
            return {
                offset: offset,
                element: child
            };
        } else {
            return closestElement;
        }
    }, {
        offset: Number.NEGATIVE_INFINITY
    }).element;
}

function insertListContainer() {
    // Initialise a container variable
    let container = document.createElement("ol");

    // Give it the unique id of list container
    container.id = "list-container";

    // Give it the necessary bootstrap classes
    container.className = "row p-0 m-0";

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

    if (insertCheckbox === false) {
        // If a checkbox is not needed, append the following HTML
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

        // Add event listener to the card so it can be opened & edited
        card.addEventListener("click", function () {
            openForm("editTrack", track);
        });

        // Add a hover state to the card
        addIconHover(card.firstElementChild);

    } else if (insertCheckbox === true && insertHover === true) {
        /* Else if a checkbox is needed & hover is enabled,
        add the following HTML - this is a draggable card */
        card.innerHTML =
            `<button class="btn-card animate__animated animate__fadeInUp">
        <div class="card track-card rounded-corners">
            <div class="card-body row">
                <div class="col-8 text-start">
                    <h3 class="card-track-name">${track.name}</h3>
                </div>
                <div class="col-4 text-end">
                    <i class="fas fa-arrows-alt-v track-icon"></i>
                    <input class="form-check-input track-checkbox" type="checkbox">
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

        // Add a hover state to the card
        addIconHover(card.firstElementChild);

        // Make the card able to be dragged
        card.setAttribute("draggable", true);

        // Add eventlisteners relating to drag and drop
        card.addEventListener("dragstart", dragStart);
        card.addEventListener("dragend", dragEnd);
    } else if (insertCheckbox === true && insertHover === false) {
        /* Else if a checkbox is needed & hover is not enabled,
        add the following HTML - this is a card ready for deletion */
        card.innerHTML =
            `<button class="btn-card animate__animated animate__fadeInUp">
        <div class="card track-card rounded-corners">
            <div class="card-body row">
                <div class="col-8 text-start">
                    <h3 class="card-track-name">${track.name}</h3>
                </div>
                <div class="col-4 text-end">
                    <input class="form-check-input set-checkbox" type="checkbox">
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
    }

    // Return the card
    return card;
}

function dragStart() {
    // Add the class of dragging when dragging
    this.classList.add("dragging");
}

function dragEnd() {
    // Remove the class of dragging when dropped
    this.classList.remove("dragging");
}

// Change color of card open icon to represent hovered state
function addIconHover(card) {
    // When hovering over the button area, the icon will turn purple
    card.addEventListener('mouseenter', function () {
        paintIcon(card);
    });

    // When leaving the button area, the icon will revert to grey
    card.addEventListener('mouseleave', function () {
        paintIcon(card);
    });
}

// Toggle a class to paint the edit icon
function paintIcon(card) {
    // Grab the icon within the card
    let icon = card.firstElementChild.firstElementChild.children[1].firstElementChild;
    // Check if the icon has a class of icon-hover
    if (icon.classList.contains("icon-hover")) {
        // If so, remove the class to revert back to the grey color
        icon.classList.remove("icon-hover");
    } else {
        // If not, add the class to turn the icon color to purple
        icon.classList.add("icon-hover");
    }
}

// This function contains all templates that are used within GigMate
function contentTemplates(request, contentData, issue) {
    // Initialise a variable to store the template
    let template;

    // If the request is...
    if (request === "setlistAccordionBody") {
        //... a section accordion body, create a ul element
        template = document.createElement("ul");

        // then set the class name of the ul element to the bootstrap accordion
        template.className = "accordion";

        // give the ul element a unique id of setlistAccordion
        template.id = "setlistAccordion";

        // then return the HTML
        return template.outerHTML;

    } else if (request === "setlistAccordionItem") {
        /* A setlist accordion, create a reference of the setlistname without
        spaces so the accordion can function properly */
        let reference = removeSpaces(contentData.setlistName);

        /* Then assign the template variable to the setlist template
        with data & references attached */
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

        // Evaluate how many set buttons need to be created and store them in a variable
        let setButtons = createSetButtons(contentData);

        // Then return the setlist template along with the set buttons
        return [template, setButtons];

    } else if (request === "newSetlistForm") {
        /* If a new setlist form, insert the following HTML into
        the template variable */
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

    } else if (request === "alert") {
        /* If the request is an alert
        assign the template as a new element */
        template = document.createElement('div');

        // Give it the Bootstrap 5 classes
        template.className = "alert alert-danger";

        // Set the role of the element to alert
        template.setAttribute('role', 'alert');

        // Depending on the issue provided, insert the following text
        if (issue === "alreadyExists") {
            template.textContent = "This setlist name already exists, create a new one.";
        } else if (issue === "emptyInput") {
            template.textContent = "The name input was empty, please enter a name.";
        } else if (issue === "notAllLetters") {
            template.textContent = "This name contains invalid characters, please only use letters.";
        }
        return template;

    } else if (request === "editTrack") {
        /* If a form to edit a track is requested,
        assign template the following HTML */
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
        <div class="col-12 col-track-key">
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
    } else if (request === "liveModeTrack") {
        /* If a live mode track item is requested,
        create a variable that holds both the key & tonality */
        let keyInFull = contentData.key + " " + contentData.tonality;

        /* Assign the template variable the following HTML 
        with track data inserted */
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

    // Return the template and set buttons
    return [template, setButtons];
}

// Credit: the code below that removes spaces within strings was found from: https://stackoverflow.com/a/51321865/15607265
function removeSpaces(string) {
    // Return the received string without spaces
    return string.replace(/ /g, '');
}

function createSetButtons(setlist) {
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

function restartGigMate(contentType) {
    // To restart GigMate, clear the content container
    clearContentSection();
    // Start GigMate from fresh
    startGigMate(contentType);
}

function clearContentSection() {
    let contentSection = document.getElementById("content-container");
    contentSection.firstElementChild.className += " animate__animated animate__fadeOutUp";
    contentSection.innerHTML = "";
}