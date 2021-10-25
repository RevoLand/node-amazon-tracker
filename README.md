To-do list or stuff that are existing in the c# version of the tracker yet missing in this one.
---
- [x] [Typescript](https://github.com/RevoLand/node-amazon-tracker/issues/1)
- [x] [MySQL integration for products and price history](https://github.com/RevoLand/node-amazon-tracker/issues/2)
- [x] [Discord integration](https://github.com/RevoLand/node-amazon-tracker/issues/3)
  - [ ] Tracking products, stopping product tracking
  - [ ] Tracker related settings
  - [ ] Notifications related to price changes
  - [ ] Captcha related notifications
- [ ] [Support for rest of the Amazon websites (com, uk, de, es, fr, it)](https://github.com/RevoLand/node-amazon-tracker/issues/4)
- [ ] [Manual and automatic captcha resolving](https://github.com/RevoLand/node-amazon-tracker/issues/5)
- [ ] [Tracking related optimizations](https://github.com/RevoLand/node-amazon-tracker/issues/4)
  - [ ] Navigate between pages rather than creating a new one?
  - [ ] Better product/html data handling
- [ ] [Code coverage](https://github.com/RevoLand/node-amazon-tracker/issues/6)

---

**Notes:**

- This project is not an attempt to make a crawler as i don't and never cared about the whole product catalog of Amazon.
- This project will always respect the limits of Amazon (as given in the robots.txt file), will use a static (custom) user-agent and will always keep the time between requests long as much as possible to prevent abusive traffic requests.
