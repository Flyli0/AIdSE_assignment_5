# AGENTS.md

Guidance for AI coding agents and contributors working on this
repository.

## 1. Project scope

This repository contains a **simple, frontend-only task manager web
application**.

The application should let a user create, view, update, complete, and
manage tasks in the browser.

### Scope boundaries

-   Build and maintain frontend code only.
-   Do not add a backend, API server, database, or database integration.
-   Do not introduce authentication, user accounts, analytics, or
    external services unless the project owner explicitly changes the
    scope.
-   Do not add private data, secrets, credentials, tokens, personal
    information, or real user data to the repository.
-   Use local, non-sensitive sample data only when examples or demo
    content are needed.
-   Keep implementation simple and avoid unnecessary dependencies or
    infrastructure.

## 2. Core behavior

A task may include, at minimum:

-   A title.
-   An optional description.
-   A deadline.
-   A completion state.

The interface must distinguish active tasks from finished tasks. The
exact visual design and component breakdown are project decisions;
preserve consistency with the existing application.

### Acceptance criteria

**AC1 --- Deadline validation**

-   A task deadline must be strictly after the current date and time
    when the task is created or its deadline is changed.
-   A deadline equal to or earlier than the current time must be
    rejected.
-   Show a clear validation message and do not save the invalid task.
-   Compare actual date-time values, not formatted display strings.
-   Re-evaluate the current time at the moment of validation.

**AC2 --- Finished section**

-   Marking a task as finished must move it from the active section to
    the **Finished** section.
-   The task must remain visible in the Finished section after the move.
-   The task's identity and task details must be preserved during the
    move.

**AC3 --- Task isolation**

-   Marking one task as finished must not modify any other task.
-   Other tasks must retain their completion state, title, description,
    deadline, and position/order unless an explicitly defined sorting
    rule applies.
-   Update a task by its stable unique identifier; do not update tasks
    by a shared array index, title, or object reference that could
    affect multiple items.
-   Avoid mutating shared task objects in ways that unintentionally
    change other tasks.

## 3. Implementation guidance

-   Keep the application frontend-only. Prefer in-memory state unless
    persistence is explicitly requested.
-   Do not assume that browser storage is required. If local persistence
    is later approved, store only non-sensitive task data and document
    the behavior.
-   Keep task state in one clearly defined source of truth.
-   Use a stable unique ID for each task.
-   Separate UI rendering from task state transitions and validation
    where practical.
-   Make state updates predictable and immutable where supported by the
    chosen framework.
-   Handle empty states, invalid input, and normal user interactions
    gracefully.
-   Use semantic HTML and accessible labels for controls and form
    fields.
-   Ensure the interface remains usable on common desktop and mobile
    viewport sizes.
-   Avoid adding dependencies for functionality that can be implemented
    clearly with the existing stack.

## 4. Standard coding conventions

Follow the conventions already established by the repository. If no
convention exists, use these defaults.

### General

-   Prefer clear, descriptive names over abbreviations.
-   Use consistent formatting and the repository's formatter/linter
    configuration.
-   Keep functions and components focused on one responsibility.
-   Avoid duplicated logic; extract shared behavior when it improves
    clarity.
-   Remove dead code, unused imports, and temporary debugging output.
-   Do not suppress type or lint errors without a documented reason.
-   Add comments for non-obvious decisions, not for code that is already
    self-explanatory.

### JavaScript and TypeScript

-   Prefer TypeScript when it is already part of the project; do not
    migrate languages or frameworks as part of an unrelated change.
-   Use `const` by default and `let` only when reassignment is needed.
-   Avoid `var`.
-   Prefer strict types and explicit interfaces/types for task data.
-   Avoid `any`; use `unknown` and narrow the type when necessary.
-   Use descriptive boolean names such as `isFinished` or `isValid`.
-   Do not compare date-time values as localized strings.
    Parse/construct date values and compare timestamps.
-   Keep date formatting separate from date validation and storage.

### Components and UI

-   Use the project's existing component and file naming conventions.
-   Keep components small and reusable when there is a clear reuse case.
-   Use controlled form inputs when that matches the framework's
    conventions.
-   Provide visible labels and useful validation feedback.
-   Use buttons for actions and links for navigation.
-   Ensure interactive elements can be reached and operated with a
    keyboard.
-   Do not use color alone to communicate task status or validation
    errors.

### CSS and styling

-   Follow the existing styling approach and naming convention.
-   Prefer reusable classes or design tokens over repeated inline style
    values.
-   Avoid global styles when a component-scoped style is appropriate.
-   Keep layouts responsive and avoid fixed dimensions where they cause
    overflow.
-   Preserve readable contrast and visible focus indicators.

### Tests

-   Add or update tests for changed behavior when a test setup exists.
-   Test deadline validation at the boundary: past, exactly now, and
    future.
-   Test that completing a task moves only that task to Finished.
-   Test that all other tasks remain unchanged after a completion
    action.
-   Keep tests deterministic; use a controlled/fake clock for
    time-dependent tests where available.

## 5. Privacy and security

-   Never commit secrets, API keys, access tokens, passwords, private
    keys, cookies, or credentials.
-   Never add real personal data or private user information to source
    code, fixtures, screenshots, logs, or documentation.
-   Do not create or connect databases.
-   Do not add server-side code, backend endpoints, or external data
    collection.
-   Do not expose environment variables or local machine details in the
    UI or logs.
-   If a secret or private datum is found, do not reproduce it in output
    or commit it. Report the issue without quoting the value and ask the
    project owner how to proceed.
-   Treat task content as user-provided text. Render it as text, not
    executable HTML; avoid unsafe HTML injection.

## 6. Safe commands

Only run commands that are relevant to the task and appropriate for the
detected project stack. Inspect `package.json`, lockfiles, and project
documentation before choosing package-manager commands.

### Generally safe inspection commands

``` bash
find . -maxdepth 2 -type f
git status --short
git diff --check
git diff
```

### Dependency and validation commands

Use only the package manager indicated by the repository's lockfile.
Examples:

``` bash
npm install
npm run
npm run lint
npm run test
npm run build
```

Equivalent commands may be used for the repository's actual package
manager (for example, `pnpm` or `yarn`) when its lockfile and scripts
confirm that choice.

### Command safety rules

-   Do not run destructive commands such as `rm -rf`,
    `git reset --hard`, `git clean -fd`, or broad file deletion
    commands.
-   Do not overwrite or regenerate lockfiles without a clear need.
-   Do not run deployment, publishing, database, migration, or
    production commands.
-   Do not install global packages or change machine-wide configuration.
-   Do not execute downloaded scripts or commands copied from untrusted
    sources.
-   Ask before running commands that delete files, change repository
    history, publish artifacts, access external services, or modify
    files outside the project.
-   Do not print environment variables or inspect secret files. Avoid
    commands such as `env`, `printenv`, or dumping `.env` contents.
-   Never use real credentials or private data to test the application.

## 7. File references

Use this section to record the repository's actual files. **Do not guess
paths.** Inspect the repository and replace the placeholders when the
structure is known.

  Purpose                        File or directory       Notes
  ------------------------------ ----------------------- -------
  Application entry point        `src/main.tsx`   
  Main application component     `src/App.tsx`   
  Task model/type                `src/types.ts`   
  Task list / active section     `src/App.tsx`   
  Finished section               `src/App.tsx`   
  Task creation/edit form        `src/App.tsx`   
  Deadline validation            `src/App.tsx`   
  Shared state/store             `src/App.tsx`   
  Styles / design tokens         `src/index.css`   
  Tests                          `None`   
  Build and lint configuration   `package.json, vite.config.ts`   

## 8. Definition of done

Before considering a change complete:

-   [ ] The change stays within the frontend-only scope.
-   [ ] No private data, secrets, credentials, or database code were
    added.
-   [ ] AC1 is satisfied and invalid deadlines receive clear feedback.
-   [ ] AC2 is satisfied and completed tasks appear in Finished.
-   [ ] AC3 is satisfied and completing one task leaves every other task
    unchanged.
-   [ ] Relevant tests, lint checks, and build checks pass when
    available.
-   [ ] No unrelated files or dependencies were changed.
-   [ ] Documentation and the file-reference section are updated if the
    project structure changed.

