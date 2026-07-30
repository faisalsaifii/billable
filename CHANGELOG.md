# Changelog

All notable changes to Billable will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.0] - 2026-07-30

### Added
- **Full keyboard accessibility** - Complete keyboard navigation support throughout the application
- **Keyboard shortcuts system** - Comprehensive F1-F12 and Alt/Ctrl+Key shortcuts for all features
- **Keyboard shortcuts reference** (F1) - In-app help showing all available keyboard shortcuts
- **Bank details fields** - Bank Name, Branch, Account Number, and IFSC Code for company profiles
- **Bank details on invoices** - Automatic display of bank information on printed documents
- **Item unit support** - Full unit and unit conversion support for inventory items
- **Focus trap utilities** - Modal dialog focus management for accessibility
- **Keyboard navigation hooks** - Reusable navigation utilities for lists and tables
- **ARIA attributes** - Screen reader support with proper ARIA labels and roles
- **Skip-to-main-content link** - Keyboard navigation shortcut for main content
- **Landing page/website** - Marketing website with feature showcase
- **Application icons** - New modern icon set

### Changed
- **Revamped account page** - Redesigned account creation and editing interface with new fields
- **New invoice layout** - Modern, professional invoice design with better readability
- **Improved focus indicators** - Enhanced visual feedback for keyboard navigation
- **Updated README** - Added accessibility section highlighting keyboard support
- **Enhanced component styling** - Better visual consistency and contrast

### Fixed
- Fixed invoice color inconsistencies
- Fixed PDF export issues
- Fixed printing layout problems
- Fixed sales voucher creation issues
- Fixed company creation and editing problems
- Fixed database connection errors and warnings
- Fixed TypeScript compiler warnings
- Fixed voucher validation errors
- Fixed component rendering issues
- Fixed keyboard event handling

### Documentation
- Added `KEYBOARD_ACCESSIBILITY.md` - Complete keyboard navigation guide
- Added `ACCESSIBILITY_IMPLEMENTATION.md` - Technical implementation details
- Added `RELEASE_NOTES_0.2.0.md` - Detailed release announcement
- Updated `README.md` with accessibility highlights

### Technical
- Implemented focus management system for modals
- Added keyboard navigation patterns for interactive elements
- Integrated WCAG 2.1 Level AA accessibility standards
- Improved TypeScript type safety
- Enhanced error handling and validation
- Optimized rendering performance

---

## [0.1.0] - Initial Release

### Added
- Core accounting functionality
- Financial transaction management
- Inventory management system
- Multi-location support (Material Centres)
- Company management
- Master data management (Accounts, Items, etc.)
- Voucher entry (Sales, Purchase, Payment, Receipt, Journal)
- Display and reporting features (Trial Balance, Account Ledger, Stock Status)
- Printing capabilities
- Data management utilities (Backup, Export, Data Freezing)
- Configuration system
- Tauri-based desktop application
- SQLite database integration

---

[0.2.0]: https://github.com/yourusername/billable/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/yourusername/billable/releases/tag/v0.1.0
