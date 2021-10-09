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
    if(contentType = "setlists") {
        // ... setlists, create setlists
        displaySetlists(contentData, "viewing");
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
    // return (localStorage.hasOwnProperty(contentType)) ? true : false;
    return (localStorage.getItem(contentType)) ? true : false;
}

function getLocalStorageData(contentType) {  
    // Parse the stringified JSON recieved from local storage & return it

    let storedData;
    
    if(contentType === "setlists") {
        storedData = JSON.parse(localStorage.getItem("setlists"));
    }

    return storedData;
}

async function addInitialisedJSONToLocalStorage(contentType) {
    // Initialise a variable to store the local JSON file data
    let localJSONData;

    // If the contentType is...
    if (contentType === "setlists") {
        // ...setlists, fetch & store the setlist JSON data
        localJSONData = await getInitialJSONData("assets/json/initSetlists.json");
    } else if (contentType === "repertoire") {
        // ...repertoire, fetch & store the repertoire JSON data
        localJSONData = await getInitialJSONData("assets/json/initRepertoire.json");
    } else if (contentType === "gigs") {
        // ...gigs, fetch & store the gigs JSON data
        localJSONData = await getInitialJSONData("assets/json/initGigs.json");
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

function displaySetlists(setlists){
    // Display the setlists...
    // ...Get content container
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

function prepareToDeleteItems(contentType){

    determineFooterButtons("setlists", "deleting");

    // If the content type is...
    if(contentType === "setlists"){
        // ... setlists, get every setlist item
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
                setButton.appendChild(getDeleteCheckBox());
            })
        })

        addCheckBoxListeners(contentType);
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
        })
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
            setButton.firstElementChild.setAttribute("checked", '')
        })
    } else if (!checkbox.hasAttribute("checked")){
        // Else if it does not have the attribute of checked
        setButtons.forEach(setButton => {
            // make sure all sets within the setlist have the attribute of checked removed
            setButton.firstElementChild.removeAttribute("checked");
        })
    }
}

function getDeleteCheckBox(contentType) {
    // Create an input element
    let checkbox = document.createElement("input");

    // Give it the Bootstrap 5 checkbox class
    checkbox.className = "form-check-input";

    // Give it the type of checkbox
    checkbox.type = "checkbox"

    // Give the checkbox a particular class name depending on the content type
    if (contentType === "setlist") {
        checkbox.classList.add("set-checkbox")
    }

    // Return a checkbox when called
    return checkbox;
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
        btnContainer.innerHTML += insertButton("delete");
        btnContainer.innerHTML += insertButton("add");
    } else if (contentType === "setlists" && currentState === "new"){
        btnContainer.innerHTML = insertButton("back");
        btnContainer.innerHTML += insertButton("save");
    } else if (contentType === "setlists" && currentState === "deleting"){
        btnContainer.innerHTML = insertButton("back");
        btnContainer.innerHTML += insertButton("save");
    }

    // Add event listeners to the buttons displayed on screen
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
    } else if (type === "delete"){
        button = '<button id="btn-delete" class="btn-bottom"><i class="fas fa-trash-alt"></i></button>';
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
        // If the user is viewing setlists... 
        addButton.addEventListener('click', function(){
            // ... the add button will open a create new setlist form
            openForm("newSetlist");
        });
        deleteButton.addEventListener('click', function(){
            // ... the delete button will prepare the items to be deleted
            prepareToDeleteItems("setlists");
        })
    } else if (contentType === "setlists" && currentState === "new"){
        // If the user is creating a new setlist, the save button will save the setlist info to local storage and redirect them to viewing setlists
        saveButton.addEventListener('click', function(){

            // Get input element
            let setNameInput = document.getElementById("form-name");

            if (setNameInput.value === "") {
                alertUser(contentType, currentState, "emptyInput")

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
                    determineFooterButtons(contentType, "viewing");
                } else if (itemIsDuplicate === true){
                    alertUser(contentType, currentState, "alreadyExists");
                }
            }

        })
    } else if (contentType === "setlists" && currentState === "deleting") {
        saveButton.addEventListener("click", function(){
            let setsToBeDeleted = getCheckedItems(contentType);

            deleteItems(contentType, setsToBeDeleted, getLocalStorageData("setlists"));
        })
    }
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

            })
            
            let setlistSize = Object.size(setlist);
                    
            if (setlistSize === 1){
                delete itemsInStorage[setlist];
            } else {
                let fixedSetlist = fixSetlist(setlist);
    
                newItemArray.push(fixedSetlist);
            }

        })
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
        })
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
        })
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
    }

    // Return the newly created item
    return newItem;
}

function openForm(type){
    // Before we open the form, clear the content section
    clearContentSection();

    // Prepare the content container for the form by enlarging it
    adjustContainerSize();

    // Initialise a variable to store the form
    let form = document.createElement("form");

    // Give the form it's respective classes
    form.className = "d-flex card rounded-corners justify-content-around align-items-center animate__animated animate__fadeInUp";

    // Give it an id
    form.id = "input-form";

    // If the type of form required is a...
    if (type === "newSetlist") {
        // ... new setlist, set the inner HTML of the form to the new setlist template
        form.innerHTML = contentTemplates("newSetlistForm");

        // ... get parent
        let contentContainer = document.getElementById("content-container");

        // ... new setlist form
        contentContainer.appendChild(form);

        // ... display buttons appropriate for new setlists
        determineFooterButtons("setlists", "new");

    }
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

    } else if (request === "deleteSetlistItem"){
        template = 
        `

        `;
        
    } else if (request === "alert") {
        template = document.createElement('div');

        template.className = "alert alert-danger";

        template.setAttribute('role', 'alert');

        if (issue === "alreadyExists") {
            template.textContent = "Sorry this setlist name already exists, create a new one!";
        } else if (issue === "emptyInput") {
            template.textContent = "The name input was empty, please enter a name!";
        }

    
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