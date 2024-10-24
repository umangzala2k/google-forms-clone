"use strict";
class FormBuilder {
    constructor() {
        this.forms = [];
        this.currentForm = null;
        this.isEventListenersSet = false;
        this.loadForms();
        this.setupEventListeners();
        this.createNewForm();
    }
    // Set up event listeners for UI interactions
    setupEventListeners() {
        if (this.isEventListenersSet)
            return; // Avoid setting up listeners multiple times
        document.getElementById('createNewForm').addEventListener('click', () => this.createNewForm());
        document.getElementById('viewAllForms').addEventListener('click', () => this.viewAllForms());
        document.getElementById('addField').addEventListener('click', () => this.showAddFieldModal());
        document.getElementById('confirmAddField').addEventListener('click', () => this.addField());
        document.getElementById('cancelAddField').addEventListener('click', () => this.hideAddFieldModal());
        document.getElementById('formTitle').addEventListener('input', (e) => this.updateFormTitle(e.target.value));
        document.getElementById('previewForm').addEventListener('click', () => this.previewForm());
        document.getElementById('submitForm').addEventListener('click', () => this.submitForm());
        document.getElementById('saveForm').addEventListener('click', () => this.saveForm());
        this.isEventListenersSet = true; // Mark listeners as set
    }
    // Load forms from local storage
    loadForms() {
        const storedForms = localStorage.getItem('forms');
        if (storedForms) {
            this.forms = JSON.parse(storedForms);
        }
    }
    // Save forms to local storage
    saveForms() {
        localStorage.setItem('forms', JSON.stringify(this.forms));
    }
    // Create a new form with default values
    createNewForm() {
        this.currentForm = {
            id: Date.now().toString(),
            title: 'Untitled form',
            fields: []
        };
        this.renderFormBuilder();
    }
    // View all saved forms and render them in the UI
    viewAllForms() {
        const savedForms = document.getElementById('savedForms');
        savedForms.innerHTML = '';
        this.forms.forEach(form => {
            const li = document.createElement('li');
            li.innerHTML = `
                <span class="form-title" role="button" tabindex="0">${form.title}</span>
                <button class="btn btn-view" data-id="${form.id}">View as End User</button>
                <button class="btn btn-delete" data-id="${form.id}">Delete</button>
            `;
            const titleSpan = li.querySelector('.form-title');
            titleSpan.addEventListener('click', () => this.loadForm(form.id));
            titleSpan.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.loadForm(form.id);
                }
            });
            const viewButton = li.querySelector('.btn-view');
            viewButton.addEventListener('click', () => this.viewFormAsEndUser(form.id));
            const deleteButton = li.querySelector('.btn-delete');
            deleteButton.addEventListener('click', (e) => {
                e.stopPropagation();
                this.deleteForm(form.id);
            });
            savedForms.appendChild(li);
        });
        this.showSection('formList');
    }
    // Load a specific form by ID and render it
    loadForm(formId) {
        this.currentForm = this.forms.find(form => form.id === formId) || null;
        if (this.currentForm) {
            this.renderFormBuilder();
        }
    }
    // Delete a form by ID after user confirmation
    deleteForm(formId) {
        const confirmDelete = confirm('Are you sure you want to delete this form?');
        if (confirmDelete) {
            this.forms = this.forms.filter(form => form.id !== formId);
            this.saveForms();
            this.viewAllForms();
        }
    }
    // Show the modal to add a new field
    showAddFieldModal() {
        const modal = document.getElementById('fieldTypeModal');
        modal.style.display = 'block';
        document.getElementById('fieldType').focus();
    }
    // Hide the modal for adding a new field
    hideAddFieldModal() {
        const modal = document.getElementById('fieldTypeModal');
        modal.style.display = 'none';
    }
    // Add a new field to the current form
    addField() {
        if (!this.currentForm)
            return;
        const typeSelect = document.getElementById('fieldType');
        const labelInput = document.getElementById('fieldLabel');
        const type = typeSelect.value;
        const label = labelInput.value.trim();
        if (!label) {
            alert('Please enter a question');
            return;
        }
        const field = { type, label, required: true };
        if (type === 'radio' || type === 'checkbox') {
            field.options = ['Option 1']; // Initialize with a default option
        }
        this.currentForm.fields.push(field);
        this.renderFormBuilder();
        this.hideAddFieldModal();
        // Clear the input field after adding the field
        labelInput.value = '';
    }
    // Update the form title
    updateFormTitle(title) {
        if (this.currentForm) {
            this.currentForm.title = title;
        }
    }
    // Render the form builder UI
    renderFormBuilder() {
        if (!this.currentForm)
            return;
        const formTitle = document.getElementById('formTitle');
        formTitle.value = this.currentForm.title;
        const formFields = document.getElementById('formFields');
        formFields.innerHTML = '';
        this.currentForm.fields.forEach((field, index) => {
            const fieldElement = document.createElement('div');
            fieldElement.className = 'field';
            fieldElement.innerHTML = `
                <div class="field-header">
                    <input type="text" value="${field.label}" placeholder="Question" class="field-label" aria-label="Question label">
                    <div class="field-actions">
                        <label class="required-label">
                            <input type="checkbox" class="required-checkbox" ${field.required ? 'checked' : ''}>
                            <span>Required</span>
                        </label>
                        <button class="editField" data-index="${index}" aria-label="Edit field"><i class="fas fa-edit"></i></button>
                        <button class="deleteField" data-index="${index}" aria-label="Delete field"><i class="fas fa-trash"></i></button>
                    </div>
                </div>
                ${this.renderFieldInput(field, index)}
            `;
            formFields.appendChild(fieldElement);
        });
        this.setupEventListeners();
        this.setupOptionEventListeners(); // Ensure option event listeners are set up
        this.showSection('formBuilder');
    }
    // Render the input for a field in the form builder
    renderFieldInput(field, index) {
        if (field.type === 'radio' || field.type === 'checkbox') {
            return `
                <div class="options-container">
                    ${field.options.map((option, i) => `
                        <div class="option">
                            <input type="${field.type}" name="${field.label}" value="${option}" disabled>
                            <input type="text" value="${option}" class="option-text" data-field-index="${index}" data-option-index="${i}">
                            <button class="delete-option" data-field-index="${index}" data-option-index="${i}"><i class="fas fa-trash"></i></button>
                        </div>
                    `).join('')}
                    <button class="add-option" data-field-index="${index}">Add Option</button>
                </div>
            `;
        }
        return `<input type="${field.type}" name="${field.label}" disabled>`;
    }
    // Submit the form and hide the submit button
    submitForm() {
        if (!this.currentForm) {
            console.error('No current form available for submission');
            return;
        }
        const form = document.getElementById('previewForm');
        if (!form) {
            console.error('Preview form not found');
            return;
        }
        let isValid = true;
        this.currentForm.fields.forEach(field => {
            const element = form.querySelector(`[name="${field.label}"]`);
            if (field.required && (!element || !element.value.trim())) {
                isValid = false;
            }
        });
        if (!isValid) {
            alert('Please fill out all required fields.');
            return;
        }
        // Collect form data
        const formData = {};
        this.currentForm.fields.forEach(field => {
            const element = form.querySelector(`[name="${field.label}"]`);
            if (element) {
                formData[field.label] = element.value;
            }
        });
        const formResponse = {
            id: Date.now().toString(),
            formId: this.currentForm.id,
            data: formData,
            timestamp: Date.now()
        };
        this.saveFormResponse(formResponse);
        this.showAcknowledgment();
        // Hide the submit button
        const submitButton = document.getElementById('submitForm');
        if (submitButton) {
            submitButton.style.display = 'none';
        }
    }
    // Save form response to local storage
    saveFormResponse(response) {
        const responses = JSON.parse(localStorage.getItem(`responses_${response.formId}`) || '[]');
        responses.push(response);
        localStorage.setItem(`responses_${response.formId}`, JSON.stringify(responses));
    }
    // Show acknowledgment after form submission
    showAcknowledgment() {
        const acknowledgment = document.createElement('div');
        acknowledgment.className = 'acknowledgment';
        acknowledgment.innerHTML = `
            <h2>Thank you for your submission!</h2>
            <p>Your response has been recorded.</p>
            <button id="backToForm" class="btn btn-primary">Back to Form</button>
        `;
        const previewContent = document.getElementById('previewContent');
        previewContent.innerHTML = '';
        previewContent.appendChild(acknowledgment);
        document.getElementById('backToForm').addEventListener('click', () => {
            this.previewForm();
        });
    }
    // Save the current form
    saveForm() {
        if (!this.currentForm)
            return;
        if (this.currentForm.fields.length === 0) {
            alert('Please add at least one question to the form before saving.');
            return;
        }
        const existingFormIndex = this.forms.findIndex(form => form.id === this.currentForm.id);
        if (existingFormIndex !== -1) {
            this.forms[existingFormIndex] = this.currentForm;
        }
        else {
            this.forms.push(this.currentForm);
        }
        this.saveForms();
        alert('Form saved successfully');
        // Show the view all forms view
        this.viewAllForms();
    }
    // Render responses for the current form
    renderResponses() {
        if (!this.currentForm)
            return;
        const responsesContent = document.getElementById('responsesContent');
        responsesContent.innerHTML = '';
        const responses = JSON.parse(localStorage.getItem(`responses_${this.currentForm.id}`) || '[]');
        if (responses.length === 0) {
            responsesContent.innerHTML = '<p>No responses yet.</p>';
        }
        else {
            const table = document.createElement('table');
            table.setAttribute('role', 'table');
            table.setAttribute('aria-label', 'Form Responses');
            const headerRow = table.insertRow();
            headerRow.setAttribute('role', 'row');
            // Add timestamp column
            const timestampHeader = document.createElement('th');
            timestampHeader.textContent = 'Timestamp';
            timestampHeader.setAttribute('role', 'columnheader');
            headerRow.appendChild(timestampHeader);
            this.currentForm.fields.forEach(field => {
                const th = document.createElement('th');
                th.textContent = field.label;
                th.setAttribute('role', 'columnheader');
                headerRow.appendChild(th);
            });
            responses.forEach((response) => {
                const row = table.insertRow();
                row.setAttribute('role', 'row');
                // Add timestamp cell
                const timestampCell = row.insertCell();
                timestampCell.setAttribute('role', 'cell');
                timestampCell.textContent = new Date(response.timestamp).toLocaleString();
                this.currentForm.fields.forEach(field => {
                    const cell = row.insertCell();
                    cell.setAttribute('role', 'cell');
                    const value = response.data[field.label];
                    cell.textContent = Array.isArray(value) ? value.join(', ') : value;
                });
            });
            responsesContent.appendChild(table);
        }
        this.showSection('formResponses');
    }
    // Show a specific section of the UI
    showSection(sectionId) {
        const sections = ['formBuilder', 'formList', 'formPreview', 'formResponses', 'formInteractive'];
        sections.forEach(id => {
            const element = document.getElementById(id);
            element.style.display = id === sectionId ? 'block' : 'none';
        });
    }
    // Preview the form by rendering it in a read-only format
    previewForm() {
        if (!this.currentForm) {
            console.error('No current form available for preview');
            return;
        }
        const previewContent = document.getElementById('previewContent');
        previewContent.innerHTML = '';
        this.currentForm.fields.forEach((field, index) => {
            const fieldHtml = this.renderPreviewFieldInput(field, index);
            const fieldContainer = document.createElement('div');
            fieldContainer.className = 'preview-field';
            fieldContainer.innerHTML = `
                <label>${field.label}</label>
                ${fieldHtml}
            `;
            previewContent.appendChild(fieldContainer);
        });
        // Add a back button to return to form creation
        const backButton = document.createElement('button');
        backButton.id = 'backToFormCreation';
        backButton.className = 'btn btn-secondary';
        backButton.textContent = 'Back to Form Creation';
        backButton.addEventListener('click', () => this.showSection('formBuilder'));
        previewContent.appendChild(backButton);
        // Hide the submit button during form creation preview
        const submitButton = document.getElementById('submitForm');
        if (submitButton) {
            submitButton.style.display = 'none';
        }
        this.showSection('formPreview');
    }
    // Render the input for a field in the form preview
    renderPreviewFieldInput(field, index) {
        if (field.type === 'radio' || field.type === 'checkbox') {
            return `
                <div class="options-container">
                    ${field.options.map(option => `
                        <div class="option">
                            <input type="${field.type}" name="${field.label}" value="${option}" disabled>
                            <label>${option}</label>
                        </div>
                    `).join('')}
                </div>
            `;
        }
        return `<input type="${field.type}" name="${field.label}" disabled>`;
    }
    // Add event listeners for adding and deleting options
    setupOptionEventListeners() {
        document.querySelectorAll('.add-option').forEach(button => {
            button.addEventListener('click', (e) => {
                const fieldIndex = parseInt(e.target.getAttribute('data-field-index'), 10);
                this.addOption(fieldIndex);
            });
        });
        document.querySelectorAll('.delete-option').forEach(button => {
            button.addEventListener('click', (e) => {
                const fieldIndex = parseInt(e.target.getAttribute('data-field-index'), 10);
                const optionIndex = parseInt(e.target.getAttribute('data-option-index'), 10);
                this.deleteOption(fieldIndex, optionIndex);
            });
        });
    }
    addOption(fieldIndex) {
        const field = this.currentForm.fields[fieldIndex];
        field.options.push(`Option ${field.options.length + 1}`);
        this.renderFormBuilder();
    }
    deleteOption(fieldIndex, optionIndex) {
        const field = this.currentForm.fields[fieldIndex];
        field.options.splice(optionIndex, 1);
        this.renderFormBuilder();
    }
    // View the form as an end user
    viewFormAsEndUser(formId) {
        this.currentForm = this.forms.find(form => form.id === formId) || null;
        if (!this.currentForm) {
            console.error('Form not found');
            return;
        }
        const interactiveContent = document.getElementById('interactiveContent');
        interactiveContent.innerHTML = ''; // Clear previous content
        this.currentForm.fields.forEach((field, index) => {
            const fieldHtml = this.renderInteractiveFieldInput(field, index);
            const fieldContainer = document.createElement('div');
            fieldContainer.className = 'interactive-field';
            fieldContainer.innerHTML = `
                <label>${field.label}${field.required ? ' *' : ''}</label>
                ${fieldHtml}
            `;
            interactiveContent.appendChild(fieldContainer);
        });
        // Add a submit button for the interactive form
        const submitButton = document.createElement('button');
        submitButton.className = 'btn btn-primary';
        submitButton.textContent = 'Submit';
        submitButton.addEventListener('click', () => this.submitInteractiveForm());
        interactiveContent.appendChild(submitButton);
        this.showSection('formInteractive'); // Show the interactive form section
    }
    // Render the input for a field in the interactive form
    renderInteractiveFieldInput(field, index) {
        if (field.type === 'radio' || field.type === 'checkbox') {
            return `
                <div class="options-container">
                    ${field.options.map(option => `
                        <div class="option">
                            <input type="${field.type}" name="${field.label}" value="${option}">
                            <label>${option}</label>
                        </div>
                    `).join('')}
                </div>
            `;
        }
        return `<input type="${field.type}" name="${field.label}" ${field.required ? 'required' : ''}>`;
    }
    // Handle submission of the interactive form
    submitInteractiveForm() {
        if (!this.currentForm)
            return;
        const form = document.getElementById('interactiveContent');
        let isValid = true;
        const formData = {};
        this.currentForm.fields.forEach(field => {
            var _a;
            const elements = form.querySelectorAll(`[name="${field.label}"]`);
            if (field.type === 'radio' || field.type === 'checkbox') {
                const selectedOptions = Array.from(elements).filter(el => el.checked).map(el => el.value);
                if (field.required && selectedOptions.length === 0) {
                    isValid = false;
                }
                formData[field.label] = selectedOptions;
            }
            else {
                const value = ((_a = elements[0]) === null || _a === void 0 ? void 0 : _a.value.trim()) || '';
                if (field.required && !value) {
                    isValid = false;
                }
                formData[field.label] = value;
            }
        });
        if (!isValid) {
            alert('Please fill out all required fields.');
            return;
        }
        alert('Form submitted successfully!');
        this.showSection('formList');
    }
}
new FormBuilder();
