# Password Generator

A clean, dependency-free password generator built with HTML, CSS and JavaScript.

## Features
- Length from 4 to 64 (slider or number input)
- Uppercase, lowercase, numbers and symbols
- Option to avoid look-alike characters (O, 0, l, 1, I)
- Cryptographically secure randomness (`crypto.getRandomValues`, unbiased)
- Always includes at least one character of each selected type
- Strength meter based on entropy
- One-click copy to clipboard with fallback
- Responsive, keyboard accessible, light and dark mode

## Run
Open `index.html` in any modern browser. No build step or install needed.

## Structure
```
password-generator/
  index.html
  css/style.css
  js/script.js
```
