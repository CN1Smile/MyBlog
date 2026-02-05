## ADDED Requirements

### Requirement: Post Management Page
The system SHALL provide a dedicated post management page (`posts.html`) for managing all published posts.

#### Scenario: Access management page
- **WHEN** user navigates to `posts.html`
- **THEN** display password verification overlay
- **AND** after correct password, show post list

#### Scenario: Display post list
- **WHEN** user is authenticated
- **THEN** display all posts in a table/card format
- **AND** show title, date, category for each post
- **AND** show action buttons: edit, delete, move up, move down

### Requirement: Single Post Delete
The system SHALL allow deleting a single post with confirmation.

#### Scenario: Delete single post
- **WHEN** user clicks delete button on a post
- **THEN** display confirmation dialog
- **AND** if confirmed, remove post from `posts.json`
- **AND** push changes to GitHub
- **AND** show success message

### Requirement: Edit Existing Post
The system SHALL allow editing an existing post by loading it into the editor.

#### Scenario: Edit post
- **WHEN** user clicks edit button on a post
- **THEN** redirect to `editor.html?slug=xxx`
- **AND** editor loads the post data
- **AND** on publish, update the existing post instead of creating new

### Requirement: Reorder Posts
The system SHALL allow reordering posts using up/down buttons.

#### Scenario: Move post up
- **WHEN** user clicks move up button
- **THEN** swap post with the one above it
- **AND** save new order to GitHub

#### Scenario: Move post down
- **WHEN** user clicks move down button
- **THEN** swap post with the one below it
- **AND** save new order to GitHub

### Requirement: Batch Delete
The system SHALL support batch selection and deletion of multiple posts.

#### Scenario: Batch delete posts
- **WHEN** user selects multiple posts via checkboxes
- **AND** clicks batch delete button
- **THEN** display confirmation with count
- **AND** if confirmed, remove all selected posts
- **AND** push changes to GitHub
