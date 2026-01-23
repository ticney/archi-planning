# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e3]:
    - generic [ref=e4]:
      - heading "Welcome back" [level=2] [ref=e5]
      - paragraph [ref=e6]: Please sign in to your account
    - generic [ref=e7]:
      - generic [ref=e8]:
        - generic [ref=e9]:
          - generic [ref=e10]: Email address
          - textbox "Email address" [ref=e12]: leader.e2e.1769159397455@example.com
        - generic [ref=e13]:
          - generic [ref=e14]: Password
          - textbox "Password" [ref=e16]: password123
      - generic [ref=e19]:
        - heading "Login failed" [level=3] [ref=e20]
        - paragraph [ref=e22]: Invalid login credentials
      - button "Sign in" [ref=e24]
  - button "Open Next.js Dev Tools" [ref=e30] [cursor=pointer]:
    - img [ref=e31]
  - alert [ref=e34]
```