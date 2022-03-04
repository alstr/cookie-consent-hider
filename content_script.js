"use strict"

var modifiedElements = [];

browser.runtime.onMessage.addListener( async ( msg ) => {
    if ( msg.action === "run" ) {
        setRootTags();
        scanElement( document.body );
    } else if ( msg.action === "reset" ) {
        console.debug( "CCH content script will reset" );
        for ( let i in modifiedElements ) {
            let elm = modifiedElements[ i ].element;
            let reasons = modifiedElements[ i ].reasons;
            for ( let j in reasons ) {
                elm.style.setProperty( reasons[ j ].property, reasons[ j ].defaultValue, reasons[ j ].defaultPriority );
            }
        }
        document.documentElement.classList.remove( "cookieconsenthider" );
        modifiedElements = [];
        browser.runtime.sendMessage( {
            action: "hasReset"
        } );
    } else if ( msg.action === "rowClick" ) {
        console.debug( "CCH content script will toggle sidebar item" );
        let elm = modifiedElements[ msg.index ].element;
        let reasons = modifiedElements[ msg.index ].reasons;
        let shouldHide = msg.shouldHide;
        console.debug( shouldHide );
        for ( let j in reasons ) {
            if ( shouldHide ) {
                elm.style.setProperty( reasons[ j ].property, reasons[ j ].defaultValue, reasons[ j ].defaultPriority );
            } else {
                elm.style.setProperty( reasons[ j ].property, reasons[ j ].value, "important" );
            }
        }
    } else if ( msg.action === "runCheck" ) {
        console.debug( "CCH content script will check if ran previously" );
        const runCheck = document.documentElement.classList.contains( "cookieconsenthider" );
        console.debug( runCheck );
        return runCheck;
    }
} );

function setRootTags() {
    let documentElementModifications = [];
    let bodyModifications = [];
    let documentStyle = getComputedStyle( document.documentElement );
    let bodyStyle = getComputedStyle( document.body );
    if ( documentStyle.overflow === "hidden" || documentStyle.overflowY === "hidden" ) {
        documentElementModifications.push( {
            property: "overflow-y",
            value: "auto",
            defaultValue: documentStyle.overflowY,
            defaultPriority: documentStyle.getPropertyPriority( "overflow-y" ),
            description: "Changed the document overflow setting to unhide content."
        } );
        document.documentElement.style.setProperty( "overflow-y", "auto", "important" );
    }
    if ( documentStyle.position === "fixed" ) {
        documentElementModifications.push( {
            property: "position",
            value: "static",
            defaultValue: documentStyle.position,
            defaultPriority: documentStyle.getPropertyPriority( "position" ),
            description: "Unfixed the document element position to allow the page to scroll."
        } );
        document.documentElement.style.setProperty( "position", "static", "important" );
    }
    if ( bodyStyle.overflow === "hidden" || bodyStyle.overflowY === "hidden" ) {
        bodyModifications.push( {
            property: "overflow-y",
            value: "auto",
            defaultValue: bodyStyle.overflowY,
            defaultPriority: bodyStyle.getPropertyPriority( "overflow-y" ),
            description: "Changed the body overflow setting to unhide content."
        } );
        document.body.style.setProperty( "overflow-y", "auto", "important" );
    }
    if ( bodyStyle.position === "fixed" ) {
        bodyModifications.push( {
            property: "position",
            value: "static",
            defaultValue: bodyStyle.position,
            defaultPriority: bodyStyle.getPropertyPriority( "position" ),
            description: "Unfixed the body element position to allow the page to scroll."
        } );
        document.body.style.setProperty( "position", "static", "important" );
    }

    if ( documentElementModifications.length > 0 ) {
        modifiedElements.push( { element: document.documentElement, reasons: documentElementModifications } );
    }
    if ( bodyModifications.length > 0 ) {
        modifiedElements.push( { element: document.body, reasons: bodyModifications } );
    }
    document.documentElement.classList.add( "cookieconsenthider" );
}

function scanElement( elm ) {
    console.debug( "CCH content script scanning element" );
    var child;

    const style = getComputedStyle( elm );
    let isHeader = false;
    let cookiesMentioned = false;
    let isEmpty = elm.innerHTML === "";
    let isRoot = elm.nodeName.toLowerCase() === "body";

    if ( !isRoot && typeof( elm.className ) === "string" ) {
        isHeader = elm.className.toLowerCase().indexOf( "header" ) > -1 || elm.nodeName.toLowerCase() === "header";
        cookiesMentioned = elm.innerHTML.toLowerCase().indexOf( "cookies" ) > -1 || elm.innerHTML.toLowerCase().indexOf( "consent" ) > -1;
    }

    if ( !isRoot && !isHeader && ( cookiesMentioned || isEmpty ) && ( style.position === "fixed" || style.position === "absolute" ) && ( elm.nodeName.toLowerCase() != "img" ) ) {
        const defaultValue = style.display;
        const defaultPriority = style.getPropertyPriority( "display" );
        elm.style.setProperty( "display", "none", "important" );
        if ( modifiedElements.indexOf( elm ) === -1 ) {
            let reason;
            if ( cookiesMentioned ) {
                reason = "Hid this element as it seemed to be a cookies consent dialogue.";
            } else if ( isEmpty ) {
                reason = "Hid this element as it was empty. Empty elements are often used to obscure content.";
            }
            modifiedElements.push( {
                element: elm,
                reasons: [
                    {
                        property: "display",
                        value: "none",
                        defaultValue: defaultValue,
                        defaultPriority: defaultPriority,
                        description: reason
                    }
                ]
            } );
        }
    } else {
        for ( child = elm.firstChild; child; child = child.nextSibling ) {
            if ( child.nodeType === 1 ) {
                scanElement( child );
            }
        }
    }

    if ( isRoot && child === null ) {
        let items = [];
        for ( let i in modifiedElements ) {
            let description;
            let modified = modifiedElements[ i ][ "element" ];
            if ( modified.innerHTML ) {
                description = modified.outerHTML.replace( modified.innerHTML, "" );
            } else {
                description = modified.outerHTML;
            }
            items.push( {
                "elementString": description,
                "reasons": modifiedElements[ i ].reasons
            } );
        }

        console.debug( "CCH content script sending run completion notification" );
        browser.runtime.sendMessage( {
            action: "hasRun",
            items: items
        } );
    }
}

function onError( error ) {
    console.error( error );
}

function modeRetrieved( item ) {
    console.debug( "CCH run mode:" );
    console.debug( item.mode );
    if ( item.mode !== "manual" ) {
        window.addEventListener( "load", function() {
            setRootTags();
            scanElement( document.body );
        } );
    }
}

let getMode = browser.storage.sync.get( "mode" );
getMode.then( modeRetrieved, onError );
