// Upload Page JavaScript
document.addEventListener('DOMContentLoaded', function() {
    const uploadZone = document.getElementById('uploadZone');
    const fileInput = document.getElementById('fileInput');
    const fileDetails = document.getElementById('fileDetails');
    const fileName = document.getElementById('fileName');
    const fileSize = document.getElementById('fileSize');
    const fileType = document.getElementById('fileType');
    const uploadTime = document.getElementById('uploadTime');
    const removeFileBtn = document.getElementById('removeFile');
    const analyzeBtn = document.getElementById('analyzeBtn');
    const uploadProgress = document.getElementById('uploadProgress');
    const progressFill = document.getElementById('progressFill');
    const progressText = document.getElementById('progressText');
    const statusMessage = document.getElementById('statusMessage');

    let selectedFile = null;

    // File size formatter
    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    // Get file type icon
    function getFileIcon(fileType) {
        if (fileType.includes('csv')) return 'fas fa-file-csv';
        if (fileType.includes('json')) return 'fas fa-file-code';
        if (fileType.includes('excel') || fileType.includes('xlsx') || fileType.includes('xls')) return 'fas fa-file-excel';
        return 'fas fa-file-alt';
    }

    // Update file icon based on type
    function updateFileIcon(fileType) {
        const fileIcon = document.querySelector('.file-icon-large i');
        if (fileIcon) {
            fileIcon.className = getFileIcon(fileType);
        }
    }

    // Show status message
    function showStatus(message, type = 'info') {
        statusMessage.textContent = message;
        statusMessage.className = `status-message ${type}`;
        statusMessage.style.display = 'block';
        
        if (type === 'success' || type === 'error') {
            setTimeout(() => {
                statusMessage.style.display = 'none';
            }, 5000);
        }
    }

    // Handle file selection
    function handleFileSelect(file) {
        if (!file) return;

        // Validate file type
        const allowedTypes = ['.csv', '.json', '.xlsx', '.xls'];
        const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
        
        if (!allowedTypes.includes(fileExtension)) {
            showStatus('Please select a valid file format (CSV, JSON, or Excel)', 'error');
            return;
        }

        // Validate file size (50MB limit)
        const maxSize = 50 * 1024 * 1024; // 50MB
        if (file.size > maxSize) {
            showStatus('File size must be less than 50MB', 'error');
            return;
        }

        selectedFile = file;
        
        // Update file details
        fileName.textContent = file.name;
        fileSize.textContent = formatFileSize(file.size);
        fileType.textContent = fileExtension.toUpperCase().substring(1);
        uploadTime.textContent = new Date().toLocaleString();
        
        // Update file icon
        updateFileIcon(file.type);
        
        // Show file details and hide upload zone
        uploadZone.style.display = 'none';
        fileDetails.classList.remove('hidden');
        
        showStatus('File selected successfully! Click "Analyze Data" to proceed.', 'success');
    }

    // Upload zone click handler
    uploadZone.addEventListener('click', () => {
        fileInput.click();
    });

    // File input change handler
    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            handleFileSelect(file);
        }
    });

    // Drag and drop handlers
    uploadZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadZone.classList.add('dragover');
    });

    uploadZone.addEventListener('dragleave', (e) => {
        e.preventDefault();
        uploadZone.classList.remove('dragover');
    });

    uploadZone.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadZone.classList.remove('dragover');
        
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleFileSelect(files[0]);
        }
    });

    // Remove file handler
    removeFileBtn.addEventListener('click', () => {
        selectedFile = null;
        fileInput.value = '';
        fileDetails.classList.add('hidden');
        uploadZone.style.display = 'block';
        statusMessage.style.display = 'none';
    });

    // Upload progress simulation
    function showUploadProgress() {
        uploadProgress.classList.remove('hidden');
        fileDetails.classList.add('hidden');
        
        let progress = 0;
        const interval = setInterval(() => {
            progress += Math.random() * 15;
            if (progress > 100) {
                progress = 100;
                clearInterval(interval);
            }
            
            progressFill.style.width = progress + '%';
            progressText.textContent = `Uploading... ${Math.round(progress)}%`;
        }, 200);
        
        return new Promise(resolve => {
            setTimeout(resolve, 2000); // Simulate 2 second upload
        });
    }

    // Analyze button handler
    analyzeBtn.addEventListener('click', async () => {
        if (!selectedFile) {
            showStatus('Please select a file first', 'error');
            return;
        }

        try {
            analyzeBtn.disabled = true;
            analyzeBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
            
            // Show upload progress
            await showUploadProgress();
            
            // Create FormData and upload file
            const formData = new FormData();
            formData.append('file', selectedFile);
            
            // Upload file
            const uploadResponse = await fetch('/upload', {
                method: 'POST',
                body: formData
            });
            
            if (!uploadResponse.ok) {
                const errorData = await uploadResponse.json().catch(() => ({}));
                throw new Error(errorData.error || `Upload failed with status ${uploadResponse.status}`);
            }
            
            const uploadResult = await uploadResponse.json();
            
            // Analyze file
            const analyzeResponse = await fetch('/analyze', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    file_path: uploadResult.filename
                })
            });
            
            if (!analyzeResponse.ok) {
                const errorData = await analyzeResponse.json().catch(() => ({}));
                throw new Error(errorData.error || `Analysis failed with status ${analyzeResponse.status}`);
            }
            
            const analyzeResult = await analyzeResponse.json();
            
            // Redirect to results page
            if (analyzeResult.redirect_url) {
                window.location.href = analyzeResult.redirect_url;
            } else {
                window.location.href = `/results/${uploadResult.filename}`;
            }
            
        } catch (error) {
            console.error('Error:', error);
            showStatus('Error: ' + error.message, 'error');
            
            // Reset UI
            uploadProgress.classList.add('hidden');
            fileDetails.classList.remove('hidden');
            analyzeBtn.disabled = false;
            analyzeBtn.innerHTML = '<i class="fas fa-chart-line"></i> Analyze Data';
        }
    });

    // Prevent default drag behaviors on the whole document
    document.addEventListener('dragover', (e) => {
        e.preventDefault();
    });

    document.addEventListener('drop', (e) => {
        e.preventDefault();
    });
});