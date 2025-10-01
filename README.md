# Private Journaling Assistant

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://web-llm-demo-delta.vercel.app/)

This project demonstrates a journaling assistant powered entirely by WebLLM running in the browser.
During webinars, participants can explore the app live at **https://web-llm-demo-delta.vercel.app/** without any local setup.

## Overview

The built-in assistant remains hidden until you have typed a short amount of text.
By default the first suggestion appears after **20** new characters. This
behavior can be adjusted by modifying `ASSISTANT_TRIGGER_CHARS` in the code.
The entry must also contain **more than 25 words** before a suggestion will appear.
Journal entries use `crypto.randomUUID` when available, falling back to a lightweight UUID v4 helper in older browsers.


## Live Demo

1. Visit **https://web-llm-demo-delta.vercel.app/**.
2. Start writing in the journal editor.
3. After at least 20 new characters and 25 words, the assistant bubble will show a locally generated suggestion.


## Deployment

A public demo is hosted on Vercel at **https://web-llm-demo-delta.vercel.app/**. This instance powers webinars and allows anyone to try the assistant without installing dependencies.

## Local Development

Run the project with [Corepack](https://nodejs.org/api/corepack.html) so that the
correct Yarn version is used automatically:

```bash
# Enable Corepack once (comes bundled with Node 22+)
corepack enable

# Use Corepack to run Yarn commands
corepack yarn install
corepack yarn lint
corepack yarn type-check
corepack yarn dev
corepack yarn build
corepack yarn start
```


## How It Works

1. Develop locally using your preferred tools
2. Push changes to this repository
3. Vercel deploys the latest version from this repository
