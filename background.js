"use strict"

const ALLOWED_PROTOCOLS = [ "http:", "https:" ];
var items = [];
var runCheck = false;

function protocolAllowed( url ) {
    const protocol = ( new URL( url ) ).protocol;
    return ALLOWED_PROTOCOLS.includes( protocol );
}

function initPageAction( tab ) {
    if ( protocolAllowed( tab.url ) && tab.url.indexOf( "https://addons.mozilla.org" ) === -1 ) {
        browser.pageAction.show( tab.id );
        console.debug( "CCH initialise" );
    }
}

var getTabs = browser.tabs.query( {} );
getTabs.then( ( tabs ) => {
    for ( let tab of tabs ) {
        initPageAction( tab );
    }
} );

browser.tabs.onUpdated.addListener( async ( id, changeInfo, tab ) => {
    if ( changeInfo.url ) {
        initPageAction( tab );
        runCheck = await browser.tabs.sendMessage( tab.id, { action: "runCheck" } );
    }
} );

browser.tabs.onActivated.addListener( function() {
    items = undefined;
} );

function setIcon( isActive ) {
    browser.windows.getCurrent( { populate: true } ).then( ( windowInfo ) => {
        const myWindowId = windowInfo.id;
        browser.tabs.query( { windowId: myWindowId, active: true } ).then( async ( tabs ) => {
            let icon;
            console.debug( "Set CCH icon active:" );
            console.debug( isActive );
            if ( isActive ) {
                icon = "icons/icon-active.svg";
            } else {
                icon = "icons/icon.svg";
            }
            browser.pageAction.setIcon( {
                tabId: tabs[ 0 ].id,
                path: icon
            } );
        } );
    } );
}

browser.runtime.onMessage.addListener( async ( msg ) => {
    if ( msg.action === "hasRun" ) {
        console.debug( "CCH content script has run" );
        items = msg.items;
        setIcon( true );
        browser.runtime.sendMessage( {
            action: "updateSidebarItems",
            items: items
        } );
    } else if ( msg.action === "hasReset" ) {
        console.debug( "CCH content script has reset" );
        items = [];
        setIcon( false );
        browser.runtime.sendMessage( {
            action: "updateSidebarItems",
            items: items
        } );
    } else if ( msg.action === "getSidebarItems" ) {
        console.debug( "CCH sidebar items requested" );
        return items;
    }
} );

browser.pageAction.onClicked.addListener( async ( tab ) => {
    console.debug( "CCH is active:" );
    console.debug( runCheck );
    runCheck = await browser.tabs.sendMessage( tab.id, { action: "runCheck" } );
    if ( runCheck ) {
        browser.tabs.sendMessage( tab.id, { action: "reset" } );
    } else {
        browser.tabs.sendMessage( tab.id, { action: "run" } );
    }
} );
