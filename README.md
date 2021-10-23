To-do list or stuff that are existing in the c# version of the tracker yet missing in this one.
---
- [ ] MySQL integration for products and price history
- [ ] Discord integration
  - [ ] Tracking products, stopping product tracking
  - [ ] Tracker related settings
  - [ ] Notifications related to price changes
  - [ ] Captcha related notifications
- [ ] Support for rest of the Amazon websites (com, uk, de, es, fr, it)
- [ ] Manual and automatic captcha resolving
- [ ] Tracking related optimizations
  - [ ] Navigate between pages rather than creating a new one?
  - [ ] Better product/html data handling
- [ ] Code coverage (?)
- [ ] Typescript (?)

---

**Notes:**

- This project is not an attempt to make a crawler as i don't and never cared about the whole product catalog of Amazon.
- This project will always respect the limits of Amazon (as given in the robots.txt file), will use a static (custom) user-agent and will always keep the time between requests long as much as possible to prevent abusive traffic requests.
