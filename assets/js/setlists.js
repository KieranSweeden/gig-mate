// When DOM content is loaded...
window.addEventListener('DOMContentLoaded', () => {
    // Determine what content the page will be dealing with and store the type within a variable
    let contentType = determineContentType();

    // Knowing the type of content it'll be dealing with, start the application with the contentType as a parameter
    startGigMate(contentType);
})

function determineContentType() {
    // To determine what content type this page will be dealing with, grab the current pathname
    let currentPage = window.document.location.pathname;

    // Initialise an empty variable to contain a content type value
    let contentType;

    // Assign content type depending on the value within current page variable
    if (currentPage === "/setlists.html") {
        contentType = "setlists";
    } else if (currentPage === "/repertoire.html") {
        contentType = "repertoire";
    } else if (currentPage === "/gigs.html") {
        contentType = "gigs";
    }
    // Return the content type variable
    return contentType;
}

async function startGigMate(contentType) {
    // Firstly, start local storage functionality to determine what data items GigMate will be working with
    let contentData = await collectLocalStorage(contentType);

    // If the content type is...
    if(contentType = "setlists") {
        // ... setlists, create setlists
        displaySetlists(contentData);
    }

    // Determing what footer buttons should be present
    determineFooterButtons(contentType, "viewing", contentData);
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
    return (localStorage.hasOwnProperty(contentType)) ? true : false;
}

function getLocalStorageData(contentType) {
    // Parse the stringified JSON recieved from local storage & return it
    return JSON.parse(localStorage.getItem(contentType));
}

async function addInitialisedJSONToLocalStorage(contentType) {
    // Initialise a variable to store the local JSON file data
    let localJSONData;

    // If the contentType is...
    if (contentType === "setlists") {
        // ...setlists, fetch & store the setlist JSON data
        localJSONData = await getJSONData("assets/json/initSetlists.json");
    } else if (contentType === "repertoire") {
        // ...repertoire, fetch & store the repertoire JSON data
        localJSONData = await getJSONData("assets/json/initRepertoire.json");
    } else if (contentType === "gigs") {
        // ...gigs, fetch & store the gigs JSON data
        localJSONData = await getJSONData("assets/json/initGigs.json");
    }

    // Push the local JSON data to local storage
    pushToLocalStorage(contentType, localJSONData);
}

async function getJSONData(pathToJSONFile) {
    // Fetch & store the data contained within the JSON file
    let fileData = await fetch(pathToJSONFile);

    // Collect the json within the fileData promise and return it
    return fileData.json();
}

function pushToLocalStorage(contentType, localJSONData) {
    // Push the contentType(key) & localJSONData(value) to local storage
    localStorage.setItem(contentType, JSON.stringify(localJSONData));
}

function displaySetlists(setlists){
    // To create a setlist...
    // Get content container
    let contentContainer = document.getElementById("content-container");

    // Get accordion body
    accordionBody = contentTemplates("setlistAccordionBody");

    // insert accordion body to content container
    contentContainer.innerHTML = accordionBody;

    // Insert accordion 
    setlists.forEach(setlist => {
        // ... retrieve the accordion template containing content respective to this setlist
        let [setlistTemplate, setButtons] = contentTemplates("setlistAccordionItem", setlist);

        // ... display the setlist with the template, set buttons & reference
        displayItems("setlist", [setlistTemplate, setButtons], removeSpaces(setlist.setlistName));

        // ... add event listeners to the respective buttons

    })
}

function determineFooterButtons(contentType, currentState, contentData){
    // Before we touch any buttons, we must first retrieve the container
    let btnContainer = document.getElementById("btn-footer-container");

    // And we must make sure before making any changes, that it's clear of content
    btnContainer.innerHTML = "";

    // If the user is...
    if(contentType === "setlists" && currentState === "viewing"){
        // ... viewing setlists, display the back & add buttons
        btnContainer.innerHTML = insertButton("back");
        btnContainer.innerHTML += insertButton("add");
    } else if (contentType === "setlists" && currentState === "new"){
        btnContainer.innerHTML = insertButton("back");
        btnContainer.innerHTML += insertButton("save");
    }

    insertButtonEventListeners(contentType, currentState, contentData)
}


function insertButton(type){
    // Initialise a variable to store the button
    let button;
    // If the button type is...
    if(type === "back"){
        button = '<a id="btn-back" class="btn-bottom" href=""><i class="fas fa-arrow-left"></i></a>';
    } else if (type === "add"){
        button = '<button id="btn-add" class="btn-bottom"><i class="fas fa-plus"></i></button>';
    } else if (type === "save"){
        button = '<button id="btn-save" class="btn-bottom"><i class="fas fa-check"></i></button>';
    }
    return button;
}

function insertButtonEventListeners(contentType, currentState, contentData){
    // Retrieve all possible buttons
    let backButton = document.getElementById("btn-back");
    let addButton = document.getElementById("btn-add");
    let deleteButton = document.getElementById("btn-delete");
    let saveButton = document.getElementById("btn-save");


    if(contentType === "setlists" && currentState === "viewing"){
        addButton.addEventListener('click', function(){
            openForm("newSetlist");
        });
    } else if (contentType === "setlists" && currentState === "new"){
        saveButton.addEventListener('click', function(){

            let newSetlist = createNewItem("setlist");

            let localStorageArrayOfSetlists = getLocalStorageData(contentType);

            localStorageArrayOfSetlists.push(newSetlist);

            pushToLocalStorage(contentType, localStorageArrayOfSetlists);


        })
    }
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
    }

    // Return the newly created item
    return newItem;
}

function openForm(type){
    // Before we open the form, clear the content section
    clearContentSection();
    // Get the content container
    let contentContainer = document.getElementById("content-container");

    // Prepare the content container for the form by enlarging it
    enlargeContainer(contentContainer);

    // Initialise a variable to store the form
    let form = document.createElement("form");

    // Give the form it's respective classes
    form.className = "d-flex card rounded-corners justify-content-around align-items-center animate__animated animate__fadeInUp";

    // Give it an id
    form.id = "input-form";

    // If the type of form required is a...
    if(type === "newSetlist"){
        // ... new setlist, set the inner HTML of the form to the new setlist template
        form.innerHTML = contentTemplates("newSetlistForm");

        // ... new setlist form
        contentContainer.appendChild(form);
    }

    determineFooterButtons("setlists", "new");

}

function enlargeContainer(contentContainer){
    contentContainer.classList.add("enlarge");
    contentContainer.parentNode.classList.add("enlarge");
}





function displayItems(contentType, contentItems, reference){
    // If the content type is...
    if (contentType === "setlist"){
        // ... setlist, retrieve the setlist accordion & insert the setlist item (contentItems[0]) within the inner HTML of the accordion
        document.getElementById("setlistAccordion").innerHTML += contentItems[0];

        // ...then push the set buttons (contentItems[1]) into the setlist item
        document.getElementById(`collapse${reference}`).firstElementChild.firstElementChild.innerHTML = contentItems[1].outerHTML;
    }
}

// This function contains all templates that are used within GigMate
function contentTemplates(request, contentData){
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
              <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapse${reference}" aria-expanded="false" aria-controls="collapse${reference}">
                ${contentData.setlistName}
              </button>
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
            <input id="form-name" type="text" value="" class="rounded-corners">
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
    }
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

function clearContentSection () {
    let contentSection = document.getElementById("content-container");
    contentSection.firstElementChild.className += " animate__animated animate__fadeOutUp";
    contentSection.innerHTML = "";
  }