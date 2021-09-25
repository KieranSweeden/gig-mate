// Event listeners
let cards = [];
cards = document.getElementsByClassName('btn-card');
let cardsArray = [].slice.call(cards);

console.log(cardsArray);

cardsArray.forEach(card => {
    card.addEventListener('click', function(){
        openCard(card);
    });
})

function openCard(card) {
    removeSiblingCards(card);
    enlargeCard(card);
}

function enlargeCard(card) {
    console.log(card);
}

function removeSiblingCards(card) {
    let siblings = getCardSiblings(card);

    // Remove siblings from the page 
    siblings.forEach(sibling => {
        sibling.style.display = "none";
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