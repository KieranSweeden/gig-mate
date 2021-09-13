# GigMate

![image]

This project was developed for the Interactive Front End Development module within the Diploma in Web Application Development course provided by Code Institute.

![link to view GitHub page deployment]

# Contents

1. [UX](#UX)
    - [Strategy](#Strategy)
        - [Project Goals](#Project-Goals)
        - [User Stories](#User-Stories) 
    - [Scope](#Scope)
    - [Structure](#Structure)
    - [Skeleton](#Skeleton)
    - [Surface](#Surface)

2. [Features](#Features)

    - [Current Features](#Current-Features)
    - [Future Features](#Future-Features)

3. [Technologies](#Technologies)

4. [Testing](#Testing)

5. [Deployment](#Deployment)

6. [Credits](#Credits)

# UX

## Strategy

### Project Goals

The primary goal of GigMate, is to provide it's users with an elegant and simple way of organising & structuring their personal repertoire of songs, for use on stage and at home.

GigMate is targeting music professionals as a target audience, who are often performing in various bands and entertainment agencies. Being involved with various acts can often bring organisational challenges related to scheduling, attire and various nuances regarding particular tracks in the setlist.

GigMate's sole purpose is to contain all the information relating to various gigs in one place, saving the user from deep diving into various messaging threads and asking fellow band members, which will lead to unprofessional impressions from their peers. This aids in not only providing the user with peace of mind, but also helps the user in maintaining a professional presence amongst their peers, which'll likely bring more work in the future.

### User Stories

As a professional musician, I want GigMate to:
- Provide me with a template document-like structure, that I can easily edit for each gig respectively.
- Work well on multiple screens, so I can view/edit gig information at home on desktop, on the go on mobile and whilst performing on tablet/mobile.
- Save the edits I make, so they'll always be there when I re-visit them on that particular device.
- Give me the ability to write notes relating to a particular song.
- Display my gigs immediately when opening the application.
- Display my setlist for live use, making full use of the screen on my device.
- Have dark mode functionality, making it easier to read in dark environments.

[Return to Contents 🡡](#contents)

## Scope

Potential features to include in the Minimal Viable Product (MVP) of GigMate include:

| Features                                                     	| Importance 	| Viability/Feasability 	|
|--------------------------------------------------------------	|------------	|-----------------------	|
| Responsive design                                            	| 5          	| 5                     	|
| Dark mode                                                    	| 3          	| 4                     	|
| User accounts used to store information                      	| 4          	| 1                     	|
| Local storage                                                	| 5          	| 3                     	|
| Progress bar for completion of all input fields for each gig 	| 3          	| 3                     	|
| Required input fields                                        	| 5          	| 5                     	|
| Edit states for each respective track & setlist              	| 5          	| 4                     	|
| Grey state for gigs in past/White state for upcoming gigs    	| 3          	| 4                     	|
| Collaborative functionality                                  	| 3          	| 1                     	|
| Live view mode                                               	| 5          	| 4                     	|
| Drag n Drop API functionality                                	| 4          	| 4                     	|

Responsive design is important to give the user flexibility in deciding what device suits their needs, making it more applicable and useful for all potential users within the niche target audience.

Given a large portion of the application's usefulness is situated in a live environment, having the option to view the application in a dark mode would be important to it's users.

User accounts would be tremendously useful not only for the user in their information being available across multiple devices but also potential goals relating to the business such gathering data from it's users, recognising trends and using that data as a way to dictate future feature releases. However the knowledge to integrate such a feature is not available at this moment in time, therefore it will pushed back as a future release.

Local storage is integral to the applications functionality, in remembering the data the user has input within the application and settings such as dark mode. Although I'm not too familiar with the web API, it's importance is paramount, it will therefore be integrated into GigMate in it's MVP stage.

Although a progress bar is not important in a functional sense, it would incentivise and inform the user to complete all input fields within a gig such as the date, dress code, band members etc. Given this feature would not be too difficult to implement and falls directly in line with the user's goals, it should be included in the MVP of GigMate.

Like the progress bar, required fields would incentivise the user to complete all necessary information regarding a gig. This should be integrated within the MVP of GigMate.

An edit state for setlists and individual tracks is vital and important to the user. It should display buttons such as edit, clear etc. A clear all fields button would also be useful, given a situation has a occured where the user has replaced the previous gig with another one for that date and would save the user time in deleting the previous information. This feature is important as it includes much of the core functionality and usefulness of GigMate, therefore it should be included in the MVP stage.

A simple interface that's immediate in communicating something to the user is important, greyed out gigs that have a date attached to them that's in the past, should be greyed out to immediately inform the user that they're in the past. This also highlights the upcoming gigs that are not greyed out. Given it's a simple and elegant way in communicating to the user of a gig's date, it should be included in the MVP of GigMate.

Although collaborative functionality would improve the usefulness of the application, the knowledge to integrate this feature is not yet known and also this features targets groups of musicians rather than the individual musicians themselves. Therefore it will be withheld for a future release of GigMate.

Live view mode is integral in making the application useful in a live environment. In it's simplest form, this feature should be integrated in the MVP of GigMate. However possible functionality for live view mode, is allowing the user to set how many tracks they'd like to see at once on screen at a time. If time is available, this feature should be integrated.

Drag n Drop is an interface that users are familiar with, making it easy to learn and it also looks elegant due to it's simplicity, which falls directly in line with the project's goals. It should therefore be included in the MVP of GigMate.

[Return to Contents 🡡](#contents)

## Structure

GigMate is effectively replacing the handwritten setlist that a professional musician creates prior to a performance. These handwritten setlists are created due to their simplicity and readability, which GigMate should re-create where possible to make the transition to GigMate easy for the user. This should also be represented within the overall structure of GigMate, where it should be consistent, predictable, learnable and also provides useful and intuitive feedback to it's users. With this in mind, GigMate should leverage as many website & application navigational conventions as it can to make the learning experience more user friendly.

The architecture of GigMate will follow a nested list style, consisting of linear paths to greater detail surrounding certain sections of the website. An example to demonstrate this would be the following:

- LIST - Setlists (Clicking this takes the user to their list of setlists)
    - SUB-LIST - Wedding Pop (Clicking this would take the user to a setlist they created called "Wedding Pop)
        - NESTED LIST - Set 1 (Clicking this would take the user to a list of tracks contained within Set 1)
            - CONTENT - The list of tracks in Set 1 of the Wedding Pop setlist being displayed to the user.

A nested list is the most suitable for GigMate as an informational archiecture, as it's suitable for mobile devices, reduces complexity given it's linear pathways and the list nature of the architecture fits the list oriented nature of GigMate.

Despite the positives of using the nested list architecture for GigMate, it does run the risk of preventing exploration throughout the application. With this in mind, a burger icon for mobile/tablet and horizontal navigation bars for desktop will be utilised not only for exploration, but to reduce the amount of clicks a user has to make in order to navigate to a different section of the site.


[Return to Contents 🡡](#contents)

## Skeleton

### Mobile Wireframes

<details>
<summary>index.html</summary>

![Index page for mobile screen sizes](documentation/wireframes/mobile/index.html-mobile.png)

</details>

<details>
<summary>gigs.html</summary>

![Gig list for mobile screen sizes](documentation/wireframes/mobile/gigs.html-gig-list-mobile.png)

![New gig for mobile screen sizes](documentation/wireframes/mobile/gigs.html-new-gig-mobile.png)

![Gig info for mobile screen sizes](documentation/wireframes/mobile/gigs.html-gig-info-mobile.png)

![Gig set for mobile screen sizes](documentation/wireframes/mobile/gigs.html-gig-set-mobile.png)

![Gig list edit for mobile screen sizes](documentation/wireframes/mobile/gigs.html-gig-list-edit-mobile.png)

![Gig add track for mobile screen sizes](documentation/wireframes/mobile/gigs.html-gig-add-track-mobile.png)

![Gig live mode for mobile screen sizes](documentation/wireframes/mobile/gigs.html-live-mode-mobile.png)

</details>

<details>
<summary>setlists.html</summary>

![Setlist list for mobile screen sizes](documentation/wireframes/mobile/setlists.html-mobile.png)

![New setlist for mobile screen sizes](documentation/wireframes/mobile/setlists.html-list-new-setlist-mobile.png)

![View setlist for mobile screen sizes](documentation/wireframes/mobile/setlists.html-setlist-view-mobile.png)

![Edit setlist for mobile screen sizes](documentation/wireframes/mobile/setlists.html-setlist-edit-mobile.png)

![Add track to setlist for mobile screen sizes](documentation/wireframes/mobile/setlists.html-add-track-mobile.png)

![Edit track in setlist for mobile screen sizes](documentation/wireframes/mobile/setlists.html-track-edit-mobile.png)

</details>

<details>
<summary>repertoire.html</summary>

![Repertoire view for mobile screen sizes](documentation/wireframes/mobile/repertoire.html-view-mobile.png)

![Edit track in repertoire for mobile screen sizes](documentation/wireframes/mobile/repertoire.html-track-edit-mobile.png)

![Add track to repertoire for mobile screen sizes](documentation/wireframes/mobile/repertoire.html-add-track-mobile.png)

</details>

### Tablet Wireframes

### Desktop Wireframes

[Return to Contents 🡡](#contents)

## Surface

[Return to Contents 🡡](#contents)

# Features

[Return to Contents 🡡](#contents)

## Current Features

[Return to Contents 🡡](#contents)

## Future Features

[Return to Contents 🡡](#contents)

# Technologies

[Return to Contents 🡡](#contents)

# Testing

To view the testing procedures undertook for this project, click [here](TESTING.md).

[Return to Contents 🡡](#contents)

# Deployment

[Return to Contents 🡡](#contents)

# Credits

[Return to Contents 🡡](#contents)

