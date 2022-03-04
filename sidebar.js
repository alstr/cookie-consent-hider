"use strict"

var windowId;

async function sendClickEvent( tabId, index ) {
    console.debug( "CCH sidebar item selected" );
    let input = document.getElementsByTagName( "input" )[ index ];
    await browser.tabs.sendMessage(
        tabId, { action: "rowClick", shouldHide: input.checked, index: index }
    );
}

function setSidebarText( tabId, items, url ) {
    console.debug( "Setting CCH sidebar text" );
    const tabChangeMessage = document.getElementById( "tab-change-message" );
    let urlHeading = document.getElementById( "url" );
    let modifiedElements = document.getElementById( "modified-elements" );
    modifiedElements.innerHTML = "";
    let noModifiedElements = document.getElementById( "no-modified-elements" );

    if ( typeof ( items ) === "undefined" ) {
        tabChangeMessage.style.setProperty( "display", "block" );
        urlHeading.textContent = "";
        noModifiedElements.style.setProperty( "display", "none" );
        return;
    }

    tabChangeMessage.style.setProperty( "display", "none" );
    urlHeading.textContent = url;

    items.forEach( ( item, index ) => {
        let elm = item.elementString;
        let listEntry = document.createElement( "li" );
        let code = document.createElement( "code" );
        let span = document.createElement( "span" );
        let label = document.createElement( "label" );
        label.textContent = "Disable";
        let input = document.createElement( "input" );
        input.setAttribute( "type", "checkbox" );
        input.setAttribute( "value", index );
        label.appendChild( input );
        code.textContent = elm;
        code.tabIndex = 1;
        listEntry.appendChild( code );
        for ( let i in item.reasons ) {
            span.textContent += item.reasons[ i ].description + "\n";
        }
        listEntry.appendChild( span );
        listEntry.appendChild( label );
        modifiedElements.appendChild( listEntry );
        input.addEventListener( "click", function( event ) {
            sendClickEvent( tabId, index );
        } );
    } );

    if ( items.length > 0 ) {
        noModifiedElements.style.setProperty( "display", "none" );
    } else {
        noModifiedElements.style.setProperty( "display", "block" );
    }
}

function updateItems() {
    browser.tabs.query( { windowId: windowId, active: true } ).then( async ( tabs ) => {
        let items = await browser.runtime.sendMessage( {
            action: "getSidebarItems"
        } );
        setSidebarText( tabs[ 0 ].id, items, tabs[ 0 ].url );
    } );
}

console.debug( "CCH sidebar.js loaded" );
function initSidebar() {
    browser.windows.getCurrent( { populate: true } ).then( ( windowInfo ) => {
        windowId = windowInfo.id;
        updateItems();
    } );
}

initSidebar();

browser.runtime.onMessage.addListener( async ( msg ) => {
    if ( msg.action === "updateSidebarItems" ) {
        console.debug( "New items received by CCH sidebar" );
        initSidebar();
    }
} );

browser.tabs.onActivated.addListener( function() {
    initSidebar();
} );
