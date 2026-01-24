# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e6] [cursor=pointer]:
    - button "Open Next.js Dev Tools" [ref=e7]:
      - img [ref=e8]
    - generic [ref=e11]:
      - button "Open issues overlay" [ref=e12]:
        - generic [ref=e13]:
          - generic [ref=e14]: "0"
          - generic [ref=e15]: "1"
        - generic [ref=e16]: Issue
      - button "Collapse issues badge" [ref=e17]:
        - img [ref=e18]
  - alert [ref=e20]
  - generic [ref=e21]:
    - generic [ref=e23]:
      - heading "Reviewer Cockpit" [level=1] [ref=e24]
      - paragraph [ref=e25]: Manage and review pending governance requests.
    - generic [ref=e27]:
      - tablist [ref=e28]:
        - tab "Pending Reviews 0" [selected] [ref=e29]:
          - text: Pending Reviews
          - generic [ref=e30]: "0"
        - tab "Validated 0" [ref=e31]:
          - text: Validated
          - generic [ref=e32]: "0"
      - tabpanel "Pending Reviews 0" [ref=e33]:
        - generic [ref=e34]: No pending requests found.
```