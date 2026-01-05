/**
 * Bootstrap-styled right-click context menu implementation.
 * Supports keyboard navigation, viewport boundary detection, and alternating
 * right-click behavior (first click shows custom menu, second shows browser default).
 */
(function () {
  'use strict';

  const CONTEXT_MENU_ATTR = 'data-bs-context-menu';
  const CONTEXT_MENU_CLASS = 'context-menu';
  const SHOW_CLASS = 'show';

  /** Currently displayed context menu element */
  let activeMenu = null;
  
  /** Tracks the last right-clicked element for alternating menu behavior */
  let lastRightClickedElement = null;

  /**
   * Initializes context menu functionality by injecting styles and attaching event listeners.
   */
  function init() {
    injectStyles();
    ensureTriggersAreFocusable();

    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('click', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    window.addEventListener('scroll', hideActiveMenu, true);
    window.addEventListener('resize', hideActiveMenu);
  }

  /**
   * Injects required CSS styles for context menus into the document head.
   * Skips injection if styles are already present.
   */
  function injectStyles() {
    if (document.getElementById('bs-context-menu-styles')) return;

    const styles = document.createElement('style');
    styles.id = 'bs-context-menu-styles';
    styles.textContent = `
      .${CONTEXT_MENU_CLASS} {
        position: fixed;
        z-index: 1080;
        display: none;
        min-width: 10rem;
        padding: 0.5rem 0;
        margin: 0;
        font-size: 1rem;
        color: var(--bs-body-color);
        text-align: left;
        list-style: none;
        background-color: var(--bs-body-bg);
        background-clip: padding-box;
        border: var(--bs-border-width) solid var(--bs-border-color-translucent);
        border-radius: var(--bs-border-radius);
        box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
      }

      .${CONTEXT_MENU_CLASS}.${SHOW_CLASS} {
        display: block;
      }

      .${CONTEXT_MENU_CLASS} ul {
        list-style: none;
        padding: 0;
        margin: 0;
      }

      .${CONTEXT_MENU_CLASS} .dropdown-item {
        display: block;
        width: 100%;
        padding: 0.25rem 1rem;
        clear: both;
        font-weight: 400;
        color: var(--bs-body-color);
        text-align: inherit;
        text-decoration: none;
        white-space: nowrap;
        background-color: transparent;
        border: 0;
        cursor: pointer;
        transition: color 0.15s ease-in-out, background-color 0.15s ease-in-out;
      }

      .${CONTEXT_MENU_CLASS} .dropdown-item:hover,
      .${CONTEXT_MENU_CLASS} .dropdown-item:focus-visible {
        color: var(--bs-dropdown-link-hover-color, var(--bs-emphasis-color));
        background-color: var(--bs-dropdown-link-hover-bg, var(--bs-tertiary-bg));
        text-decoration: none;
      }

      .${CONTEXT_MENU_CLASS} .dropdown-item:focus {
        outline: none;
      }

      .${CONTEXT_MENU_CLASS} .dropdown-item.active,
      .${CONTEXT_MENU_CLASS} .dropdown-item:active {
        color: var(--bs-dropdown-link-active-color, #fff);
        background-color: var(--bs-dropdown-link-active-bg, var(--bs-primary));
        text-decoration: none;
      }

      .${CONTEXT_MENU_CLASS} .dropdown-item.disabled,
      .${CONTEXT_MENU_CLASS} .dropdown-item:disabled {
        color: var(--bs-dropdown-link-disabled-color, var(--bs-secondary-color));
        pointer-events: none;
        background-color: transparent;
      }

      .${CONTEXT_MENU_CLASS} .dropdown-divider {
        height: 0;
        margin: 0.5rem 0;
        overflow: hidden;
        border-top: 1px solid var(--bs-border-color-translucent);
      }

      .${CONTEXT_MENU_CLASS} .dropdown-header {
        display: block;
        padding: 0.5rem 1rem;
        margin-bottom: 0;
        font-size: 0.875rem;
        color: var(--bs-secondary-color);
        white-space: nowrap;
      }
    `;
    document.head.appendChild(styles);
  }

  /**
   * Ensures all context menu triggers are keyboard-focusable by adding
   * tabindex="0" to elements that aren't natively focusable.
   */
  function ensureTriggersAreFocusable() {
    const triggers = document.querySelectorAll(`[${CONTEXT_MENU_ATTR}]`);
    const nativelyFocusable = ['A', 'BUTTON', 'INPUT', 'SELECT', 'TEXTAREA'];

    triggers.forEach(trigger => {
      if (trigger.hasAttribute('tabindex')) return;
      if (nativelyFocusable.includes(trigger.tagName) && 
          (trigger.tagName !== 'A' || trigger.hasAttribute('href'))) return;

      trigger.setAttribute('tabindex', '0');
    });
  }

  /**
   * Handles right-click context menu events. Implements alternating behavior:
   * first right-click shows custom menu, consecutive right-click on same element
   * shows the browser's default context menu.
   * @param {MouseEvent} event
   */
  function handleContextMenu(event) {
    const trigger = event.target.closest(`[${CONTEXT_MENU_ATTR}]`);
    if (!trigger) {
      lastRightClickedElement = null;
      return;
    }

    const menuId = trigger.getAttribute(CONTEXT_MENU_ATTR);
    if (!menuId) return;

    const menu = document.getElementById(menuId);
    if (!menu || !menu.classList.contains(CONTEXT_MENU_CLASS)) return;

    // Consecutive right-click on same element: show browser default menu instead
    if (lastRightClickedElement === trigger) {
      lastRightClickedElement = null;
      hideActiveMenu();
      return;
    }

    lastRightClickedElement = trigger;
    event.preventDefault();
    event.stopPropagation();
    hideActiveMenu();
    showMenu(menu, event.clientX, event.clientY, trigger);
  }

  /**
   * Shows context menu at specified position with viewport boundary adjustment.
   * @param {HTMLElement} menu - The context menu element to display
   * @param {number} x - Initial X position (client coordinates)
   * @param {number} y - Initial Y position (client coordinates)
   * @param {HTMLElement} trigger - The element that triggered the menu
   */
  function showMenu(menu, x, y, trigger) {
    activeMenu = menu;
    trigger.setAttribute('aria-expanded', 'true');
    menu.style.left = `${x}px`;
    menu.style.top = `${y}px`;
    menu.classList.add(SHOW_CLASS);

    // Store reference to trigger element
    menu._bsContextMenuTrigger = trigger;

    // Adjust position if menu goes off-screen, then focus first item for keyboard accessibility
    requestAnimationFrame(() => {
      adjustMenuPosition(menu, x, y);
      // Move focus to the first menu item for keyboard accessibility
      const firstItem = menu.querySelector('.dropdown-item:not(.disabled):not(:disabled)');
      if (firstItem) {
        firstItem.focus();
      }
    });

    menu.dispatchEvent(new CustomEvent('show.bs.contextmenu', {
      bubbles: true,
      detail: { trigger, x, y }
    }));
  }

  /**
   * Adjusts menu position to keep it fully visible within the viewport.
   * @param {HTMLElement} menu - The context menu element
   * @param {number} x - Original X position
   * @param {number} y - Original Y position
   */
  function adjustMenuPosition(menu, x, y) {
    const rect = menu.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let newX = x;
    let newY = y;

    if (x + rect.width > viewportWidth) {
      newX = Math.max(0, viewportWidth - rect.width - 5);
    }

    if (y + rect.height > viewportHeight) {
      newY = Math.max(0, viewportHeight - rect.height - 5);
    }

    menu.style.left = `${newX}px`;
    menu.style.top = `${newY}px`;
  }

  /**
   * Hides the currently active menu and returns focus to the trigger element.
   */
  function hideActiveMenu() {
    if (!activeMenu) return;

    const trigger = activeMenu._bsContextMenuTrigger;
    if (trigger) {
      trigger.setAttribute('aria-expanded', 'false');
      trigger.focus();
    }

    activeMenu.classList.remove(SHOW_CLASS);
    activeMenu.dispatchEvent(new CustomEvent('hide.bs.contextmenu', {
      bubbles: true,
      detail: { trigger }
    }));

    activeMenu._bsContextMenuTrigger = null;
    activeMenu = null;
  }

  /**
   * Handles clicks outside the menu to close it, and clicks on menu items.
   * Prevents default anchor behavior for items with href="#".
   * @param {MouseEvent} event
   */
  function handleClickOutside(event) {
    if (!activeMenu) return;

    if (activeMenu.contains(event.target)) {
      if (event.target.closest('.dropdown-item')) {
        event.preventDefault();
        lastRightClickedElement = null;
        hideActiveMenu();
      }
      return;
    }

    // Clicked outside - reset toggle state
    lastRightClickedElement = null;
    hideActiveMenu();
  }

  /**
   * Handles keyboard navigation within the context menu.
   * Supports: Escape (close), Arrow keys (navigate), Enter/Space (select), Tab (cycle).
   * @param {KeyboardEvent} event
   */
  function handleKeyDown(event) {
    if (!activeMenu) return;

    switch (event.key) {
      case 'Escape':
        event.preventDefault();
        hideActiveMenu();
        break;
      case 'ArrowDown':
        event.preventDefault();
        focusNextItem(1);
        break;
      case 'ArrowUp':
        event.preventDefault();
        focusNextItem(-1);
        break;
      case 'Enter':
      case ' ':
        if (document.activeElement?.classList.contains('dropdown-item')) {
          event.preventDefault();
          document.activeElement.click();
        }
        break;
      case 'Tab':
        // Trap focus within the menu - cycle through items
        event.preventDefault();
        focusNextItem(event.shiftKey ? -1 : 1);
        break;
    }
  }

  /**
   * Moves focus to the next or previous enabled menu item with wrapping.
   * @param {number} direction - 1 for next, -1 for previous
   */
  function focusNextItem(direction) {
    if (!activeMenu) return;

    const items = Array.from(
      activeMenu.querySelectorAll('.dropdown-item:not(.disabled):not(:disabled)')
    );
    if (items.length === 0) return;

    const currentIndex = items.indexOf(document.activeElement);
    let nextIndex;

    if (currentIndex === -1) {
      nextIndex = direction === 1 ? 0 : items.length - 1;
    } else {
      nextIndex = (currentIndex + direction + items.length) % items.length;
    }

    items[nextIndex]?.focus();
  }

  // ─────────────────────────────────────────────
  // Public API
  // ─────────────────────────────────────────────

  window.BSContextMenu = {
    /**
     * Programmatically shows a context menu at the specified position.
     * @param {string|HTMLElement} menuOrId - Menu element or its ID
     * @param {number} x - X position in client coordinates
     * @param {number} y - Y position in client coordinates
     * @param {HTMLElement} [trigger=document.body] - Element to associate as trigger
     */
    show(menuOrId, x, y, trigger = null) {
      const menu = typeof menuOrId === 'string'
        ? document.getElementById(menuOrId)
        : menuOrId;

      if (menu && menu.classList.contains(CONTEXT_MENU_CLASS)) {
        hideActiveMenu();
        showMenu(menu, x, y, trigger || document.body);
      }
    },

    /**
     * Programmatically hides the active context menu.
     */
    hide() {
      hideActiveMenu();
    },

    /**
     * Returns the currently active menu element, or null if none is open.
     * @returns {HTMLElement|null}
     */
    getActiveMenu() {
      return activeMenu;
    },

    /**
     * Re-scans the DOM for context menu triggers and ensures they are focusable.
     * Call this after dynamically adding new trigger elements.
     */
    refresh() {
      ensureTriggersAreFocusable();
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

