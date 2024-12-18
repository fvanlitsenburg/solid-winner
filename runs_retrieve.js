async function runForm() {
    const formUuid = document.getElementById('form-select').value;
    const folderUuid = document.getElementById('folder-select').value;
    const runUuid = generateUUID(); // Assuming you have this utility function

    if (!formUuid || !folderUuid) {
        alert("Please select both form and folder.");
        return;
    }

    // Construct the URL with query parameters
    const url = `http://localhost:8001/rag_on_form?form_uuid=${encodeURIComponent(formUuid)}&folder_uuid=${encodeURIComponent(folderUuid)}&run_uuid=${encodeURIComponent(runUuid)}`;

    console.log("Sending request to URL:", url);

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'accept': 'application/json' },
        });

        if (!response.ok) {
            const error = await response.json();
            console.error('Server responded with error:', error);
            alert(`Failed: ${error.detail || 'Unknown error'}`);
            return;
        }

        const result = await response.json();
        console.log('Success:', result);
        alert('Request was successful!');
        fetchLatestRun(runUuid);
    } catch (error) {
        console.error('Error sending request:', error);
        alert('Failed to send request. Check the console for more details.');
    }
}

// Function to generate a run UUID (you could replace it with a better approach if needed)
function generateRunUuid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  
  // Fetch the latest run result and display it in the UI
  async function fetchLatestRun(runUuid) {
    try {
      // Fetch the latest run output from the server
      const response = await fetch(`http://localhost:3000/runs/get-latest-run?run_uuid=${runUuid}`);
      const result = await response.json();
  
      if (response.ok && result) {
        // Display the output of the latest run
        const outputContainer = document.getElementById('latest-run-output');
        if (result.answers) {
          outputContainer.innerHTML = `
            <h3>Answers:</h3>
            <pre>${JSON.stringify(result.answers, null, 2)}</pre>
          `;
        } else {
          outputContainer.innerHTML = '<p>No answers found for the latest run.</p>';
        }
      } else {
        // Handle errors or no result
        document.getElementById('latest-run-output').innerHTML = '<p>No results found for this form and folder.</p>';
      }
    } catch (error) {
      console.error('Error fetching latest run:', error);
      document.getElementById('latest-run-output').innerHTML = '<p>Failed to fetch the latest run results.</p>';
    }
  }
  
  fetchLatestRun("4abc4b91-7513-4712-a539-b4d6b8d07774");