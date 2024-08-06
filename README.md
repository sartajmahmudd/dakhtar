# Project Overview

### Project Setup

- node 18 or higher and pnpm 6 or higher is required to run this project
- clone the project
- open the IDE at the root of your project
- make sure you have the `.env` file at the root of you project
- install dependencies (`pnpm install`)

> **💡Tips:** You should enable `auto save` and `save on format` features in VSCode.

### Common commands

> **⚠️Warning:** You need to be at the root of the project to run any of these command.

- To install all dependencies `pnpm install`
- To start the dev server `pnpm dev`
- To install/add a package for an specific app `pnpm add PKG_NAME --filter=<APP_NAME>`. E.g. `pnpm add axios --filter=web`
- To format the code `pnpm format`
- To lint the code `pnpm lint`
- To type check the code `pnpm type-check`
- To build the project `pnpm build`

### Branching strategy

> **💡Tips:** Use source control of vscode to manage your branches.This will save you a lot of time.

- `main` branch is for `production`
- `staging` branch is for `development`
  > **⚠️Warning:** DO NOT PUSH TO `main` or `staging`. This can get you fired! So be careful.
- branch from `staging`
- branch name should be `feature/<feature-name>` or `fix/<fix-name>`
- Always create a PR to merge your branch to `staging` when you are done with your feature/fix
- Always assign someone to review your PR
- To create a new branch `git checkout -b <branch-name>`
- To push a branch `git push origin <branch-name>`
- Always push changes to github as you work on your branch

### Web Portals Routes

- [ ] /
- [ ] /404
- [ ] /500
- [ ] /about
- [ ] /terms
- [ ] /login
- [ ] /appointments
- [ ] /onboarding
- [ ] /doctor
- [ ] /doctor/slug
- [ ] /doctor/slug/admin
- [ ] /doctor/slug/manageAppointment
- [ ] /booking/slug
- [ ] /admin
- [ ] /admin/appointment
- [ ] /admin/doctor
- [ ] /admin/doctor/id

# force deploy 1
# force deploy 2
# force deploy 3
