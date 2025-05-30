# Flask server  

from flask import Flask, request, jsonify , render_template , url_for, send_file, make_response
import os 
from analysis import load_data, analyze_data
from werkzeug.exceptions import RequestEntityTooLarge
import json
from datetime import datetime
import io

UPLOAD_FOLDER = os.path.join(os.path.dirname(__file__), 'uploads')  

app = Flask(__name__,static_folder='../static', static_url_path='/static') 

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
# Set maximum file size to 50MB
app.config['MAX_CONTENT_LENGTH'] = 50 * 1024 * 1024


@app.route('/')
def index():
    return render_template('index.html')

@app.route('/upload', methods=['POST'])
def upload_file():
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file part in the request'}), 400
        
        file = request.files['file']
        
        if file.filename == '':
            return jsonify({'error': 'No selected file'}), 400
        
        # Validate file extension
        allowed_extensions = {'.csv', '.json', '.xlsx', '.xls'}
        file_extension = os.path.splitext(file.filename)[1].lower()
        
        if file_extension not in allowed_extensions:
            return jsonify({
                'error': f'Unsupported file format "{file_extension}". Please upload CSV, JSON, or Excel files only.'
            }), 400
        
        if file:
            filename = file.filename
            filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            print(f"Saving file to: {filepath}")
            
            # Ensure upload directory exists
            os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
            
            file.save(filepath)
            
            # Check file size after saving
            file_size = os.path.getsize(filepath)
            print(f"File saved with size: {file_size} bytes")
            
            # Validate that the file can be loaded (basic validation)
            try:
                from analysis import load_data
                print(f"Validating file: {filename} (extension: {file_extension})")
                test_df = load_data(filepath)
                print(f"File validation successful: {test_df.shape[0]} rows, {test_df.shape[1]} columns")
            except Exception as validation_error:
                print(f"File validation failed for {filename}: {str(validation_error)}")
                # Remove the invalid file
                if os.path.exists(filepath):
                    os.remove(filepath)
                return jsonify({
                    'error': f'File validation failed: {str(validation_error)}'
                }), 400
            
            return jsonify({'message': 'File uploaded successfully', 'filename': filename}), 200
            
    except RequestEntityTooLarge:
        return jsonify({'error': 'File too large. Maximum size is 50MB.'}), 413
    except Exception as e:
        return jsonify({'error': f'Upload failed: {str(e)}'}), 500

@app.route('/analyze', methods=['POST'])
def analyze_file():
    try:
        data = request.get_json()
        if not data or 'file_path' not in data:
            return jsonify({'error': 'No file path provided'}), 400
        
        filename = data['file_path']
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        
        # Check if file exists
        if not os.path.exists(filepath):
            return jsonify({'error': f'File "{filename}" not found'}), 404
        
        # Load and analyze the data
        df = load_data(filepath)
        analysis_results = analyze_data(df)
        
        return jsonify({
            'message': 'File analyzed successfully',
            'filename': filename,
            'analysis': analysis_results,
            'redirect_url': f'/results/{filename}'
        }), 200
        
    except FileNotFoundError:
        return jsonify({'error': 'File not found'}), 404
    except ValueError as ve:
        return jsonify({'error': f'Data format error: {str(ve)}'}), 400
    except Exception as e:
        return jsonify({'error': f'Analysis failed: {str(e)}'}), 500

@app.route('/results/<filename>')
def show_results(filename):
    try:
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        
        # Check if file exists
        if not os.path.exists(filepath):
            return render_template('index.html'), 404
        
        # Load and analyze the data
        df = load_data(filepath)
        analysis_results = analyze_data(df)
        
        return render_template('results.html', 
                             filename=filename, 
                             analysis=analysis_results)
        
    except FileNotFoundError:
        return render_template('index.html'), 404
    except ValueError as ve:
        print(f"Data format error for {filename}: {str(ve)}")
        return render_template('index.html'), 400
    except Exception as e:
        print(f"Error processing {filename}: {str(e)}")
        return render_template('index.html'), 500

@app.route('/download-report/<filename>')
def download_report(filename):
    try:
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        
        # Load and analyze the data
        df = load_data(filepath)
        analysis_results = analyze_data(df)
        
        # Create a comprehensive report
        report = {
            'file_info': {
                'filename': filename,
                'analysis_date': datetime.now().isoformat(),
                'dataset_shape': analysis_results['shape'],
                'total_columns': analysis_results['shape'][1],
                'total_rows': analysis_results['shape'][0]
            },
            'data_summary': {
                'columns': analysis_results['columns'],
                'data_types': analysis_results['dtypes'],
                'missing_values': analysis_results['missing_values'],
                'data_quality': analysis_results['data_quality']
            },
            'statistical_summary': analysis_results['basic_stats'],
            'insights': analysis_results.get('insights', {}),
            'recommendations': analysis_results.get('insights', {}).get('recommendations', [])
        }
        
        # Convert to JSON string
        report_json = json.dumps(report, indent=2, default=str)
        
        # Create a file-like object
        output = io.StringIO()
        output.write(f"# Data Analysis Report for {filename}\n")
        output.write(f"Generated on: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n\n")
        output.write("## Dataset Overview\n")
        output.write(f"- File: {filename}\n")
        output.write(f"- Shape: {analysis_results['shape'][0]} rows × {analysis_results['shape'][1]} columns\n")
        output.write(f"- Missing Values: {analysis_results['total_missing']}\n")
        output.write(f"- Data Quality: {analysis_results['data_quality']['completeness']:.2f}% complete\n\n")
        
        output.write("## Column Information\n")
        for col in analysis_results['columns']:
            dtype = analysis_results['dtypes'][col]
            missing = analysis_results['missing_values'][col]
            output.write(f"- {col}: {dtype} ({missing} missing values)\n")
        
        if analysis_results['basic_stats']:
            output.write("\n## Statistical Summary\n")
            for col, stats in analysis_results['basic_stats'].items():
                output.write(f"\n### {col}\n")
                for stat_name, stat_value in stats.items():
                    output.write(f"- {stat_name}: {stat_value:.4f}\n")
        
        if analysis_results.get('insights'):
            insights = analysis_results['insights']
            if insights.get('data_quality'):
                output.write("\n## Data Quality Insights\n")
                for insight in insights['data_quality']:
                    output.write(f"- {insight}\n")
            
            if insights.get('patterns'):
                output.write("\n## Data Patterns\n")
                for pattern in insights['patterns']:
                    output.write(f"- {pattern}\n")
            
            if insights.get('recommendations'):
                output.write("\n## Recommendations\n")
                for rec in insights['recommendations']:
                    output.write(f"- {rec}\n")
        
        output.write(f"\n\n## Raw Analysis Data (JSON)\n```json\n{report_json}\n```")
        
        # Create response
        output_bytes = io.BytesIO()
        output_bytes.write(output.getvalue().encode('utf-8'))
        output_bytes.seek(0)
        
        return send_file(
            output_bytes,
            mimetype='text/plain',
            as_attachment=True,
            download_name=f'analysis_report_{filename}_{datetime.now().strftime("%Y%m%d_%H%M%S")}.txt'
        )
        
    except FileNotFoundError:
        return jsonify({'error': 'File not found'}), 404
    except Exception as e:
        return jsonify({'error': f'Report generation failed: {str(e)}'}), 500

@app.errorhandler(RequestEntityTooLarge)
def handle_file_too_large(e):
    return jsonify({'error': 'File too large. Maximum size is 50MB.'}), 413

if __name__ == '__main__':
    if not os.path.exists(UPLOAD_FOLDER):
        os.makedirs(UPLOAD_FOLDER)
    app.run(debug=True)