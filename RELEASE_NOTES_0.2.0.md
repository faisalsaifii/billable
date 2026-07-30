# Billable v0.2.0 Release Notes

**Release Date:** July 30, 2026

We're excited to announce Billable v0.2.0, a major update that brings full keyboard accessibility, enhanced company management features, improved invoicing, and numerous refinements to make your accounting workflow faster and more efficient.

---

## 🎯 Highlights

### ⌨️ Full Keyboard Accessibility
Billable is now **completely keyboard accessible**! Every feature can be accessed and operated using only the keyboard, with no mouse required.

- **Complete keyboard navigation** - Tab, Arrow keys, Enter, and Escape work throughout the app
- **Global shortcuts** - F1-F12 and Alt/Ctrl combinations for instant access to any feature
- **Focus management** - Clear visual indicators and logical tab order
- **Screen reader support** - Full ARIA labels and semantic HTML for assistive technologies
- **Keyboard shortcuts reference** - Press **F1** anytime to view all available shortcuts

**For power users:** Navigate your entire accounting workflow at keyboard speed!  
**For accessibility users:** Full compatibility with screen readers and assistive technologies.

See [KEYBOARD_ACCESSIBILITY.md](KEYBOARD_ACCESSIBILITY.md) for the complete guide.

---

## ✨ New Features

### 🏦 Bank Details Management
- Add bank information to your company profile
- Fields for Bank Name, Branch, Account Number, and IFSC Code
- Bank details automatically appear on printed invoices and documents
- Edit bank information anytime through company settings

### 📄 Redesigned Invoice Layout
- Modern, professional invoice design
- Cleaner layout with better readability
- Bank details prominently displayed
- Improved color scheme and typography
- Better spacing and alignment

### 📊 Enhanced Account Management
- Revamped account creation and editing interface
- New fields for comprehensive account tracking
- Improved data validation and error handling
- Better organization of account information

### 🔢 Item Unit Support
- Full support for item units and unit conversions
- Track inventory in multiple units (pieces, kg, liter, etc.)
- Automatic unit conversion in transactions
- Enhanced inventory reporting with units

### 🎨 Visual Improvements
- Updated application icons
- Refined UI components with better contrast
- Improved visual consistency across all screens
- Enhanced focus indicators for better navigation

### 🌐 Landing Page & Website
- New marketing website showcasing Billable features
- Professional landing page with feature highlights
- Download page for easy distribution
- Responsive design for all devices

---

## 🐛 Bug Fixes

### Invoice & Printing
- Fixed invoice color inconsistencies
- Resolved PDF export issues
- Corrected printing layout problems
- Fixed alignment issues in printed documents

### Sales & Transactions
- Fixed sales voucher creation issues
- Resolved voucher validation problems
- Corrected transaction posting errors
- Fixed duplicate entry prevention

### Company Management
- Resolved company creation and editing issues
- Fixed company status updates
- Corrected company selection persistence
- Fixed company deletion confirmation

### Database & Performance
- Fixed database connection errors
- Resolved SQL query warnings
- Improved database transaction handling
- Corrected data integrity checks

### General Improvements
- Fixed compiler warnings
- Resolved TypeScript type errors
- Corrected component rendering issues
- Fixed keyboard event handling

---

## 🎹 Keyboard Shortcuts Quick Reference

### Essential Shortcuts
| Shortcut | Action |
|----------|--------|
| **F1** | Show Keyboard Shortcuts Help |
| **Alt/Ctrl+F** | Configuration |
| **Alt/Ctrl+M** | Modify Master |
| **Alt/Ctrl+F8** | Add Sales Voucher |
| **Alt/Ctrl+L** | Account Ledger |
| **Alt/Ctrl+T** | Trial Balance |
| **Escape** | Close modals and dialogs |

### Voucher Shortcuts
- **Alt/Ctrl+F3** - Add Voucher
- **Alt/Ctrl+F5** - Add Payment Voucher
- **Alt/Ctrl+F6** - Add Receipt Voucher
- **Alt/Ctrl+F7** - Add Journal Voucher
- **Alt/Ctrl+F8** - Add Sales Voucher
- **Alt/Ctrl+F9** - Add Purchase Voucher

See [KEYBOARD_ACCESSIBILITY.md](KEYBOARD_ACCESSIBILITY.md) for the complete list.

---

## 🔧 Technical Improvements

### Accessibility Architecture
- Implemented focus trap utilities for modal dialogs
- Added keyboard navigation hooks for lists and tables
- Integrated ARIA attributes throughout the application
- Created reusable accessible component library

### Code Quality
- Improved TypeScript type safety
- Enhanced error handling and validation
- Better component organization
- Reduced compiler warnings

### Performance
- Optimized rendering performance
- Improved database query efficiency
- Reduced bundle size
- Better memory management

---

## 📚 Documentation

### New Documentation
- **KEYBOARD_ACCESSIBILITY.md** - Complete keyboard navigation guide
- **ACCESSIBILITY_IMPLEMENTATION.md** - Technical implementation details
- Updated README with accessibility highlights

### Developer Resources
- Focus trap implementation patterns
- Keyboard navigation best practices
- ARIA attribute usage guidelines
- Modal dialog accessibility patterns

---

## 🚀 Getting Started with v0.2.0

### For New Users
1. Download and install Billable v0.2.0
2. Press **F1** to see all keyboard shortcuts
3. Create your first company with new bank details fields
4. Experience the improved invoice layout

### For Existing Users
1. Update to v0.2.0
2. Add bank details to your existing companies
3. Explore the new keyboard shortcuts (**F1** for full list)
4. Try navigating with keyboard only - it's faster!

---

## 🎯 What's Next?

We're continuously improving Billable based on your feedback. Upcoming priorities:
- Enhanced reporting features
- Multi-currency improvements
- Advanced inventory features
- Performance optimizations
- Additional keyboard shortcuts

---

## 🙏 Thank You

Thank you for using Billable! This release represents hundreds of commits and careful attention to accessibility, usability, and performance. We're committed to making Billable the best accounting software for modern businesses.

### Accessibility Commitment
We believe software should be accessible to everyone. Version 0.2.0 is our first major step toward full accessibility compliance, meeting WCAG 2.1 standards. We'll continue improving accessibility in every release.

---

## 📞 Support & Feedback

- **Documentation:** See [README.md](README.md) and [KEYBOARD_ACCESSIBILITY.md](KEYBOARD_ACCESSIBILITY.md)
- **Issues:** Report bugs and request features through GitHub Issues
- **License:** See [LICENSE.md](LICENSE.md) for licensing information

---

**Version:** 0.2.0  
**Build Date:** July 30, 2026  
**Platform:** Windows, macOS, Linux (via Tauri)  
**License:** Elastic License 2.0
