let forms = [];


  async function createForm() {
    const formName = document.getElementById('new-form-name').value.trim();
    
    if (formName) {
      try {
        // Send form name to the backend to create a new form
        const response = await fetch('http://localhost:3000/forms', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: formName })
        });
  
        if (!response.ok) {
          throw new Error('Failed to create form');
        }
  
        const newForm = await response.json(); // Get the form with the generated ID
        forms.push({ id: newForm.id, name: newForm.name, questions: [] });
  
        document.getElementById('new-form-name').value = '';
        updateFormList();
        updateFormSelect();
  
        alert(`Form "${newForm.name}" created successfully!`);
      } catch (error) {
        console.error('Error creating form:', error);
        alert('Failed to create form. Please try again.');
      }
    } else {
      alert('Please enter a form name.');
    }
  }
  
  
  
  

  function populateForms(forms) {
    const formList = document.getElementById("form-list");
    formList.innerHTML = ""; // Clear existing forms
  
    forms.forEach((form) => {
      const formItem = document.createElement("li");
      formItem.classList.add("form-item");
  
      formItem.innerHTML = `
        <h3>${form.name}</h3>
        <button onclick="editForm(this, '${form.id}')" class="button">Edit Form</button>
        <button onclick="deleteForm('${form.id}')" class="delete-btn">Delete Form</button>
        <div class="question-container" style="display: none;" id="form-${form.id}"></div>
      `;

  
      formList.appendChild(formItem);
    });
  }
  
  
 // Is this needed?
 function updateFormList() {
  const formList = document.getElementById('form-list');
  formList.innerHTML = ''; // Clear the list

  forms.forEach((form) => {
    const li = document.createElement('li');
    li.innerHTML = `
    <h3>${form.name}</h3>
    <button onclick="editForm(this, '${form.id}')" class="button">Edit Form</button>
    <button onclick="deleteForm('${form.id}')" class="delete-btn">Delete Form</button>
    <div class="question-container" style="display: none;" id="form-${form.id}"></div>
  `;
    formList.appendChild(li);
  });
}




  function toggleQuestions(index) {
    const form = forms[index];
  }

  function updateFormSelect() {
    const formSelect = document.getElementById('form-select');
    formSelect.innerHTML = '<option value="">-- Select a Form --</option>';
    forms.forEach((form, index) => {
      const option = document.createElement('option');
      option.value = index;
      option.textContent = form.name;
      formSelect.appendChild(option);
    });
  }

  function editForm(button, formId) {
    const formItem = button.closest("li");
    const questionContainer = formItem.querySelector(".question-container");
  
    if (!questionContainer) {
      console.error("Question container not found.");
      return;
    }
  
    if (button.textContent === "Edit Form") {
      const formIndex = forms.findIndex(form => form.id === formId);
  
      // Toggle to show the container and load questions
      questionContainer.style.display = "block";
  
      if (forms[formIndex].unsaved) {
        questionContainer.innerHTML = `
        <p>No questions added yet. Add some questions below.</p>
        <button class="add-btn" onclick="addNewRow('${formId}')">+ Add Row</button>
      `;
      } else {
        fetchQuestionsForForm(formId, questionContainer); // Load questions from DB
      }
  
      button.textContent = "Close";
    } else {
      // Close the form and clear the container
      button.textContent = "Edit Form";
      questionContainer.style.display = "none";
      questionContainer.innerHTML = "";
    }
  }
  

  function deleteForm(formId) {
    if (!confirm("Are you sure you want to delete this form?")) return;
  
    fetch(`http://localhost:3000/forms/${formId}`, {
      method: 'DELETE',
    })
      .then(response => {
        if (!response.ok) throw new Error("Failed to delete form.");
        alert("Form deleted successfully!");
  
        // Remove from the forms array and update UI
        forms = forms.filter(form => form.id !== formId);
        updateFormList();
      })
      .catch(error => console.error("Error deleting form:", error));
  }
  
  
  async function fetchQuestionsForForm(formId, container) {
    try {
      const response = await fetch(`http://localhost:3000/forms/${formId}/questions`);
      const questions = await response.json();
  
      if (questions.length === 0) {
        console.log('heya')
        container.innerHTML = `
        <p>No questions added yet. Add some questions below.</p>
        <button class="add-btn" onclick="addNewRow('${formId}')">+ Add Row</button>
      `;
      } else {
        container.innerHTML = `
          <table id="question-table-${formId}" class="question-table">
            <thead>
              <tr>
                <th>Question</th>
                <th>Query</th>
                <th>Prompt</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              ${questions.map(q => `
                <tr data-id="${q.id}">
                  <td>${q.question}</td>
                  <td>${q.query || q.question}</td>
                  <td>${q.prompt || q.question}</td>
                  <td>
                    <button class="edit-btn" onclick="editRow('${formId}', this)">Edit</button>
                    <button class="delete-btn" onclick="deleteRow(this)">Delete</button>
                  </td>
                </tr>
              `).join("")}
            </tbody>
          </table>
          <button class="add-btn" onclick="addNewRow('${formId}')">+ Add Row</button>
        `;
      }
    } catch (error) {
      console.error("Error fetching questions:", error);
    }
  }
  
 
  

  function updateQuestion(formIndex, questionIndex, element) {
    const newValue = element.textContent.trim();
    if (newValue) {
      forms[formIndex].questions[questionIndex] = newValue;
    }
  }

  function addNewRow(formId) {
    let tableBody = document.querySelector(`#question-table-${formId} tbody`);
  
    // If table doesn't exist, create it inside the right container
    if (!tableBody) {
      console.log('Creating a new table for form:', formId);
  
      // Select the specific question-container tied to this formId
      const container = document.getElementById(`form-${formId}`);
      if (!container) {
        console.error(`Container for form ${formId} not found!`);
        return; // Prevent further execution if container is missing
      }
  
      container.innerHTML = `
        <table id="question-table-${formId}" class="question-table">
          <thead>
            <tr>
              <th>Question</th>
              <th>Query</th>
              <th>Prompt</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody></tbody>
        </table>
      `;
      tableBody = document.querySelector(`#question-table-${formId} tbody`);
    }
  
    // Create and append a new row with input fields
    const newRow = document.createElement("tr");
    newRow.innerHTML = `
      <td><input type="text" placeholder="Enter Question"></td>
      <td><input type="text" placeholder="Enter Query"></td>
      <td><input type="text" placeholder="Enter Prompt"></td>
      <td>
        <button class="save-btn" onclick="saveRow('${formId}', this)">Save</button>
      </td>
    `;
  
    tableBody.appendChild(newRow);
    console.log('New row added:', newRow);
  }
  
  function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }
    
  

  function editRow(formId, button) {
    const row = button.closest("tr");
    const cells = row.querySelectorAll("td");
  
    cells[0].innerHTML = `<input type="text" value="${cells[0].textContent.trim()}">`;
    cells[1].innerHTML = `<input type="text" value="${cells[1].textContent.trim()}">`;
    cells[2].innerHTML = `<input type="text" value="${cells[2].textContent.trim()}">`;
  
    button.textContent = "Save";
    button.classList.remove("edit-btn");
    button.classList.add("save-btn");
    button.onclick = () => saveRow(formId, button); // Pass formId here
  }
  
  
  function saveRow(formId, button) {
    const row = button.closest("tr");
    const inputs = row.querySelectorAll("input");
    const question = inputs[0].value.trim();
    const query = inputs[1].value.trim() || question;
    const prompt = inputs[2].value.trim() || question;
  
    if (!question) {
      alert("Please enter a question.");
      return;
    }
  
    fetch(`http://localhost:3000/forms/${formId}/questions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question, query, prompt }),
    })
      .then(response => response.json())
      .then(data => {
        alert('Question saved successfully!');
  
        // Update the row with static content after saving
        row.innerHTML = `
          <td>${data.question}</td>
          <td>${data.query}</td>
          <td>${data.prompt}</td>
          <td>
            <button class="edit-btn" onclick="editRow('${formId}', this)">Edit</button>
            <button class="delete-btn" onclick="deleteRow(this)">Delete</button>
          </td>
        `;
      })
      .catch(error => console.error('Error saving question:', error));
  }
  
  
  
  

  function saveNewQuestion(formIndex, element) {
    const question = element.textContent.trim();
    if (question) {
      forms[formIndex].questions.push(question);
    }
  }

  function deleteRow(button) {
    const row = button.closest("tr");
    const questionId = row.dataset.id;
  
    fetch(`http://localhost:3000/forms/questions/${questionId}`, {
      method: 'DELETE',
    })
      .then(response => {
        if (!response.ok) throw new Error("Failed to delete question.");
        row.remove();
      })
      .catch(error => console.error("Error deleting question:", error));
  }
  

  async function fetchForms() {
    try {
      const response = await fetch("http://localhost:3000/forms");
      const fetchedForms = await response.json();
  
      // Merge fetched forms with unsaved forms
      forms = [
        ...fetchedForms,
        ...forms.filter(form => form.unsaved) // Keep unsaved forms
      ];
  
      populateForms(forms); // Re-render the UI
      updateFormSelect();
    } catch (error) {
      console.error("Error fetching forms:", error);
    }
  }
  
  
  function saveForm(formName, formIndex) {
    return fetch('http://localhost:3000/forms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: formName }),
    })
      .then(response => response.json())
      .then(data => {
        forms[formIndex].id = data.id; // Update the form ID in the list
        alert(`Form "${data.name}" saved successfully!`);
        updateFormList();
        return data.id;
      })
      .catch(error => {
        console.error('Error saving form:', error);
        throw error;
      });
  }
  
  
  
  function saveQuestionToForm(formId, question, query, prompt, row) {
    fetch(`http://localhost:3000/forms/${formId}/questions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question, query, prompt }),
    })
      .then(response => response.json())
      .then(data => {
        alert('Question added successfully!');
        row.innerHTML = `
          <td>${question}</td>
          <td>${query}</td>
          <td>${prompt}</td>
          <td>
            <button class="edit-btn" onclick="editRow('${formId}', this)">Edit</button>
            <button class="delete-btn" onclick="deleteRow(this)">Delete</button>
          </td>
        `;
      })
      .catch(error => console.error('Error saving question:', error));
  }
  

    // Fetch forms on page load
    fetchForms();