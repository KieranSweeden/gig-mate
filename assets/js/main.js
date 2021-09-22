// credit: code to adjust viewport height for Safari & Chrome mobile browsers. Fix found from: https://dev.to/maciejtrzcinski/100vh-problem-with-ios-safari-3ge9
const appHeight = () => {
    const doc = document.documentElement
    doc.style.setProperty('--app-height', `${window.innerHeight}px`)
}
window.addEventListener('resize', appHeight);
appHeight();

/**
 * Determine content section height based on presence of search input in header
 */
function determineContentHeight () {

    // get search input element, header section & content section
    let searchInput = document.getElementById('search-input');
    let headerHasSearchInput = document.getElementById('header-section').contains(searchInput);
    let contentSection = document.getElementById('content-section');
    
    // if the search element is present, adjust the height of the content section
    if (headerHasSearchInput){
        contentSection.style.height = '72.5vh';
    }
}

determineContentHeight();