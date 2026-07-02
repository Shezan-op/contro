# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Added
- **App Store Screenshots Generator**: A programmatic page built at `/screenshots-generator` using `html-to-image` to export high-quality marketing assets and slides.
- **Notifications**: Added a notification system.
- **Tasks Overhaul**: Complete task overhaul including nested subtasks.
- **Lead Magnets Writing**: Added page-by-page writing system in Lead Magnets details page.
- **PWA Support**: Setup PWA configurations and Vercel Analytics integration.

### Changed
- **Landing Page Polish**: Updated footer structure and animations in `contro-lp.html` to align with premium GSAP/Awwwards design references.
- **Auth Flow**: Resolved the redirect loop between splash and login to ensure seamless redirection into the dashboard upon login.
- **Architecture**: Productionized the app by removing temporary files and fixing architecture desyncs to reach 100/100 React-Doctor scores.

### Fixed
- Fixed splash screen and authentication routing bugs.
- Fixed React hooks linting issues in Editor and components.
- Finalized app features and squashed minor navigation bugs across core dashboard modules.
