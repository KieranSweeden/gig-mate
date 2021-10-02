// When DOM content is loaded...
window.addEventListener('DOMContentLoaded', () => {
    // ...determine what content the page will be dealing with
    let contentType = determineContentType();

    console.log(contentType);
})

function determineContentType(){
    // To determine what content type this page will be dealing with, grab the current file name
    let currentPage = window.document.location.pathname;

    // Initialise an empty variable to contain a content type value
    let contentType;

    // Assign content type depending on value within current page
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