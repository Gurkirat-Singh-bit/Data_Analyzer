# Pandas-based interaction for Q&A

import pandas as pd
import os
import json
import plotly.graph_objects as go
import plotly.express as px
import plotly.utils
import numpy as np
from datetime import datetime
import plotly.graph_objs as go
import plotly.express as px
import plotly.utils
from datetime import datetime

def load_data(file_path):
    """
    Load data from CSV, JSON, or Excel files
    Returns pandas DataFrame
    """
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"File not found: {file_path}")
    
    try:
        file_extension = os.path.splitext(file_path)[1].lower()
        
        if file_extension == '.csv':
            # Try different encodings for CSV files
            try:
                data = pd.read_csv(file_path, encoding='utf-8')
            except UnicodeDecodeError:
                try:
                    data = pd.read_csv(file_path, encoding='latin-1')
                except UnicodeDecodeError:
                    data = pd.read_csv(file_path, encoding='cp1252')
                    
        elif file_extension == '.json':
            # Enhanced JSON loading with multiple fallback methods
            try:
                # Method 1: Try pandas read_json (works for properly structured JSON)
                data = pd.read_json(file_path)
            except (ValueError, UnicodeDecodeError):
                try:
                    # Method 2: Load as regular JSON and convert to DataFrame
                    with open(file_path, 'r', encoding='utf-8') as f:
                        json_data = json.load(f)
                    
                    # Handle different JSON structures
                    if isinstance(json_data, list):
                        data = pd.DataFrame(json_data)
                    elif isinstance(json_data, dict):
                        # If it's a dict, try to convert to DataFrame
                        if all(isinstance(v, list) for v in json_data.values()):
                            # Dict of lists format
                            data = pd.DataFrame(json_data)
                        else:
                            # Single record dict, convert to single-row DataFrame
                            data = pd.DataFrame([json_data])
                    else:
                        raise ValueError("JSON structure not supported for analysis")
                        
                except json.JSONDecodeError as jde:
                    raise ValueError(f"Invalid JSON format: {str(jde)}")
                except UnicodeDecodeError:
                    # Try different encoding
                    try:
                        with open(file_path, 'r', encoding='latin-1') as f:
                            json_data = json.load(f)
                        data = pd.DataFrame(json_data if isinstance(json_data, list) else [json_data])
                    except:
                        raise ValueError("Unable to read JSON file with any encoding")
                        
        elif file_extension in ['.xlsx', '.xls']:
            # Enhanced Excel loading with comprehensive error handling
            print(f"Attempting to load Excel file: {file_path}")
            data = None
            last_error = None
            
            # Determine best engine based on file extension
            if file_extension == '.xls':
                # For .xls files, try xlrd first, then fallbacks
                engines_to_try = ['xlrd', 'openpyxl', None]
            else:
                # For .xlsx files, try openpyxl first, then fallbacks  
                engines_to_try = ['openpyxl', None]
            
            for engine in engines_to_try:
                try:
                    if engine:
                        print(f"Trying {engine} engine...")
                        data = pd.read_excel(file_path, engine=engine)
                        print(f"Successfully loaded with {engine}: {data.shape}")
                    else:
                        print("Trying default pandas Excel reader...")
                        data = pd.read_excel(file_path)
                        print(f"Successfully loaded with default reader: {data.shape}")
                    break  # Success, exit the loop
                    
                except Exception as e:
                    last_error = e
                    engine_name = engine if engine else 'default'
                    print(f"{engine_name} failed: {str(e)}")
                    continue
            
            # If all engines failed
            if data is None:
                # Final attempt: Try reading with explicit sheet name
                try:
                    print("Final attempt: Trying to read first sheet explicitly...")
                    # Try different engines with explicit sheet name
                    for engine in engines_to_try:
                        try:
                            if engine:
                                data = pd.read_excel(file_path, engine=engine, sheet_name=0)
                            else:
                                data = pd.read_excel(file_path, sheet_name=0)
                            print(f"Successfully loaded first sheet with {engine or 'default'}: {data.shape}")
                            break
                        except Exception as e:
                            continue
                            
                    if data is None:
                        # All attempts failed
                        error_msg = f"Unable to read Excel file. Last error: {str(last_error)}"
                        if file_extension == '.xls':
                            error_msg = f"Unable to read .xls file. This appears to be an older Excel format. Please save as .xlsx or .csv format. Last error: {str(last_error)}"
                        raise ValueError(error_msg)
                        
                except Exception as final_error:
                    if file_extension == '.xls':
                        raise ValueError(f"Unable to read .xls file. This appears to be an older Excel format that requires conversion. Please save as .xlsx or .csv format. Last error: {str(final_error)}")
                    else:
                        raise ValueError(f"Unable to read .xlsx file: {str(final_error)}. Please ensure the file is not corrupted.")
            
            # Final validation for Excel data
            if data is not None:
                print(f"Excel file loaded successfully: {data.shape}")
                # Check if data has proper structure
                if data.empty:
                    raise ValueError("Excel file appears to be empty")
                    
                # Handle potential encoding issues in column names
                try:
                    data.columns = [str(col).strip() for col in data.columns]
                    print(f"Column names: {list(data.columns)}")
                except Exception as col_error:
                    print(f"Warning: Column name processing issue: {str(col_error)}")
                    
        else:
            raise ValueError(f"Unsupported file format '{file_extension}'. Please upload a CSV, JSON, or Excel file.")
        
        # Validate that we have data
        if data.empty:
            raise ValueError("The file appears to be empty or contains no readable data")
            
        # Basic data cleaning
        # Remove completely empty rows and columns
        data = data.dropna(how='all').dropna(axis=1, how='all')
        
        if data.empty:
            raise ValueError("No valid data found after cleaning empty rows/columns")
            
        return data
        
    except Exception as e:
        # Re-raise with more specific error message
        if isinstance(e, (ValueError, FileNotFoundError)):
            raise e
        else:
            raise Exception(f"Error loading file '{os.path.basename(file_path)}': {str(e)}")

def analyze_data(data):
    """
    Perform comprehensive analysis on the data
    Returns analysis results as dictionary
    """
    try:
        # Basic information
        shape = data.shape
        columns = list(data.columns)
        dtypes = data.dtypes.astype(str).to_dict()
        missing_values = data.isnull().sum().to_dict()
        total_missing = sum(missing_values.values())
        
        # Identify column types
        numeric_columns = list(data.select_dtypes(include=['number']).columns)
        categorical_columns = list(data.select_dtypes(include=['object', 'category']).columns)
        datetime_columns = list(data.select_dtypes(include=['datetime']).columns)
        
        # Basic statistics for numeric columns
        basic_stats = {}
        if len(numeric_columns) > 0:
            stats_df = data[numeric_columns].describe()
            for col in numeric_columns:
                basic_stats[col] = {
                    'count': float(stats_df.loc['count', col]),
                    'mean': float(stats_df.loc['mean', col]),
                    'std': float(stats_df.loc['std', col]),
                    'min': float(stats_df.loc['min', col]),
                    '25%': float(stats_df.loc['25%', col]),
                    '50%': float(stats_df.loc['50%', col]),
                    '75%': float(stats_df.loc['75%', col]),
                    'max': float(stats_df.loc['max', col])
                }
        
        # Categorical statistics
        categorical_stats = {}
        for col in categorical_columns:
            if col in data.columns:
                col_data = data[col].dropna()  # Remove NaN values for accurate counting
                if len(col_data) > 0:
                    unique_count = col_data.nunique()
                    mode_values = col_data.mode()
                    most_frequent = str(mode_values.iloc[0]) if len(mode_values) > 0 else 'N/A'
                    value_counts = col_data.value_counts()
                    frequency = int(value_counts.iloc[0]) if len(value_counts) > 0 else 0
                    
                    categorical_stats[col] = {
                        'unique_count': int(unique_count),
                        'most_frequent': most_frequent,
                        'frequency': frequency
                    }
                else:
                    categorical_stats[col] = {
                        'unique_count': 0,
                        'most_frequent': 'N/A',
                        'frequency': 0
                    }
        
        # Data preview (first 5 rows)
        head_data = data.head().to_dict('records')
        
        # Data quality metrics
        data_quality = {
            'completeness': ((shape[0] * shape[1] - total_missing) / (shape[0] * shape[1])) * 100 if shape[0] * shape[1] > 0 else 0,
            'missing_percentage': (total_missing / (shape[0] * shape[1])) * 100 if shape[0] * shape[1] > 0 else 0,
            'duplicate_rows': int(data.duplicated().sum()),
            'memory_usage': float(data.memory_usage(deep=True).sum() / 1024**2)  # MB
        }
        
        # Column types breakdown
        dtype_counts = data.dtypes.value_counts().to_dict()
        dtype_counts = {str(k): int(v) for k, v in dtype_counts.items()}
        
        # Generate visualizations
        visualizations = generate_visualizations(data, numeric_columns, categorical_columns)
        
        # Correlation analysis for numeric data
        correlations = {}
        if len(numeric_columns) > 1:
            corr_matrix = data[numeric_columns].corr()
            correlations = corr_matrix.to_dict()
            # Convert numpy values to float for JSON serialization
            for key in correlations:
                for subkey in correlations[key]:
                    if pd.notna(correlations[key][subkey]):
                        correlations[key][subkey] = float(correlations[key][subkey])
                    else:
                        correlations[key][subkey] = None
        
        # Advanced insights
        insights = generate_insights(data, numeric_columns)
        
        analysis = {
            'shape': shape,
            'columns': columns,
            'dtypes': dtypes,
            'dtype_counts': dtype_counts,
            'missing_values': missing_values,
            'total_missing': total_missing,
            'basic_stats': basic_stats,
            'categorical_stats': categorical_stats,
            'head': head_data,
            'data_quality': data_quality,
            'numeric_columns': list(numeric_columns),
            'categorical_columns': list(data.select_dtypes(include=['object', 'category']).columns),
            'datetime_columns': list(data.select_dtypes(include=['datetime64']).columns),
            'visualizations': visualizations,
            'correlations': correlations,
            'insights': insights,
            'analysis_timestamp': datetime.now().isoformat()
        }
        
        return analysis
        
    except Exception as e:
        raise Exception(f"Error analyzing data: {str(e)}")

def generate_visualizations(data, numeric_columns, categorical_columns):
    """Generate Plotly visualizations for the data"""
    visualizations = {}
    
    try:
        # 1. Data types distribution pie chart
        dtype_counts = data.dtypes.value_counts()
        if len(dtype_counts) > 0:
            fig_dtypes = px.pie(
                values=dtype_counts.values,
                names=[str(x) for x in dtype_counts.index],
                title="Data Types Distribution"
            )
            fig_dtypes.update_layout(
                font=dict(size=14),
                showlegend=True,
                height=400
            )
            visualizations['data_types_pie'] = json.loads(plotly.utils.PlotlyJSONEncoder().encode(fig_dtypes))
        
        # 2. Missing values bar chart
        missing_data = data.isnull().sum()
        missing_data = missing_data[missing_data > 0].sort_values(ascending=False)
        
        if len(missing_data) > 0:
            fig_missing = px.bar(
                x=missing_data.index,
                y=missing_data.values,
                title="Missing Values by Column",
                labels={'x': 'Columns', 'y': 'Missing Count'}
            )
            fig_missing.update_layout(
                xaxis_tickangle=-45,
                height=400,
                font=dict(size=12)
            )
            visualizations['missing_values_bar'] = json.loads(plotly.utils.PlotlyJSONEncoder().encode(fig_missing))
        
        # 3. Numeric columns distribution histograms
        if len(numeric_columns) > 0:
            # Select first 4 numeric columns for histograms
            cols_to_plot = list(numeric_columns)[:4]
            
            for i, col in enumerate(cols_to_plot):
                clean_data = data[col].dropna()
                if len(clean_data) > 0:
                    fig_hist = px.histogram(
                        x=clean_data, 
                        title=f"Distribution of {col}",
                        nbins=min(30, len(clean_data.unique()))
                    )
                    fig_hist.update_layout(
                        height=350,
                        font=dict(size=12),
                        xaxis_title=col,
                        yaxis_title="Frequency"
                    )
                    visualizations[f'histogram_{i+1}'] = json.loads(plotly.utils.PlotlyJSONEncoder().encode(fig_hist))
        
        # 4. Correlation heatmap for numeric data
        if len(numeric_columns) > 1:
            corr_matrix = data[numeric_columns].corr()
            
            fig_corr = px.imshow(
                corr_matrix,
                title="Correlation Matrix",
                color_continuous_scale="RdBu",
                aspect="auto",
                text_auto=True
            )
            fig_corr.update_layout(
                height=500,
                font=dict(size=12)
            )
            visualizations['correlation_heatmap'] = json.loads(plotly.utils.PlotlyJSONEncoder().encode(fig_corr))
        
        # 5. Box plots for numeric columns (outlier detection)
        if len(numeric_columns) > 0:
            cols_to_plot = list(numeric_columns)[:3]  # First 3 numeric columns
            
            for i, col in enumerate(cols_to_plot):
                clean_data = data[col].dropna()
                if len(clean_data) > 0:
                    fig_box = px.box(
                        y=clean_data, 
                        title=f"Box Plot - {col} (Outlier Detection)"
                    )
                    fig_box.update_layout(
                        height=400,
                        font=dict(size=12),
                        yaxis_title=col
                    )
                    visualizations[f'boxplot_{i+1}'] = json.loads(plotly.utils.PlotlyJSONEncoder().encode(fig_box))
        
        # 6. Categorical data visualization
        if len(categorical_columns) > 0:
            for i, col in enumerate(categorical_columns[:2]):  # First 2 categorical columns
                value_counts = data[col].value_counts().head(10)  # Top 10 categories
                if len(value_counts) > 0:
                    fig_cat = px.bar(
                        x=value_counts.index,
                        y=value_counts.values,
                        title=f"Top Categories in {col}"
                    )
                    fig_cat.update_layout(
                        height=400,
                        font=dict(size=12),
                        xaxis_title=col,
                        yaxis_title="Count",
                        xaxis_tickangle=-45
                    )
                    visualizations[f'categorical_{i+1}'] = json.loads(plotly.utils.PlotlyJSONEncoder().encode(fig_cat))
        
    except Exception as e:
        print(f"Error generating visualizations: {str(e)}")
        visualizations['error'] = str(e)
    
    return visualizations

def generate_insights(data, numeric_columns):
    """Generate data insights and recommendations"""
    insights = {
        'data_quality': [],
        'patterns': [],
        'recommendations': []
    }
    
    try:
        # Data quality insights
        total_cells = data.shape[0] * data.shape[1]
        missing_cells = data.isnull().sum().sum()
        completeness = ((total_cells - missing_cells) / total_cells) * 100
        
        if completeness >= 95:
            insights['data_quality'].append("Excellent data quality - very few missing values")
        elif completeness >= 80:
            insights['data_quality'].append("Good data quality - some missing values to address")
        else:
            insights['data_quality'].append("Poor data quality - significant missing values detected")
        
        # Numeric data insights
        if len(numeric_columns) > 0:
            for col in numeric_columns:
                col_data = data[col].dropna()
                if len(col_data) > 0:
                    # Check for outliers using IQR method
                    Q1 = col_data.quantile(0.25)
                    Q3 = col_data.quantile(0.75)
                    IQR = Q3 - Q1
                    outliers = col_data[(col_data < Q1 - 1.5 * IQR) | (col_data > Q3 + 1.5 * IQR)]
                    
                    if len(outliers) > 0:
                        outlier_percentage = (len(outliers) / len(col_data)) * 100
                        insights['patterns'].append(f"{col}: {outlier_percentage:.1f}% outliers detected")
                    
                    # Check for skewness
                    skewness = col_data.skew()
                    if abs(skewness) > 1:
                        skew_type = "right" if skewness > 0 else "left"
                        insights['patterns'].append(f"{col}: Highly skewed distribution ({skew_type})")
        
        # Recommendations
        if missing_cells > 0:
            insights['recommendations'].append("Consider data cleaning for missing values")
        
        if len(numeric_columns) > 1:
            insights['recommendations'].append("Explore correlations between numeric variables")
        
        categorical_cols = data.select_dtypes(include=['object', 'category']).columns
        if len(categorical_cols) > 0:
            insights['recommendations'].append("Consider encoding categorical variables for ML applications")
        
        if data.shape[0] > 10000:
            insights['recommendations'].append("Large dataset - consider sampling for initial exploration")
        
    except Exception as e:
        insights['error'] = f"Error generating insights: {str(e)}"
    
    return insights
