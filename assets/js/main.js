window.addEventListener("DOMContentLoaded", () => {

    appHeight();

    determineContentHeight();

    determineBackButton();
})

// Replaces the href within the back button with the URL of the previous page
function determineBackButton() {
    // Retrieve the back button
    let backButton = document.getElementById('btn-back');
    // Retrieve the URL of previous page
    // Credit: code to obtain the URL the user previously visited. Found from: https://stackoverflow.com/questions/5788108/how-to-get-the-previous-page-url-using-javascript
    let previousPage = document.referrer;

    // If previousPage is undefined (i.e a new tab), the back button will direct the user to the home page
    if (previousPage === undefined) {
        backButton.setAttribute("href", "https://kieransweeden.github.io/gig-mate/");
    } else {
        // Else the button will take the user to the previous page in their history
        backButton.setAttribute("href", previousPage);
    }
}

// Credit: code to adjust viewport height for Safari & Chrome mobile browsers. Fix found from: https://dev.to/maciejtrzcinski/100vh-problem-with-ios-safari-3ge9
const appHeight = () => {
    const doc = document.documentElement
    doc.style.setProperty('--app-height', `${window.innerHeight}px`)
}
window.addEventListener('resize', appHeight);

/**
 * Determine content section height based on presence of search input in header
 */
function determineContentHeight() {

    // get search input element, header section & content section
    let searchInput = document.getElementById('search-input');
    let headerHasSearchInput = document.getElementById('header-section').contains(searchInput);
    let contentSection = document.getElementById('content-section');

    // if the search element is present, adjust the height of the content section
    if (headerHasSearchInput) {
        contentSection.style.height = '72.5%';
    }
}

function seperateKeyFromTonality(trackFullKey) {
    // Seperate the full key given and return it as an array
    return trackFullKey.split(" ");
}

// Credit: code to check all letters taken from https://stackoverflow.com/a/5196710/15607265 
function checkNameIsAllLetters(nameEntered) {
    // Initialise a variable that holds a regular expression
    let allowedLetters = /^[a-zA-Z\s]*$/;
    if (String(nameEntered).match(allowedLetters)) {
        return true;
    } else {
        return false;
    }
}

// Credit: code the capitalize the first letter within a string was taken from https://stackoverflow.com/a/1026087/15607265
function capitaliseFirstLetter(name) {
    // Change the letter at index 0 to uppercase and return the word
    return name.charAt(0).toUpperCase() + name.slice(1);
}

function capitaliseEachWord(name) {
    // Split the words up into an array
    let nameWords = name.split(" ");

    // Intialise an array that'll store the words when capitalised
    let capitalisedWords = [];

    // For each word... 
    nameWords.forEach(word => {
        // ...capitalise it and store it in the capitalised variable
        capitalisedWords.push(capitaliseFirstLetter(word));
    })

    // Turn the array into a string with the capitalised words joined with spaces.
    capitalisedWords = capitalisedWords.join(" ");

    // Return the words in capitalised form
    return capitalisedWords;
}

function toggleContainerScroll() {
    // Get the container
    let container = document.getElementById("content-section");

    // Toggle the scroll of the container when function is called
    if (container.style.overflowY === "scroll") {
        container.style.overflowY = "hidden";
    } else if (container.style.overflowY === "hidden") {
        container.style.overflowY = "scroll";
    }
}