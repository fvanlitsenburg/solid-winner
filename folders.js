let folders = [];

// Function to create a new folder
async function createFolder() {
  const folderName = document.getElementById('new-folder-name').value.trim();

  if (folderName) {
    try {
      const response = await fetch('http://localhost:3000/folders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: folderName }),
      });

      if (!response.ok) throw new Error('Failed to create folder');

      const newFolder = await response.json();
      folders.push(newFolder);

      document.getElementById('new-folder-name').value = '';
      updateFolderDropdown();
      alert(`Folder "${newFolder.name}" created successfully!`);
    } catch (error) {
      console.error('Error creating folder:', error);
      alert('Failed to create folder. Please try again.');
    }
  } else {
    alert('Please enter a folder name.');
  }
}

// Function to update the folder dropdown
function updateFolderDropdown() {
  const folderUploadSelect = document.getElementById('folder-select-upload');
  const folderSelect = document.getElementById('folder-select');


  // Check if the dropdown exists
  if (!folderUploadSelect) {
    console.error('Folder dropdown element not found');
    return;
  }

  console.log(folderSelect)

  folderUploadSelect.innerHTML = '<option value="">-- Select a Folder --</option>';

  folders.forEach((folder) => {
    const option = document.createElement('option');
    option.value = folder.id;
    option.textContent = folder.name;
    // Append the original to the first dropdown
    folderUploadSelect.appendChild(option);

    // Clone and append to the second dropdown
    const clonedOption = option.cloneNode(true);
    folderSelect.appendChild(clonedOption);
  });
}

// Function to handle folder selection
async function onFolderSelect(event) {
  const folderId = event.target.value;

  if (folderId) {
    await fetchFilesForFolder(folderId);
  } else {
    // Clear file list if no folder is selected
    document.getElementById('file-list').innerHTML = '';
  }
}

// Function to upload a file
async function uploadFile() {
  const folderId = document.getElementById('folder-select-upload').value;
  const fileInput = document.getElementById('file-input');
  const file = fileInput.files[0];

  if (folderId && file) {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folderId', folderId);

      const response = await fetch('http://localhost:3000/files', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Failed to upload file');

      const uploadedFile = await response.json();
      fileInput.value = '';
      alert(`File "${uploadedFile.name}" uploaded successfully!`);

      // Fetch updated file list
      fetchFilesForFolder(folderId);
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Failed to upload file. Please try again.');
    }
  } else {
    alert('Please select a folder and a file.');
  }
}

// Function to fetch files for a specific folder and display them in a table
async function fetchFilesForFolder(folderId) {
  try {
    const response = await fetch(`http://localhost:3000/folders/${folderId}/files`);
    if (!response.ok) throw new Error('Failed to fetch files');

    const files = await response.json();
    const fileTable = document.getElementById('file-table'); // Assuming there's a table with this ID
    const tableBody = fileTable.querySelector('tbody');
    tableBody.innerHTML = ''; // Clear previous table rows

    files.forEach((file) => {
      const tableRow = document.createElement('tr');

      // Create table cell for file name
      const nameCell = document.createElement('td');
      nameCell.textContent = file.name;
      tableRow.appendChild(nameCell);

      // Create table cell for 'describe' content
      const describeCell = document.createElement('td');
      describeCell.textContent = file.describe || 'No description available'; // Handle missing 'describe'
      tableRow.appendChild(describeCell);

      // Append row to the table body
      tableBody.appendChild(tableRow);
    });
  } catch (error) {
    console.error('Error fetching files:', error);
  }
}


// Function to fetch folders on page load
async function fetchFolders() {
  try {
    const response = await fetch('http://localhost:3000/folders');
    if (!response.ok) throw new Error('Failed to fetch folders');

    folders = await response.json();
    updateFolderDropdown();
  } catch (error) {
    console.error('Error fetching folders:', error);
  }
}

// Initialize folder data and add event listeners on page load
document.addEventListener('DOMContentLoaded', () => {
  fetchFolders();

  // Attach event listener for folder dropdown
  const folderSelect = document.getElementById('folder-select-upload');
  if (folderSelect) {
    folderSelect.addEventListener('change', onFolderSelect);
  }
});
