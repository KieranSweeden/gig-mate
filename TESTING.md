# GigMate Testing

This markdown file documents the development process of GigMate.

To return to the original README file, [click here](README.md).

![link to view GitHub page deployment]

# Contents

1. [Bugs](#Bugs)
    - [Fixed Bugs](#Fixed-Bugs)

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

[Return to Contents 🡡](#contents)

# User Stories Testing

[Return to Contents 🡡](#contents)

# Manual Testing

[Return to Contents 🡡](#contents)

# Validation Testing

[Return to Contents 🡡](#contents)

# Performance Testing

[Return to Contents 🡡](#contents)