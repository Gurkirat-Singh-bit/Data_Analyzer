// Results Page JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Add animation to stat cards on scroll
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observe all cards for animation
    document.querySelectorAll('.stat-card, .column-card, .stats-card, .insight-card, .chart-card').forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(card);
    });

    // Table responsiveness helper
    const tables = document.querySelectorAll('.data-table');
    tables.forEach(table => {
        const wrapper = table.parentElement;
        if (wrapper && wrapper.classList.contains('table-container')) {
            // Add scroll indicator if table is wider than container
            const checkScroll = () => {
                if (table.scrollWidth > wrapper.clientWidth) {
                    wrapper.classList.add('scrollable');
                } else {
                    wrapper.classList.remove('scrollable');
                }
            };
            
            checkScroll();
            window.addEventListener('resize', checkScroll);
        }
    });

    // PDF download functionality
    const downloadPdfBtn = document.getElementById('downloadPdfBtn');
    if (downloadPdfBtn) {
        downloadPdfBtn.addEventListener('click', function() {
            const button = this;
            const originalText = button.innerHTML;
            
            button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating PDF...';
            button.disabled = true;
            
            const element = document.getElementById('reportContent');
            
            // Check if libraries are loaded
            if (typeof html2canvas === 'undefined') {
                alert('PDF libraries not loaded. Please refresh the page and try again.');
                button.innerHTML = originalText;
                button.disabled = false;
                return;
            }
            
            if (typeof window.jspdf === 'undefined' || typeof window.jspdf.jsPDF === 'undefined') {
                alert('jsPDF library not loaded. Please refresh the page and try again.');
                button.innerHTML = originalText;
                button.disabled = false;
                return;
            }

            html2canvas(element, {
                scale: 1.5,
                useCORS: true,
                allowTaint: true,
                backgroundColor: '#ffffff',
                logging: false,
                width: element.scrollWidth,
                height: element.scrollHeight,
                scrollX: 0,
                scrollY: 0
            }).then(canvas => {
                const imgData = canvas.toDataURL('image/png', 0.8);
                const { jsPDF } = window.jspdf;
                const pdf = new jsPDF('p', 'mm', 'a4');
                
                const imgWidth = 210;
                const pageHeight = 295;
                const imgHeight = (canvas.height * imgWidth) / canvas.width;
                let heightLeft = imgHeight;
                let position = 0;

                pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
                heightLeft -= pageHeight;

                while (heightLeft >= 0) {
                    position = heightLeft - imgHeight;
                    pdf.addPage();
                    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
                    heightLeft -= pageHeight;
                }

                const filename = document.querySelector('.filename').textContent || 'data_analysis_report';
                const timestamp = new Date().toISOString().slice(0,10);
                pdf.save(`${filename.replace(/\.[^/.]+$/, "")}_analysis_${timestamp}.pdf`);
                
                button.innerHTML = originalText;
                button.disabled = false;
            }).catch(error => {
                console.error('Error generating PDF:', error);
                alert('Error generating PDF. Please try again.');
                button.innerHTML = originalText;
                button.disabled = false;
            });
        });
    }

    // Enhanced chart resize handling
    window.addEventListener('resize', function() {
        // Trigger Plotly relayout for all charts
        document.querySelectorAll('.chart-container').forEach(chartDiv => {
            if (chartDiv.layout) {
                Plotly.Plots.resize(chartDiv);
            }
        });
    });

    // Copy table data to clipboard functionality
    document.querySelectorAll('.data-table').forEach(table => {
        const copyBtn = document.createElement('button');
        copyBtn.innerHTML = '<i class="fas fa-copy"></i> Copy Table';
        copyBtn.className = 'btn btn-secondary copy-table-btn';
        copyBtn.style.marginBottom = '10px';
        
        copyBtn.addEventListener('click', function() {
            copyTableToClipboard(table);
            copyBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
            setTimeout(() => {
                copyBtn.innerHTML = '<i class="fas fa-copy"></i> Copy Table';
            }, 2000);
        });
        
        table.parentElement.insertBefore(copyBtn, table);
    });

    // Function to copy table data to clipboard
    function copyTableToClipboard(table) {
        let csvContent = '';
        
        // Get headers
        const headers = Array.from(table.querySelectorAll('thead th')).map(th => th.textContent.trim());
        csvContent += headers.join('\t') + '\n';
        
        // Get data rows
        table.querySelectorAll('tbody tr').forEach(row => {
            const cells = Array.from(row.querySelectorAll('td')).map(td => td.textContent.trim());
            csvContent += cells.join('\t') + '\n';
        });
        
        // Copy to clipboard
        navigator.clipboard.writeText(csvContent).catch(err => {
            console.error('Failed to copy: ', err);
        });
    }

    // Add tooltips to stat cards
    document.querySelectorAll('.stat-card').forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-4px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(-2px) scale(1)';
        });
    });

    // Print functionality
    const printBtn = document.createElement('button');
    printBtn.innerHTML = '<i class="fas fa-print"></i> Print Report';
    printBtn.className = 'btn btn-secondary';
    printBtn.addEventListener('click', function() {
        window.print();
    });
    
    // Add print button to header actions if not already there
    const headerActions = document.querySelector('.header-actions');
    if (headerActions && !headerActions.querySelector('.print-btn')) {
        printBtn.classList.add('print-btn');
        headerActions.appendChild(printBtn);
    }

    // Enhanced error handling for missing visualizations
    document.querySelectorAll('.chart-container').forEach(chartDiv => {
        if (!chartDiv.hasChildNodes() || chartDiv.children.length === 0) {
            chartDiv.innerHTML = `
                <div style="display: flex; align-items: center; justify-content: center; height: 200px; color: #718096; flex-direction: column;">
                    <i class="fas fa-chart-bar" style="font-size: 2rem; margin-bottom: 10px; opacity: 0.5;"></i>
                    <p>Visualization not available</p>
                </div>
            `;
        }
    });

    // Back to top button
    const backToTopBtn = document.createElement('button');
    backToTopBtn.innerHTML = '<i class="fas fa-arrow-up"></i>';
    backToTopBtn.className = 'back-to-top-btn';
    backToTopBtn.style.cssText = `
        position: fixed;
        bottom: 30px;
        right: 30px;
        width: 50px;
        height: 50px;
        border-radius: 50%;
        background: #667eea;
        color: white;
        border: none;
        cursor: pointer;
        box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
        display: none;
        z-index: 1000;
        transition: all 0.3s ease;
    `;
    
    backToTopBtn.addEventListener('click', function() {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    
    document.body.appendChild(backToTopBtn);
    
    // Show/hide back to top button
    window.addEventListener('scroll', function() {
        if (window.pageYOffset > 300) {
            backToTopBtn.style.display = 'block';
        } else {
            backToTopBtn.style.display = 'none';
        }
    });

    console.log('Results page initialized successfully');
});