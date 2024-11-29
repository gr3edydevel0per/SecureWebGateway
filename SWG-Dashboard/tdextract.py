from flask import Flask, request, jsonify
import tldextract

app = Flask(__name__)


# Extract the domain components using tldextract
# Combine domain and suffix to get the main domain
def get_main_domain(url):
    extracted = tldextract.extract(url)
    main_domain = f"{extracted.domain}.{extracted.suffix}" if extracted.suffix else None
    return main_domain



# Get the URL from the query parameter
# Validate the URL format
# Check if the URL is valid by using tldextract (it automatically handles various edge cases)
@app.route('/get-domain', methods=['GET'])
def get_domain():
    url = request.args.get('url')
    if not url:
        return jsonify({"error": "No URL provided"}), 200
    try:
        domain = get_main_domain(url)
        if domain:
            return jsonify({"main_domain": domain}), 200
        else:
            return jsonify({"error": "Invalid URL or unable to extract domain"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500



if __name__ == '__main__':
    app.run(debug=True)
