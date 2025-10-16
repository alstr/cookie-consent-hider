# Cookie Consent Hider

**This add-on hides fixed-position cookie consent dialogs, banners, etc.**

## What it does

When activated, Cookie Consent Hider searches the page DOM for any elements relating to fixed-position cookie consent dialogs, and adds CSS styling to hide them.

No cookies are accepted or rejected by the extension; it simply hides UI elements, so the user can browse the page without having to set any preferences.

This extension is designed for pages that you will probably only ever visit once. It allows you to quickly view whatever you want to view without spending potentially over a minute sifting through menus and waiting for cookies to be processed. For websites you do visit frequently, you probably do want to set cookie preferences.

## Config

By default, the extension is set to 'automatic' mode, meaning it runs for every website loaded. This can be changed to 'manual', so it only runs when the page action icon is pressed.

**If the extension is set to automatic mode, the extension will not pick up any elements added to the DOM after page load. In this case, it is advised to try toggling the extension off/on via the page action icon to trigger a rerun.**

A sidebar menu is available via `Ctrl/Cmd+Shift+X` for viewing a log of elements that have been modified, and these can be individually toggled.

## Disclaimer

Some websites may not work correctly if cookies are not set.

**This extension will not work on every website. It is impossible to account for every possible website UI. This extension is designed to be simple and focus on a single common scenario: fixed-position cookie consent dialogues such as the ones powered by OneTrust, TrustArc, etc.**
