# Form Builder Application

This application is a form builder tool developed using TypeScript. It allows users to create, manage, and interact with forms through a web interface. The application demonstrates proficiency in TypeScript, object-oriented programming, and browser storage handling.

## Features

- **Form Creation**: Users can create new forms with various field types such as text, textarea, radio, and checkbox.
- **Form Management**: Save, view, and delete forms. Forms are persisted using the browser's local storage.
- **Field Management**: Add, edit, and delete fields within a form. Options can be added to radio and checkbox fields.
- **Form Preview**: Preview forms in a read-only format before submission.
- **Form Submission**: Submit forms and store responses in local storage. View submitted responses with timestamps.
- **Interactive Form View**: View forms as an end user and submit responses.

## Getting Started

### Prerequisites

- Node.js and npm should be installed on your machine.
- TypeScript should be installed globally. You can install it using npm:

  ```bash
  npm install -g typescript
  ```

### Steps to Compile TypeScript to JavaScript

1. **Navigate to the Project Directory**: Open your terminal and navigate to the directory where your `app.ts` file is located.

   ```bash
   cd path/to/your/project
   ```

2. **Compile TypeScript to JavaScript**: Use the TypeScript compiler (`tsc`) to compile `app.ts` into `app.js`.

   ```bash
   tsc app.ts
   ```

   This command will generate an `app.js` file in the same directory.

3. **Include the JavaScript File in Your HTML**: Ensure that your HTML file includes the compiled `app.js` file.

   ```html
   <script src="app.js"></script>
   ```

### Running the Application

- Open the HTML file in a web browser to interact with the form builder application.
- Use the UI to create, manage, and submit forms.

## Notes

- The application uses local storage to persist forms and responses, so data will remain available even after refreshing the page.
- Ensure that your browser allows local storage for the application to function correctly.
- The application is designed to be a single-page application, with dynamic updates to the UI based on user interactions.
