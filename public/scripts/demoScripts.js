/**
 * Context menu action handlers for the BS Context Menu demo.
 * Provides clipboard, navigation, and table manipulation actions.
 */
(function () {
  'use strict';

  /** Tracks the element that triggered the context menu */
  let lastClickedElement = null;
  /** Tracks the table row where context menu was opened */
  let lastClickedRow = null;
  /** Tracks the table cell where context menu was opened */
  let lastClickedCell = null;

  document.addEventListener('show.bs.contextmenu', (event) => {
    lastClickedElement = event.detail.trigger;
    const actualElement = document.elementFromPoint(event.detail.x, event.detail.y);
    
    if (lastClickedElement?.closest('table') || actualElement?.closest('table')) {
      lastClickedRow = actualElement?.closest('tr');
      lastClickedCell = actualElement?.closest('th, td');
    }
  });

  /**
   * Displays a Bootstrap toast notification.
   * @param {string} message - The message to display
   * @param {'info'|'success'|'danger'} [type='info'] - Toast style variant
   */
  function showToast(message, type = 'info') {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      container.className = 'toast-container position-fixed bottom-0 start-50 translate-middle-x p-3';
      container.style.zIndex = '1100';
      document.body.appendChild(container);
    }

    const toastId = 'toast-' + Date.now();
    const bgClass = type === 'success' ? 'text-bg-success' : 
                    type === 'danger' ? 'text-bg-danger' : 'text-bg-secondary';
    
    const toastHtml = `
      <div id="${toastId}" class="toast ${bgClass}" role="alert" aria-live="assertive" aria-atomic="true">
        <div class="d-flex">
          <div class="toast-body">${message}</div>
          <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
      </div>
    `;
    container.insertAdjacentHTML('beforeend', toastHtml);
    
    const toastEl = document.getElementById(toastId);
    const toast = new bootstrap.Toast(toastEl, { delay: 3000 });
    toast.show();
    
    toastEl.addEventListener('hidden.bs.toast', () => toastEl.remove());
  }

  // ─────────────────────────────────────────────
  // Text Menu Actions
  // ─────────────────────────────────────────────

  window.ContextMenuActions = {
    /**
     * Copies the currently selected text to the clipboard.
     */
    copyText() {
      const selectedText = window.getSelection().toString();
      if (selectedText) {
        navigator.clipboard.writeText(selectedText).then(() => {
          showToast('Text copied to clipboard!', 'success');
        }).catch(() => {
          showToast('Failed to copy text', 'danger');
        });
      } else {
        showToast('No text selected', 'info');
      }
    },

    /**
     * Opens a Google search for selected text or the element's text content.
     */
    searchText() {
      let searchText = window.getSelection().toString().trim();
      
      if (!searchText && lastClickedElement) {
        searchText = lastClickedElement.textContent.trim();
      }
      
      if (searchText) {
        const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(searchText)}`;
        window.open(searchUrl, '_blank');
      } else {
        showToast('No text to search', 'info');
      }
    },

    // ─────────────────────────────────────────────
    // Link Menu Actions
    // ─────────────────────────────────────────────

    /**
     * Finds the anchor element from the clicked context.
     * @returns {HTMLAnchorElement|null}
     * @private
     */
    _getLink() {
      return lastClickedElement?.querySelector('a[href]') || 
             lastClickedElement?.closest('a[href]') ||
             lastClickedElement;
    },

    /**
     * Navigates to the link URL in the current tab.
     */
    openLink() {
      const link = this._getLink();
      if (link?.href) {
        window.location.href = link.href;
      }
    },

    /**
     * Opens the link URL in a new browser tab.
     */
    openLinkNewTab() {
      const link = this._getLink();
      if (link?.href) {
        window.open(link.href, '_blank');
        showToast('Opened in new tab', 'success');
      }
    },

    /**
     * Copies the link URL to the clipboard.
     */
    copyLinkAddress() {
      const link = this._getLink();
      if (link?.href) {
        navigator.clipboard.writeText(link.href).then(() => {
          showToast('Link copied to clipboard!', 'success');
        }).catch(() => {
          showToast('Failed to copy link', 'danger');
        });
      }
    },

    // ─────────────────────────────────────────────
    // Image Menu Actions
    // ─────────────────────────────────────────────

    /**
     * Finds the image element from the clicked context.
     * @returns {HTMLImageElement|null}
     * @private
     */
    _getImage() {
      return lastClickedElement?.tagName === 'IMG' ? lastClickedElement :
             lastClickedElement?.querySelector('img');
    },

    /**
     * Opens the image source URL in a new tab.
     */
    viewImage() {
      const img = this._getImage();
      if (img?.src) {
        window.open(img.src, '_blank');
      }
    },

    /**
     * Copies the image to the clipboard. Falls back to copying the URL if
     * the Clipboard API doesn't support image copying.
     */
    async copyImage() {
      const img = this._getImage();
      if (img?.src) {
        try {
          const response = await fetch(img.src);
          const blob = await response.blob();
          await navigator.clipboard.write([
            new ClipboardItem({ [blob.type]: blob })
          ]);
          showToast('Image copied to clipboard!', 'success');
        } catch (e) {
          navigator.clipboard.writeText(img.src);
          showToast('Image URL copied (image copy not supported)', 'info');
        }
      }
    },

    /**
     * Copies the image source URL to the clipboard.
     */
    copyImageAddress() {
      const img = this._getImage();
      if (img?.src) {
        navigator.clipboard.writeText(img.src).then(() => {
          showToast('Image URL copied!', 'success');
        }).catch(() => {
          showToast('Failed to copy URL', 'danger');
        });
      }
    },

    // ─────────────────────────────────────────────
    // Table Menu Actions
    // ─────────────────────────────────────────────

    /**
     * @returns {HTMLTableElement|null}
     * @private
     */
    _getTable() {
      return lastClickedElement?.closest('table');
    },

    /**
     * @returns {HTMLTableRowElement|null}
     * @private
     */
    _getRow() {
      return lastClickedRow || lastClickedElement?.closest('tr');
    },

    /**
     * Copies all cell values from the row as tab-separated text.
     */
    copyRow() {
      const row = this._getRow();
      if (row) {
        const cells = Array.from(row.cells).map(cell => cell.textContent.trim());
        const rowText = cells.join('\t');
        navigator.clipboard.writeText(rowText).then(() => {
          showToast('Row copied: ' + cells.join(', '), 'success');
        });
      }
    },

    /**
     * Makes the row's cells editable. Clicking outside the row saves changes.
     */
    editRow() {
      const row = this._getRow();
      if (row && row.closest('tbody')) {
        const cells = row.querySelectorAll('th, td');
        cells.forEach(cell => {
          cell.contentEditable = 'true';
          cell.classList.add('bg-warning-subtle');
        });
        cells[0]?.focus();
        showToast('Row is now editable. Click elsewhere to finish.', 'info');

        const stopEditing = (e) => {
          if (!row.contains(e.target)) {
            cells.forEach(cell => {
              cell.contentEditable = 'false';
              cell.classList.remove('bg-warning-subtle');
            });
            document.removeEventListener('click', stopEditing);
            showToast('Row editing finished', 'success');
          }
        };
        // Delay to avoid immediate trigger from the context menu click
        setTimeout(() => document.addEventListener('click', stopEditing), 100);
      }
    },

    /**
     * Inserts a new row above the current row with placeholder values.
     */
    insertRowAbove() {
      const row = this._getRow();
      const table = this._getTable();
      if (row && table) {
        const newRow = row.cloneNode(true);
        const nextRowNum = this._getNextRowNumber(table);
        newRow.querySelectorAll('td, th').forEach((cell, i) => {
          if (cell.tagName === 'TH' && i === 0) {
            cell.textContent = nextRowNum;
          } else {
            cell.textContent = '-';
          }
        });
        row.parentNode.insertBefore(newRow, row);
        showToast('Row inserted above', 'success');
      }
    },

    /**
     * Inserts a new row below the current row with placeholder values.
     */
    insertRowBelow() {
      const row = this._getRow();
      const table = this._getTable();
      if (row && table) {
        const newRow = row.cloneNode(true);
        const nextRowNum = this._getNextRowNumber(table);
        newRow.querySelectorAll('td, th').forEach((cell, i) => {
          if (cell.tagName === 'TH' && i === 0) {
            cell.textContent = nextRowNum;
          } else {
            cell.textContent = '-';
          }
        });
        row.parentNode.insertBefore(newRow, row.nextSibling);
        showToast('Row inserted below', 'success');
      }
    },

    /**
     * Deletes the current row. Header rows cannot be deleted.
     */
    deleteRow() {
      const row = this._getRow();
      if (row && row.closest('tbody')) {
        const rowData = Array.from(row.cells).map(c => c.textContent.trim()).join(', ');
        row.remove();
        showToast('Row deleted: ' + rowData, 'danger');
      } else if (row?.closest('thead')) {
        showToast('Cannot delete header row', 'danger');
      }
    },

    /**
     * Calculates the next row number by finding the highest existing number + 1.
     * @param {HTMLTableElement} table
     * @returns {number}
     * @private
     */
    _getNextRowNumber(table) {
      if (!table) return 1;
      const rows = table.querySelectorAll('tbody tr');
      let maxNum = 0;
      rows.forEach(row => {
        const firstCell = row.querySelector('th, td');
        const num = parseInt(firstCell?.textContent);
        if (!isNaN(num) && num > maxNum) {
          maxNum = num;
        }
      });
      return maxNum + 1;
    },

    // ─────────────────────────────────────────────
    // Table Header Menu Actions
    // ─────────────────────────────────────────────

    /**
     * Gets information about the clicked column header.
     * @returns {{th: HTMLTableCellElement, columnIndex: number, table: HTMLTableElement}|null}
     * @private
     */
    _getColumnInfo() {
      const th = lastClickedCell?.tagName === 'TH' ? lastClickedCell : lastClickedCell?.closest('th');
      if (!th) return null;
      const headerRow = th.closest('tr');
      const columnIndex = Array.from(headerRow.cells).indexOf(th);
      const table = th.closest('table');
      return { th, columnIndex, table };
    },

    /**
     * Sorts the table by the clicked column in ascending order.
     */
    sortColumnAsc() {
      this._sortColumn('asc');
    },

    /**
     * Sorts the table by the clicked column in descending order.
     */
    sortColumnDesc() {
      this._sortColumn('desc');
    },

    /**
     * Sorts the table rows by column value. Automatically detects numeric vs string sorting.
     * @param {'asc'|'desc'} direction
     * @private
     */
    _sortColumn(direction) {
      const info = this._getColumnInfo();
      if (!info) return;
      const { columnIndex, table } = info;
      const tbody = table.querySelector('tbody');
      if (!tbody) return;

      const rows = Array.from(tbody.querySelectorAll('tr'));
      const isNumeric = rows.every(row => {
        const cell = row.cells[columnIndex];
        return cell && !isNaN(parseFloat(cell.textContent.trim()));
      });

      rows.sort((a, b) => {
        const aVal = a.cells[columnIndex]?.textContent.trim() || '';
        const bVal = b.cells[columnIndex]?.textContent.trim() || '';
        
        let comparison;
        if (isNumeric) {
          comparison = parseFloat(aVal) - parseFloat(bVal);
        } else {
          comparison = aVal.localeCompare(bVal);
        }
        return direction === 'asc' ? comparison : -comparison;
      });

      rows.forEach(row => tbody.appendChild(row));
      showToast(`Sorted by column ${direction === 'asc' ? 'ascending' : 'descending'}`, 'success');
    },

    /**
     * Hides the clicked column. The first (index) column cannot be hidden.
     */
    hideColumn() {
      const info = this._getColumnInfo();
      if (!info) return;
      const { columnIndex, table, th } = info;

      if (columnIndex === 0) {
        showToast('Cannot hide the index column', 'danger');
        return;
      }

      const columnName = th.textContent.trim();
      
      th.style.display = 'none';
      th.dataset.bsHidden = 'true';

      table.querySelectorAll('tbody tr').forEach(row => {
        if (row.cells[columnIndex]) {
          row.cells[columnIndex].style.display = 'none';
        }
      });

      showToast(`Column "${columnName}" hidden`, 'info');
    },

    /**
     * Restores all previously hidden columns in the table.
     */
    showAllColumns() {
      const info = this._getColumnInfo();
      if (!info) return;
      const { table } = info;

      let hiddenCount = 0;

      table.querySelectorAll('thead th').forEach((th, index) => {
        if (th.dataset.bsHidden === 'true') {
          th.style.display = '';
          delete th.dataset.bsHidden;
          hiddenCount++;

          table.querySelectorAll('tbody tr').forEach(row => {
            if (row.cells[index]) {
              row.cells[index].style.display = '';
            }
          });
        }
      });

      if (hiddenCount > 0) {
        showToast(`${hiddenCount} column(s) restored`, 'success');
      } else {
        showToast('No hidden columns to show', 'info');
      }
    },

    /**
     * Copies all visible cell values from the column as newline-separated text.
     */
    copyColumnData() {
      const info = this._getColumnInfo();
      if (!info) return;
      const { columnIndex, table, th } = info;

      const columnName = th.textContent.trim();
      const values = [];

      table.querySelectorAll('tbody tr').forEach(row => {
        const cell = row.cells[columnIndex];
        if (cell && cell.style.display !== 'none') {
          values.push(cell.textContent.trim());
        }
      });

      const text = values.join('\n');
      navigator.clipboard.writeText(text).then(() => {
        showToast(`Copied ${values.length} values from "${columnName}"`, 'success');
      }).catch(() => {
        showToast('Failed to copy column data', 'danger');
      });
    }
  };

  // ─────────────────────────────────────────────
  // Copy Code Button Handler
  // ─────────────────────────────────────────────

  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.bd-copy-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const codeSnippet = btn.closest('.code-snippet');
        const codeElement = codeSnippet?.querySelector('.code-element');
        
        if (codeElement) {
          const codeText = codeElement.textContent;
          navigator.clipboard.writeText(codeText).then(() => {
            showToast('Code copied to clipboard!', 'success');
          }).catch(() => {
            showToast('Failed to copy code', 'danger');
          });
        } else {
          showToast('No code element found', 'danger');
        }
      });
    });
  });
})();
