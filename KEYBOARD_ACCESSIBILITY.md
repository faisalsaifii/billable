# Keyboard Accessibility Guide

## Overview
This application is fully keyboard accessible. All features can be accessed and operated using only the keyboard, without requiring a mouse.

## Global Keyboard Shortcuts

### Navigation
- **F1**: Show keyboard shortcuts help
- **Tab / Shift+Tab**: Navigate between interactive elements
- **Enter**: Activate buttons and links
- **Space**: Activate buttons and checkboxes
- **Escape**: Close modals and dropdowns

### Company & Administration
- **Alt/Ctrl + F**: Configuration
- **Alt/Ctrl + M**: Modify Master
- **Alt/Ctrl + U**: Utilities

### Transactions
- **Alt/Ctrl + F3**: Add Voucher
- **Alt/Ctrl + F5**: Add Payment Voucher
- **Alt/Ctrl + F6**: Add Receipt Voucher
- **Alt/Ctrl + F7**: Add Journal Voucher
- **Alt/Ctrl + F8**: Add Sales Voucher
- **Alt/Ctrl + F9**: Add Purchase Voucher

### Reports & Display
- **Alt/Ctrl + A**: Accounts Monthly Summary
- **Alt/Ctrl + B**: Balance Sheet
- **Alt/Ctrl + G**: Item Ledger
- **Alt/Ctrl + I**: Item Monthly Summary
- **Alt/Ctrl + L**: Account Ledger
- **Alt/Ctrl + S**: Stock Status (Grouped)
- **Alt/Ctrl + T**: Trial Balance (Grouped)
- **Alt + V**: VAT Summary

### Utilities
- **Ctrl + D**: Batch Deletion
- **Alt/Ctrl + E**: Data Export / Import
- **Alt/Ctrl + N**: Notes Manager
- **Alt/Ctrl + Q**: Query on Transactions
- **Alt + P**: Show Pending Batches

## Component-Specific Navigation

### Dropdown Menus
- **Enter / Space / Arrow Down**: Open dropdown
- **Arrow Up / Arrow Down**: Navigate menu items
- **Enter / Space**: Select focused item
- **Escape**: Close dropdown without selecting
- **Tab**: Close dropdown and move to next element

### Modal Dialogs
- **Escape**: Close modal
- **Tab / Shift+Tab**: Navigate within modal (focus is trapped)
- Focus automatically moves to the first interactive element when modal opens
- Focus returns to the trigger element when modal closes

### Tables
- **Tab**: Move to the first action button in a row
- **Shift+Tab**: Move backwards through table actions
- **Enter**: Activate focused button
- All action buttons have clear labels for screen readers

### Forms
- **Tab**: Move to next field
- **Shift+Tab**: Move to previous field
- **Enter**: Submit form (when focus is on submit button)
- **Escape**: Cancel/close form dialog

## Accessibility Features

### Focus Management
- All interactive elements have visible focus indicators (blue outline)
- Focus is trapped within modal dialogs
- Focus order follows logical reading order
- Skip-to-main-content link for keyboard users

### Screen Reader Support
- All interactive elements have appropriate ARIA labels
- Modal dialogs have proper ARIA attributes
- Tables have proper role attributes
- Dropdown menus have ARIA states

### Visual Focus Indicators
- 2px blue outline on focused elements
- Subtle shadow for enhanced visibility
- High contrast focus states
- Keyboard-focused items in lists have background highlight

## Best Practices for Keyboard Users

1. **Start with F1**: Press F1 at any time to see the complete keyboard shortcuts reference
2. **Use Tab liberally**: Tab is your friend for discovering all interactive elements
3. **Dropdown navigation**: Use arrow keys within dropdowns instead of Tab
4. **Modal dialogs**: Remember Escape closes modals quickly
5. **Table navigation**: Tab through action buttons in tables row by row

## Testing Keyboard Accessibility

To verify keyboard accessibility:
1. Unplug your mouse or don't touch it
2. Use only Tab, Enter, Space, Arrow keys, and Escape
3. Verify you can:
   - Navigate all menus
   - Open and close dialogs
   - Fill out all forms
   - Interact with all tables
   - Access all features

## Developer Notes

### Custom Hooks
- `useFocusTrap.ts`: Manages focus trapping in modals
- `useKeyboardNav.ts`: Handles keyboard navigation in lists/tables

### CSS Classes
- `.skip-link`: Skip-to-main-content link
- `[data-keyboard-nav-item]`: Marks items for keyboard navigation
- `[data-keyboard-focused]`: Indicates current keyboard focus

### ARIA Attributes Used
- `role="dialog"`, `aria-modal="true"`: Modal dialogs
- `role="menu"`, `role="menuitem"`: Dropdown menus
- `role="table"`, `role="row"`, `role="cell"`: Enhanced tables
- `aria-label`, `aria-labelledby`: Accessible names
- `aria-expanded`, `aria-haspopup`: State indicators

## Browser Support
Keyboard navigation works in all modern browsers:
- Chrome/Edge (Chromium)
- Firefox
- Safari
- Opera

All features are tested with keyboard-only navigation and screen readers.
