# GigMate Testing

This markdown file documents the development process of GigMate.

To return to the original README file, [click here](README.md).

![link to view GitHub page deployment]

# Contents

1. [Bugs](#Bugs)
    - [Fixed Bugs](#Fixed-Bugs)
    - [Unfixed Bugs](#Unfixed-Bugs)

2. [User Stories Testing](#User-Stories-Testing)

3. [Manual Testing](#Manual-Testing)

4. [Validation Testing](#Validation-Testing)

5. [Performance Testing](#Performance-Testing)

# Bugs

## Fixed Bugs

1. Navbar dropdown appearing behind main content
    - When clicking on the hamburger icon to open the dropdown navbar menu, the menu would appear behind the main content on the page.
    - This was promptly solved by addressing the z-index of the element with the class of "navbar-collapse". Giving this element the z-index value of 1 meant the dropdown would always appear above the content underneath the navbar.
    ```
    .navbar-collapse {
        z-index: 1;
        background-color: var(--gigmate-white);
    }
    ```
<hr>

2. Navbar moving upwards when uncollapsing the dropdown menu
    - When clicking on the hamburger icon, the dropdown navigation menu would appear and push the navbar upwards, making the navbar appear broken.
    - This was solved by giving the container within the navbar a positional value of fixed with adjustments to centre the navigation, with the parent having a positional value of relative.
    - Although this is appropriate for mobile & tablet screen sizes, it negatively affected the desktop navbar design. To counteract this, I applied these changes within a media query for screen sizes below 992px.
    ```
    @media (max-width: 992px) {
        .navbar-collapse {
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        }
    }
    ```
<hr>

3. Container not scrolling when using overflow:scroll
    - Despite applying the value of scroll to the property of overflow that's attached to a container filled with content, the container was not scrolling.
    - After viewing [this Stack Overflow post](https://stackoverflow.com/questions/17295219/overflow-scroll-css-is-not-working-in-the-div) and reading [Ionică Bizău](https://stackoverflow.com/users/1420197/ionic%c4%83-biz%c4%83u)'s answer, I recognised this was because the container I was attempting to add a scroll functionality did not have a declared height. After adding a height property & value, this issue was resolved.
    ```
    .rep-container section {
    height: 72.5vh;
    overflow: scroll;
    }
    ```
<hr>

4. Scrollbar moving content within container, resulting in an asymmetrical design
    - Although the scrollbar functionality worked as intended, it took up space within the container which pushed the content to the left, resulting in an asymmetrical design which wasn't intended.
    - After viewing [this Stack Overflow post](https://stackoverflow.com/questions/24671317/scrollbar-above-content?rq=1) and reading [Forex](https://stackoverflow.com/users/1384493/forex)'s answer, I realised that instead of scroll, the value of overflow needed to be overlay, which adds scroll functionality and renders the scrollbar above the content rather than within.
    ```
    .rep-container section {
    height: 72.5vh;
    overflow: overlay;
    }
    ```
<hr>

5. Presence of UI in Safari & Chrome mobile browsers shortening the viewport window
    - As clearly demonstrated in [this article](https://dev.to/maciejtrzcinski/100vh-problem-with-ios-safari-3ge9) by Maciej Trzciński, there's an unfortunate problem in Safari (& Chrome in my experience) on mobile devices, where the browsers calculate the top bar, document window and bottom bar together in their implementation of viewport heights. This created an issue where the window was far larger than expected, which caused elements at the bottom of the window such as the footer, to disappear beneath the browser UI.
    - To fix this, I used the example provided in the article linked above. The fix takes a CSS variable and changes the value of it by obtaining the documentElement value and applying that value to the CSS variable. When applying the CSS variable to a height property within the html & body elements, the window height will adjust to the documentElement value, providing the intented result of having all elements fitting within the page.
    ```
    *style.css*

    :root {
        --app-height: 100%;
    }
    ```
    ```
    *main.js*

    const appHeight = () => {
    const doc = document.documentElement
    doc.style.setProperty('--app-height', `${window.innerHeight}px`)
    }
    window.addEventListener('resize', appHeight);
    appHeight();
    ```
<hr>

6. On initial load with no local storage stored, the webpage would store the local JSON files in local storage, however it would not display the intended elements.
    - The webpage contains a function which on DOM load, accesses whether local storage is present within the browser. If there is no presence of local storage, the function pushes stringified JSON to the user's local storage.
    - An issue appeared however, where on initial load the browser would take in the stringified JSON but would not display the contents as intended unless the user refreshes the page. The refreshing of the page solves the issue, but this is obviously not acceptable as a user experience.
    - The bug was promptly fixed as I had realised the fillWithLocalStorage function was only working when presence of local storage was found. Applying the function after the addJSONToLocalStorage function promptly fixed the issue.
    ```
    *repertoire.js*

    async function checkLocalStorage() {
        if (!localStorage.getItem('repertoire')){
            addJSONToLocalStorage("repertoire");
        } else {
            fillWithLocalStorage("repertoire");
        }
    }

    async function addJSONToLocalStorage(data) {
        if (data === "repertoire") {
            let repertoire = await fetchInitialJSON('assets/json/initRepertoire.json');
            localStorage.setItem('repertoire', JSON.stringify(repertoire));
        }
        fillWithLocalStorage(data);
    }   
    ```


## Unfixed Bugs


[Return to Contents 🡡](#contents)

# User Stories Testing

[Return to Contents 🡡](#contents)

# Manual Testing

[Return to Contents 🡡](#contents)

# Validation Testing

[Return to Contents 🡡](#contents)

# Performance Testing

[Return to Contents 🡡](#contents)