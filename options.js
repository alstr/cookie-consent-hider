function save( e ) {
    e.preventDefault();
    browser.storage.sync.set( {
        mode: document.querySelector( "#mode" ).value
    } );
    alert( "Mode updated" );
}

function restore() {
    function setCurrent( result ) {
        document.querySelector( "#mode" ).value = result.mode || "automatic";
    }

    function onError( error ) {
        console.error( error );
    }

    let getMode = browser.storage.sync.get( "mode" );
    getMode.then( setCurrent, onError );
}

document.addEventListener( "DOMContentLoaded", restore );
document.querySelector( "form" ).addEventListener( "submit", save );
