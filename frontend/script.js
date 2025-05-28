// DOM elements
const fileInput = document.getElementById('fileInput');
const fileName = document.getElementById('fileName');
const uploadBtn = document.getElementById('uploadBtn');
const statusMessage = document.getElementById('status');
const outputSection = document.getElementById('output');
const plotlyContainer = document.getElementById('plotly-container');
const fileInfoContainer = document.getElementById('file-info-container');

// State management
let selectedFile = null;
let currentFileData = null;

// Initialize event listeners
document.addEventListener('DOMContentLoaded', function() {
    initializeEventListeners();
});

function initializeEventListeners() {
    // File input change event
    fileInput.addEventListener('change', handleFileSelection);
    
    // Upload button click event
    uploadBtn.addEventListener('click', handleUpload);
    
    // Drag and drop functionality
    const fileLabel = document.querySelector('.file-label');
    fileLabel.addEventListener('dragover', handleDragOver);
    fileLabel.addEventListener('drop', handleDrop);
    fileLabel.addEventListener('dragleave', handleDragLeave);
}

function handleFileSelection(event) {
    const file = event.target.files[0];
    
    if (file) {
        validateAndSetFile(file);
    } else {
        resetFileSelection();
    }
}

function validateAndSetFile(file) {
    // Validate file type
    const allowedTypes = ['text/csv', 'application/json'];
    const fileExtension = file.name.split('.').pop().toLowerCase();
    const allowedExtensions = ['csv', 'json'];
    
    if (!allowedTypes.includes(file.type) && !allowedExtensions.includes(fileExtension)) {
        showStatus('Please select a valid CSV or JSON file.', 'error');
        resetFileSelection();
        return;
    }
    
    // Calculate and display file size (no size limit)
    const fileSize = calculateFileSize(file.size);
    
    // Set the selected file
    selectedFile = file;
    fileName.textContent = `${file.name} (${fileSize})`;
    fileName.classList.add('selected');
    uploadBtn.disabled = false;
    
    showStatus(`File "${file.name}" (${fileSize}) selected successfully!`, 'success');
}

function resetFileSelection() {
    selectedFile = null;
    currentFileData = null;
    fileName.textContent = 'No file selected';
    fileName.classList.remove('selected');
    uploadBtn.disabled = true;
    fileInput.value = '';
    
    // Clear output containers
    plotlyContainer.classList.remove('active');
    fileInfoContainer.classList.remove('active');
    plotlyContainer.innerHTML = '';
    fileInfoContainer.innerHTML = '';
}

function handleUpload() {
    if (!selectedFile) {
        showStatus('Please select a file first.', 'error');
        return;
    }
    
    // Show upload progress
    uploadBtn.disabled = true;
    uploadBtn.textContent = 'Uploading...';
    showStatus('Uploading file...', 'info');
    
    // Simulate upload process (replace with actual Flask integration later)
    simulateUpload();
}

function simulateUpload() {
    // This function simulates the upload process and demonstrates Plotly integration
    // Replace this with actual Flask/FastAPI integration later
    
    setTimeout(() => {
        try {
            // Simulate successful upload
            showStatus(`File "${selectedFile.name}" uploaded successfully!`, 'success');
            
            // Read and process the file for demo purposes
            readAndProcessFile(selectedFile);
            
            // Reset upload button
            uploadBtn.disabled = false;
            uploadBtn.textContent = 'Upload';
            
        } catch (error) {
            showStatus('Upload failed. Please try again.', 'error');
            uploadBtn.disabled = false;
            uploadBtn.textContent = 'Upload';
        }
    }, 1500);
}

function displayFileInfo(file) {
    const fileSize = calculateFileSize(file.size);
    const fileInfo = `
        <div class="file-info">
            <h3>File Information</h3>
            <p><strong>Name:</strong> ${file.name}</p>
            <p><strong>Size:</strong> ${fileSize}</p>
            <p><strong>Size in Bytes:</strong> ${file.size.toLocaleString()}</p>
            <p><strong>Type:</strong> ${file.type || 'Unknown'}</p>
            <p><strong>Last Modified:</strong> ${new Date(file.lastModified).toLocaleString()}</p>
        </div>
    `;
    
    fileInfoContainer.innerHTML = fileInfo;
    fileInfoContainer.classList.add('active');
}

// File reading and processing functions
function readAndProcessFile(file) {
    const reader = new FileReader();
    
    reader.onload = function(e) {
        try {
            const content = e.target.result;
            
            if (file.name.endsWith('.csv')) {
                processCSVData(content, file);
            } else if (file.name.endsWith('.json')) {
                processJSONData(content, file);
            }
            
            // Display file info
            displayFileInfo(file);
            
        } catch (error) {
            showStatus('Error processing file: ' + error.message, 'error');
        }
    };
    
    reader.onerror = function() {
        showStatus('Error reading file', 'error');
    };
    
    reader.readAsText(file);
}

function processCSVData(csvContent, file) {
    // Parse CSV content (simple parsing for demo)
    const lines = csvContent.split('\n').filter(line => line.trim());
    const headers = lines[0].split(',').map(h => h.trim());
    const data = lines.slice(1).map(line => line.split(',').map(cell => cell.trim()));
    
    currentFileData = {
        type: 'csv',
        headers: headers,
        data: data,
        filename: file.name
    };
    
    // Create sample visualizations
    createCSVVisualizations(headers, data);
}

function processJSONData(jsonContent, file) {
    try {
        const jsonData = JSON.parse(jsonContent);
        
        currentFileData = {
            type: 'json',
            data: jsonData,
            filename: file.name
        };
        
        // Create sample visualizations
        createJSONVisualizations(jsonData);
        
    } catch (error) {
        showStatus('Invalid JSON format', 'error');
    }
}

function createCSVVisualizations(headers, data) {
    plotlyContainer.classList.add('active');
    
    // Create multiple chart divs
    plotlyContainer.innerHTML = `
        <div id="chart1" style="height: 400px; margin-bottom: 20px;"></div>
        <div id="chart2" style="height: 400px; margin-bottom: 20px;"></div>
        <div id="chart3" style="height: 400px;"></div>
    `;
    
    // Sample data for demonstration
    createSampleBarChart();
    createSampleLineChart();
    createSampleScatterPlot();
}

function createJSONVisualizations(jsonData) {
    plotlyContainer.classList.add('active');
    
    // Analyze JSON structure
    const keys = Object.keys(jsonData);
    const isArray = Array.isArray(jsonData);
    
    plotlyContainer.innerHTML = `
        <div id="json-chart1" style="height: 400px; margin-bottom: 20px;"></div>
        <div id="json-chart2" style="height: 400px;"></div>
    `;
    
    if (isArray && jsonData.length > 0) {
        createJSONArrayVisualizations(jsonData);
    } else {
        createJSONObjectVisualizations(jsonData, keys);
    }
}

// Plotly chart creation functions
function createSampleBarChart() {
    const trace = {
        x: ['Category A', 'Category B', 'Category C', 'Category D', 'Category E'],
        y: [20, 14, 23, 25, 22],
        type: 'bar',
        marker: {
            color: ['#3498db', '#e74c3c', '#2ecc71', '#f39c12', '#9b59b6']
        }
    };
    
    const layout = {
        title: 'Sample Bar Chart',
        xaxis: { title: 'Categories' },
        yaxis: { title: 'Values' },
        plot_bgcolor: 'rgba(0,0,0,0)',
        paper_bgcolor: 'rgba(0,0,0,0)'
    };
    
    Plotly.newPlot('chart1', [trace], layout, {responsive: true});
}

function createSampleLineChart() {
    const trace = {
        x: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
        y: [10, 15, 13, 17, 20, 18, 25, 23, 28, 30],
        type: 'scatter',
        mode: 'lines+markers',
        line: { color: '#3498db', width: 3 },
        marker: { size: 8, color: '#e74c3c' }
    };
    
    const layout = {
        title: 'Sample Line Chart',
        xaxis: { title: 'Time Period' },
        yaxis: { title: 'Value' },
        plot_bgcolor: 'rgba(0,0,0,0)',
        paper_bgcolor: 'rgba(0,0,0,0)'
    };
    
    Plotly.newPlot('chart2', [trace], layout, {responsive: true});
}

function createSampleScatterPlot() {
    const trace = {
        x: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
        y: [2, 4, 3, 8, 7, 9, 5, 6, 10, 12],
        mode: 'markers',
        type: 'scatter',
        marker: {
            size: [10, 15, 12, 20, 18, 25, 14, 16, 22, 28],
            color: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
            colorscale: 'Viridis',
            showscale: true
        }
    };
    
    const layout = {
        title: 'Sample Scatter Plot',
        xaxis: { title: 'X Values' },
        yaxis: { title: 'Y Values' },
        plot_bgcolor: 'rgba(0,0,0,0)',
        paper_bgcolor: 'rgba(0,0,0,0)'
    };
    
    Plotly.newPlot('chart3', [trace], layout, {responsive: true});
}

function createJSONArrayVisualizations(jsonArray) {
    // Create pie chart from array data
    const keys = Object.keys(jsonArray[0] || {});
    const values = keys.map(key => jsonArray.filter(item => item[key]).length);
    
    const pieTrace = {
        values: values,
        labels: keys,
        type: 'pie',
        marker: {
            colors: ['#3498db', '#e74c3c', '#2ecc71', '#f39c12', '#9b59b6', '#1abc9c']
        }
    };
    
    const pieLayout = {
        title: 'JSON Array Key Distribution',
        plot_bgcolor: 'rgba(0,0,0,0)',
        paper_bgcolor: 'rgba(0,0,0,0)'
    };
    
    Plotly.newPlot('json-chart1', [pieTrace], pieLayout, {responsive: true});
    
    // Create bar chart for array length
    const barTrace = {
        x: ['Total Items'],
        y: [jsonArray.length],
        type: 'bar',
        marker: { color: '#3498db' }
    };
    
    const barLayout = {
        title: 'JSON Array Size',
        yaxis: { title: 'Count' },
        plot_bgcolor: 'rgba(0,0,0,0)',
        paper_bgcolor: 'rgba(0,0,0,0)'
    };
    
    Plotly.newPlot('json-chart2', [barTrace], barLayout, {responsive: true});
}

function createJSONObjectVisualizations(jsonData, keys) {
    // Create visualization based on object structure
    const trace = {
        x: keys,
        y: keys.map(() => 1),
        type: 'bar',
        marker: {
            color: keys.map((_, i) => `hsl(${(i * 60) % 360}, 70%, 60%)`)
        }
    };
    
    const layout = {
        title: 'JSON Object Keys',
        xaxis: { title: 'Keys' },
        yaxis: { title: 'Presence' },
        plot_bgcolor: 'rgba(0,0,0,0)',
        paper_bgcolor: 'rgba(0,0,0,0)'
    };
    
    Plotly.newPlot('json-chart1', [trace], layout, {responsive: true});
}

function calculateFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    const size = parseFloat((bytes / Math.pow(k, i)).toFixed(2));
    return `${size} ${sizes[i]}`;
}

function formatFileSize(bytes) {
    // Keep this function for backward compatibility
    return calculateFileSize(bytes);
}

function showStatus(message, type = 'info') {
    statusMessage.textContent = message;
    statusMessage.className = `status-message ${type}`;
    
    // Auto-hide success messages after 3 seconds
    if (type === 'success') {
        setTimeout(() => {
            statusMessage.style.display = 'none';
        }, 3000);
    }
}

// Drag and drop functionality
function handleDragOver(event) {
    event.preventDefault();
    event.currentTarget.style.backgroundColor = '#d5dbdb';
    event.currentTarget.style.borderColor = '#95a5a6';
}

function handleDragLeave(event) {
    event.currentTarget.style.backgroundColor = '#ecf0f1';
    event.currentTarget.style.borderColor = '#bdc3c7';
}

function handleDrop(event) {
    event.preventDefault();
    event.currentTarget.style.backgroundColor = '#ecf0f1';
    event.currentTarget.style.borderColor = '#bdc3c7';
    
    const files = event.dataTransfer.files;
    if (files.length > 0) {
        fileInput.files = files;
        validateAndSetFile(files[0]);
    }
}

// Utility functions for future Flask integration
function prepareFormData(file) {
    const formData = new FormData();
    formData.append('file', file);
    return formData;
}

// Future Flask integration function (ready to use)
async function uploadToFlask(file) {
    try {
        const formData = prepareFormData(file);
        
        const response = await fetch('/upload', {
            method: 'POST',
            body: formData
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        return result;
        
    } catch (error) {
        console.error('Upload error:', error);
        throw error;
    }
}

// Export functions for potential module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        validateAndSetFile,
        formatFileSize,
        prepareFormData,
        uploadToFlask,
        createSampleBarChart,
        createSampleLineChart,
        createSampleScatterPlot,
        processCSVData,
        processJSONData
    };
}
