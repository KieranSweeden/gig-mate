window.addEventListener('DOMContentLoaded', () => {
    // Init an empty array, retrieve the cards and store them in the array
    let cards = [];
    cards = document.getElementsByClassName('btn-card');
    let cardsArray = [].slice.call(cards);
    
    // Add a click event for each card that calls a function that opens the clicked card
    cardsArray.forEach(card => {
        card.addEventListener('click', function(){
            openCard(card);
        });
    })
})

function openCard(card) {
    // To open the card, we must first remove it's siblings
    removeSiblingCards(card);
    // When the siblings are removed, enlarge the card
    enlargeCard(card);
}

function enlargeCard(card) {

    // Retrive the card's container & row parents
    let cardContainer = card.parentNode.parentNode.parentNode;
    let cardRow = card.parentNode.parentNode;

    // Now the siblings are removed, increase the height of the card, it's row and container with the enlarge class
    cardContainer.classList.toggle("enlarge");
    cardRow.classList.toggle("enlarge");
    card.classList.toggle("enlarge");
}

function removeSiblingCards(card) {
    // Store siblings of the clicked card in a variable
    let siblings = getCardSiblings(card);

    // Remove siblings from the page 
    siblings.forEach(sibling => {
        sibling.style.display = 'none';
        sibling.classList.toggle('d-flex');
    })
}

function getCardSiblings(card) {
    // An empty array ready to contain siblings
    let cardSiblings = [];
    // Retrieve the first sibling
    let sibling = card.parentNode.parentNode.firstChild;
    // Loop through & push each sibling
    while (sibling) {
        // If sibling is an element (nodeType = 1) & is not the original element
        if (sibling.nodeType === 1 && sibling !== card.parentNode) {
            // Push this element to the siblings array
            cardSiblings.push(sibling);
        }
    // Continue to the next sibling
    sibling = sibling.nextSibling;
    }
// Return the card siblings array
return cardSiblings;
}