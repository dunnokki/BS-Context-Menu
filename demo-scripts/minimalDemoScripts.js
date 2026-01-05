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