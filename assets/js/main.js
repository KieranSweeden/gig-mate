/**
 * Determine whether the content sections needs to be shortened due to presence of search input element
 */
function determineContentHeight () {

    // get search element, header section & content section
    let searchInput = document.getElementById('search-input');
    let headerHasSearchInput = document.getElementById('header-section').contains(searchInput);
    let contentSection = document.getElementById('content-section');
    
    // if the search element is present adjust the height of the content section
    if (headerHasSearchInput){
        contentSection.style.height = '72.5vh';
    }
}

determineContentHeight();