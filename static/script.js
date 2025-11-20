const dropzone = document.getElementById("dropzone");
const fileInput = document.getElementById("fileInput");
const previewContainer = document.getElementById("previewContainer");

dropzone.addEventListener("click", () => fileInput.click());
fileInput.addEventListener("change", () => handleFiles(fileInput.files));

dropzone.addEventListener("dragover", e => {
    e.preventDefault();
    dropzone.classList.add("hover");
});

dropzone.addEventListener("dragleave", () => {
    dropzone.classList.remove("hover");
});

dropzone.addEventListener("drop", e => {
    e.preventDefault();
    dropzone.classList.remove("hover");
    handleFiles(e.dataTransfer.files);
});

function handleFiles(files) {
    [...files].forEach(file => {
        const reader = new FileReader();

        // Create preview box
        const box = document.createElement("div");
        box.className = "previewBox";

        const img = document.createElement("img");
        const barContainer = document.createElement("div");
        barContainer.className = "progressBarContainer";

        const bar = document.createElement("div");
        bar.className = "progressBar";

        barContainer.appendChild(bar);
        box.appendChild(img);
        box.appendChild(barContainer);
        previewContainer.appendChild(box);

        // Show preview
        reader.onload = e => {
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);

        uploadFile(file, bar, img);
    });
}

async function uploadFile(file, bar, imgElement) {
    const formData = new FormData();
    formData.append("files", file);

    // Fake progress for UI smoothness
    let progress = 0;
    const interval = setInterval(() => {
        progress = Math.min(progress + Math.random() * 15, 90);
        bar.style.width = progress + "%";
    }, 200);

    const response = await fetch("/upload", {
        method: "POST",
        body: formData
    });

    clearInterval(interval);
    bar.style.width = "100%";

    const data = await response.json();
    const fileHex = data.files[0].data;

    // Convert hex back to blob
    const byteArray = new Uint8Array(
        fileHex.match(/.{1,2}/g).map(byte => parseInt(byte, 16))
    );
    const blob = new Blob([byteArray], { type: "image/png" });
    const url = URL.createObjectURL(blob);

    // Clicking preview image downloads processed result
    imgElement.onclick = () => {
        const a = document.createElement("a");
        a.href = url;
        a.download = file.name.replace(/\.[^/.]+$/, "") + "_no_bg.png";
        a.click();
    };
}
