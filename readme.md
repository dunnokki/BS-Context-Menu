# BS Context Menu

A lightweight JavaScript library that enables custom component right-click context menus for Bootstrap 5 applications. Unaffiliated with the Bootstrap team.

[![Bootstrap 5](https://img.shields.io/badge/Bootstrap-5.3-7952b3?logo=bootstrap&logoColor=white)](https://getbootstrap.com/)
[![License](https://img.shields.io/badge/License-Apache2.0-green.svg)](LICENSE)
[![Vanilla JS](https://img.shields.io/badge/Vanilla-JS-f7df1e?logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)

## Features

- **Bootstrap 5 Native Styling** – Seamlessly integrates with Bootstrap's design system and CSS variables
- **Lightweight** – Zero dependencies beyond Bootstrap, minimal footprint
- **Keyboard Navigation** – Full keyboard support with arrow keys, Enter, and Escape
- **Smart Positioning** – Automatically adjusts to stay within viewport boundaries
- **Toggle Behavior** – Double right-click shows native browser context menu
- **Event Delegation** – Works with dynamically added elements
- **Accessible** – Proper ARIA attributes for screen readers
- **Dark Mode Support** – Respects Bootstrap's color mode preferences

## Installation

### CDN

Include the script after Bootstrap's JavaScript:

```html
<!-- Bootstrap 5 -->
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap.min.css" rel="stylesheet">
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/js/bootstrap.bundle.min.js"></script>

<!-- BS Context Menu -->
<script defer src="https://cdn.jsdelivr.net/gh/dunnokki/BS-Context-Menu@main/dist/bsContextMenu.min.js" crossorigin="anonymous"></script>
```

### Download

Download `bsContextMenu.min.js` from the [dist](dist) directory and include it in your project.

## Quick Start

### 1. Add the trigger attribute

Add `data-bs-context-menu="menuId"` to any element that should have a custom context menu:

```html
<button class="btn btn-primary" data-bs-context-menu="myMenu">
  Right-click me
</button>
```

### 2. Define the context menu

Create a menu element with the matching ID and the `context-menu` class anywhere in the DOM:

```html
<div class="context-menu" id="myMenu">
  <ul>
    <li><a class="dropdown-item" href="#">Action</a></li>
    <li><a class="dropdown-item" href="#">Another action</a></li>
    <li><hr class="dropdown-divider"></li>
    <li><a class="dropdown-item" href="#">Something else</a></li>
  </ul>
</div>
```

That's it! The context menu will appear when the user right-clicks on the button.

## Usage Examples

### Image Context Menu

Example context menu implementation for images using inline onclick handlers. Use `BSContextMenu.getActiveMenu()._bsContextMenuTrigger` to access the right-clicked element:

```html
<img src="photo.jpg" alt="Photo" data-bs-context-menu="imageMenu">

<div class="context-menu" id="imageMenu">
  <ul>
    <li><a class="dropdown-item" href="#" onclick="window.open(BSContextMenu.getActiveMenu()._bsContextMenuTrigger.src, '_blank')">View image</a></li>
    <li><a class="dropdown-item" href="#" onclick="navigator.clipboard.writeText(BSContextMenu.getActiveMenu()._bsContextMenuTrigger.src)">Copy image address</a></li>
  </ul>
</div>
```

### Hyperlink Context Menu

Example hyperlink context menu with external scripts.

```html
<a href="https://github.com/twbs/bootstrap" rel="noopener" target="_blank" data-bs-context-menu="linkMenu">
  Bootstrap
</a>
<div class="context-menu" id="linkMenu">
  <ul>
    <li><a class="dropdown-item" href="#" onclick="ContextMenuActions.openLink()">Open link</a></li>
    <li><a class="dropdown-item" href="#" onclick="ContextMenuActions.openLinkNewTab()">Open in new tab</a></li>
    <li><hr class="dropdown-divider"></li>
    <li><a class="dropdown-item" href="#" onclick="ContextMenuActions.copyLinkAddress()">Copy link address</a></li>
  </ul>
</div>
<script src="scripts/myScript.js"></script>
```

```js
// scripts/myScript.js
const ContextMenuActions = {
  getTrigger() {
    return BSContextMenu.getActiveMenu()._bsContextMenuTrigger;
  },
  openLink() {
    window.location.href = this.getTrigger().href;
  },
  openLinkNewTab() {
    window.open(this.getTrigger().href, '_blank');
  },
  copyLinkAddress() {
    navigator.clipboard.writeText(this.getTrigger().href);
  }
};
```

### Table Context Menu

Example table context menu with no functionality.

```html
<table class="table" data-bs-context-menu="tableMenu">
  <!-- Table content -->
</table>

<div class="context-menu" id="tableMenu">
  <ul>
    <li><span class="dropdown-header">Row actions</span></li>
    <li><a class="dropdown-item" href="#">Copy row</a></li>
    <li><a class="dropdown-item" href="#">Edit row</a></li>
    <li><hr class="dropdown-divider"></li>
    <li><a class="dropdown-item" href="#">Insert row above</a></li>
    <li><a class="dropdown-item" href="#">Insert row below</a></li>
    <li><hr class="dropdown-divider"></li>
    <li><a class="dropdown-item text-danger" href="#">Delete row</a></li>
  </ul>
</div>
```

### Nested Context Menus

Child elements can have their own context menu that takes precedence:

```html
<table class="table" data-bs-context-menu="tableMenu">
  <thead data-bs-context-menu="tableHeaderMenu">
    <!-- Header has its own context menu -->
  </thead>
  <tbody>
    <!-- Body uses the table's context menu -->
  </tbody>
</table>
```

## Menu Structure

Use Bootstrap's dropdown classes for consistent styling:

| Class | Description |
|-------|-------------|
| `.dropdown-item` | Clickable menu item |
| `.dropdown-divider` | Horizontal separator line |
| `.dropdown-header` | Non-clickable header text |
| `.disabled` | Disabled menu item |
| `.active` | Active menu item |
| `.text-danger` | Danger/destructive action styling |
| ... | Any other styling class |

### Complete Example

```html
<div class="context-menu" id="fullMenu">
  <ul>
    <li><span class="dropdown-header">Actions</span></li>
    <li><a class="dropdown-item" href="#">Regular item</a></li>
    <li><a class="dropdown-item active" href="#">Active item</a></li>
    <li><a class="dropdown-item disabled" href="#">Disabled item</a></li>
    <li><hr class="dropdown-divider"></li>
    <li><a class="dropdown-item text-danger" href="#">Delete</a></li>
  </ul>
</div>
```

## Keyboard Navigation

| Key | Action |
|-----|--------|
| `↓` Arrow Down | Focus next menu item |
| `↑` Arrow Up | Focus previous menu item |
| `Enter` / `Space` | Activate focused item |
| `Escape` | Close the menu |

## Toggle Behavior

The library implements a smart toggle behavior:

1. **First right-click** → Shows custom context menu
2. **Second consecutive right-click** on same element → Shows native browser context menu

This allows users to access the browser's native functionality when needed.

## JavaScript API

### `BSContextMenu.show(menuOrId, x, y, trigger?)`

Programmatically show a context menu at specified coordinates.

```javascript
// By ID
BSContextMenu.show('myMenu', 100, 200);

// By element reference
const menu = document.getElementById('myMenu');
BSContextMenu.show(menu, 100, 200, triggerElement);
```

### `BSContextMenu.hide()`

Close the currently active context menu.

```javascript
BSContextMenu.hide();
```

### `BSContextMenu.getActiveMenu()`

Get the currently active menu element, or `null` if no menu is open.

```javascript
const activeMenu = BSContextMenu.getActiveMenu();
if (activeMenu) {
  console.log('Menu is open:', activeMenu.id);
}
```

### `BSContextMenu.refresh()`

Re-initialize context menu triggers. Useful when new elements with `data-bs-context-menu` attributes are dynamically added to the DOM.

```javascript
// After dynamically adding new elements
document.body.insertAdjacentHTML('beforeend', `
  <button data-bs-context-menu="myMenu">New Button</button>
`);

// Ensure new triggers are keyboard-accessible
BSContextMenu.refresh();
```

## Events

The library dispatches custom events for menu lifecycle:

### `show.bs.contextmenu`

Fired when a context menu is shown.

```javascript
document.getElementById('myMenu').addEventListener('show.bs.contextmenu', (e) => {
  console.log('Menu shown at:', e.detail.x, e.detail.y);
  console.log('Trigger element:', e.detail.trigger);
});
```

### `hide.bs.contextmenu`

Fired when a context menu is hidden.

```javascript
document.getElementById('myMenu').addEventListener('hide.bs.contextmenu', (e) => {
  console.log('Menu hidden');
  console.log('Trigger element was:', e.detail.trigger);
});
```

## Accessibility

For proper accessibility, add ARIA attributes to trigger elements:

```html
<button 
  data-bs-context-menu="myMenu" 
  aria-expanded="false" 
  aria-controls="myMenu">
  Right-click me
</button>
```

The library automatically updates `aria-expanded` when the menu opens and closes.

## Dark Mode Support

The context menu automatically respects Bootstrap's color mode. It uses CSS variables like `--bs-body-bg`, `--bs-body-color`, and `--bs-border-color-translucent` for styling.

## Browser Support

Works in all modern browsers that support:
- ES6+ JavaScript
- CSS Custom Properties (CSS Variables)
- Bootstrap 5.x

## License

Apache 2.0

## Contributing

Please feel free to submit a Pull Request.

## Links

- [Live Demo](https://dunnokki.github.io/BS-Context-Menu/)
- [Report Issues](https://github.com/dunnokki/BS-Context-Menu/issues)
