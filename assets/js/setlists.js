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

function startGigMate(contentType) {
    // Firstly, start local storage functionality to determine what data items GigMate will be working with
    startLocalStorage(contentType);
}

async function startLocalStorage(contentType) {
    // Check if there is already data present within local storage
    let hasLocalStorage = checkLocalStorage(contentType);

    // Initialise a variable that will store the recieved parsed JSON file data
    let contentData;

    // If there is...
    if (hasLocalStorage === true) {
        // ...local storage, retrieve the data from local storage
        contentData = retrieveLocalStorageData(contentType);
    } else if (hasLocalStorage === false) {
        // ...no local storage, start GigMate with the appropriate initialised json file
        await addInitialisedJSONToLocalStorage(contentType);
        // Once the data has been added, retrieve the data from local storage
        contentData = retrieveLocalStorageData(contentType);
    }
}

function checkLocalStorage(contentType) {
    // Return true if local storage exists, return false if not
    return (localStorage.hasOwnProperty(contentType)) ? true : false;
}

function retrieveLocalStorageData(contentType) {
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