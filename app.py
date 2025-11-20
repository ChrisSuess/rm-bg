from flask import Flask, render_template, request, send_file, jsonify
from rembg import remove
from PIL import Image
import io
import uuid

app = Flask(__name__)

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/upload", methods=["POST"])
def upload():
    files = request.files.getlist("files")

    output_files = []

    for file in files:
        img = Image.open(file.stream)
        output = remove(img)

        img_io = io.BytesIO()
        output.save(img_io, format="PNG")
        img_io.seek(0)

        filename = f"{uuid.uuid4().hex}.png"
        file_bytes = img_io.read()
        output_files.append({
            "filename": filename,
            "data": file_bytes
        })

    return jsonify({"status": "ok", "files": [
        {
            "filename": f["filename"],
            "data": f["data"].hex()
        } for f in output_files
    ]})

if __name__ == "__main__":
    app.run(debug=True)
