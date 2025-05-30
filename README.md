# 📊 Data Analyzer

<div align="center">

![Data Analyzer Logo](https://img.shields.io/badge/📊-Data%20Analyzer-blue?style=for-the-badge&logo=chart.js&logoColor=white)

[![Python](https://img.shields.io/badge/Python-3.8+-blue?style=flat-square&logo=python&logoColor=white)](https://python.org)
[![Flask](https://img.shields.io/badge/Flask-2.0+-green?style=flat-square&logo=flask&logoColor=white)](https://flask.palletsprojects.com)
[![Pandas](https://img.shields.io/badge/Pandas-Latest-purple?style=flat-square&logo=pandas&logoColor=white)](https://pandas.pydata.org)
[![Plotly](https://img.shields.io/badge/Plotly-Latest-orange?style=flat-square&logo=plotly&logoColor=white)](https://plotly.com)
[![License: CC BY-NC 4.0](https://img.shields.io/badge/License-CC%20BY--NC%204.0-lightgrey.svg?style=flat-square)](https://creativecommons.org/licenses/by-nc/4.0/)

**A modern, powerful data analysis tool that transforms your raw data into actionable insights**



</div>

---

## 🌟 Features

<div align="center">

| Feature | Description |
|---------|-------------|
| 📁 **Multi-Format Support** | CSV, JSON, Excel (XLS/XLSX) files with intelligent parsing |
| 📊 **Interactive Visualizations** | Beautiful charts and graphs powered by Plotly |
| 📈 **Statistical Analysis** | Comprehensive statistical insights and data profiling |
| 🎯 **Data Quality Assessment** | Identify missing values, outliers, and data quality issues |
| 📄 **PDF Report Generation** | Export your analysis as professional PDF reports |
| 🎨 **Modern UI/UX** | Clean, responsive design with drag-and-drop file upload |
| ⚡ **Real-time Processing** | Fast data processing with progress indicators |
| 🔧 **Robust Error Handling** | Smart fallback mechanisms and user-friendly error messages |

</div>

## 🚀 Quick Start

### Prerequisites

- Python 3.8 or higher
- pip (Python package installer)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Gurkirat-Singh-bit/Data_Analyzer.git
   cd Data_Analyzer
   ```

2. **Create a virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Run the application**
   ```bash
   python backend/app.py
   ```

5. **Open your browser**
   Navigate to `http://localhost:5000`

## 📋 Supported File Formats

### CSV Files ✅
- Multiple encodings: UTF-8, Latin-1, CP1252
- Automatic encoding detection and fallback
- Empty row/column cleanup
- Header validation

### JSON Files ✅
- Standard JSON arrays: `[{...}, {...}]`
- Dictionary of lists: `{"col1": [...], "col2": [...]}`
- Single object format: `{...}`
- Multiple encoding support with fallbacks
- Malformed JSON error reporting

### Excel Files ✅
- **.xlsx files**: Full openpyxl engine support
- **.xls files**: xlrd engine with fallback support
- Engine auto-detection based on file type
- Multi-sheet support (reads first sheet)
- Column encoding for special characters

## 🏗️ Project Structure

```
Data_Analyzer/
├── 📁 backend/
│   ├── 🐍 app.py              # Flask application entry point
│   ├── 🔧 analysis.py         # Data analysis and processing logic
│   ├── 📁 templates/
│   │   ├── 🎨 index.html      # Upload page
│   │   └── 📊 results.html    # Results page
│   └── 📁 uploads/            # Temporary file storage
├── 📁 static/
│   ├── 📁 css/                # Stylesheets
│   └── 📁 js/                 # JavaScript files
├── 📋 requirements.txt        # Python dependencies
└── 📖 README.md              # This file
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
FLASK_ENV=development
FLASK_DEBUG=True
MAX_CONTENT_LENGTH=16777216  # 16MB max file size
```

### Customization

- **File size limits**: Modify `MAX_CONTENT_LENGTH` in `app.py`
- **Supported formats**: Add new formats in `analysis.py`
- **UI themes**: Customize CSS in `static/css/`

## 📊 What You Get

### Comprehensive Analysis
- **Dataset Overview**: Rows, columns, data types, missing values
- **Statistical Summary**: Mean, median, mode, standard deviation
- **Data Quality Assessment**: Completeness score, data distribution
- **Column Analysis**: Individual column statistics and insights

### Interactive Visualizations
- **Distribution Plots**: Histograms and density plots
- **Correlation Matrices**: Relationship between variables
- **Box Plots**: Outlier detection and quartile analysis
- **Scatter Plots**: Variable relationships and patterns

### Export Options
- **PDF Reports**: Professional analysis reports
- **Raw Data**: Download processed datasets
- **Chart Images**: High-resolution visualization exports

## 🛠️ Development

### Setting up Development Environment

1. **Fork the repository**
2. **Clone your fork**
   ```bash
   git clone https://github.com/YOUR_USERNAME/Data_Analyzer.git
   ```
3. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
4. **Make your changes**
5. **Run tests**
   ```bash
   python -m pytest tests/
   ```
6. **Submit a pull request**

### Code Style

- Follow PEP 8 for Python code
- Use meaningful variable names
- Add docstrings to functions
- Write tests for new features

## 🐛 Troubleshooting

### Common Issues

**File Upload Fails**
- Check file format is supported (CSV, JSON, XLS, XLSX)
- Ensure file size is under 16MB
- Verify file is not corrupted

**Excel Files Not Loading**
- For .xls files, ensure xlrd is installed: `pip install xlrd==1.2.0`
- For .xlsx files, ensure openpyxl is installed: `pip install openpyxl`

**JSON Parsing Errors**
- Validate JSON format using online JSON validators
- Check for proper encoding (UTF-8 recommended)

## 📝 License

This project is licensed under the Creative Commons Attribution-NonCommercial 4.0 International License (CC BY-NC 4.0) - see the [LICENSE](LICENSE) file for details.

**You are free to:**
- 🔄 **Share** — copy and redistribute the material in any medium or format
- 🔧 **Adapt** — remix, transform, and build upon the material

**Under the following terms:**
- 📝 **Attribution** — You must give appropriate credit and indicate if changes were made
- 🚫 **NonCommercial** — You may not use the material for commercial purposes

For more information, visit: https://creativecommons.org/licenses/by-nc/4.0/

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://github.com/Gurkirat-Singh-bit/Data_Analyzer/issues).

### Contributors

- **Gurkirat Singh** - *Initial work* - [Portfolio](https://gurkirat-singh-bit.github.io/Portfolio/)
- **GitHub Copilot** - *AI Assistant* - Code optimization and bug fixes

## 🙏 Acknowledgments

- [Flask](https://flask.palletsprojects.com/) - Web framework
- [Pandas](https://pandas.pydata.org/) - Data manipulation and analysis
- [Plotly](https://plotly.com/) - Interactive visualizations
- [Font Awesome](https://fontawesome.com/) - Icons
- [Inter Font](https://rsms.me/inter/) - Typography

## 📞 Support

If you like this project, please consider:

- ⭐ Starring the repository
- 🐛 Reporting bugs
- 💡 Suggesting new features
- 🤝 Contributing to the codebase

---

<div align="center">

**Made with ❤️ by [Gurkirat Singh](https://gurkirat-singh-bit.github.io/Portfolio/) and [GitHub Copilot](https://github.com/features/copilot)**

[![GitHub](https://img.shields.io/badge/GitHub-Gurkirat--Singh--bit-black?style=flat-square&logo=github)](https://github.com/Gurkirat-Singh-bit)
[![Portfolio](https://img.shields.io/badge/Portfolio-Visit-blue?style=flat-square&logo=web)](https://gurkirat-singh-bit.github.io/Portfolio/)

</div>
