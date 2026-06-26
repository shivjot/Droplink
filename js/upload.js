import { supabase } from "./supabase.js";
import {
    STORAGE_BUCKET,
    MAX_FILE_SIZE,
    ALLOWED_TYPES
} from "./config.js";

/* ==========================================
   DOM
========================================== */

const dropArea = document.getElementById("dropArea");
const fileInput = document.getElementById("fileInput");
const browseBtn = document.getElementById("browseBtn");

const selectedBox = document.getElementById("selectedBox");
const progressBox = document.getElementById("progressBox");
const successBox = document.getElementById("successBox");

const fileName = document.getElementById("fileName");
const fileSize = document.getElementById("fileSize");
const fileIcon = document.getElementById("fileIcon");

const uploadBtn = document.getElementById("uploadBtn");

const progressBar = document.getElementById("progressBar");
const progressText = document.getElementById("progressText");

const publicLink = document.getElementById("publicLink");
const copyBtn = document.getElementById("copyBtn");
const openBtn = document.getElementById("openBtn");
const newUploadBtn = document.getElementById("newUploadBtn");

const toast = document.getElementById("toast");

/* ==========================================
   VARIABLES
========================================== */

let selectedFile = null;

/* ==========================================
   EVENTS
========================================== */

browseBtn.addEventListener("click", () => {

    fileInput.click();

});

dropArea.addEventListener("click", () => {

    fileInput.click();

});

fileInput.addEventListener("change", () => {

    if (fileInput.files.length) {

        handleFile(fileInput.files[0]);

    }

});

/* ==========================================
   DRAG & DROP
========================================== */

["dragenter", "dragover"].forEach(event => {

    dropArea.addEventListener(event, e => {

        e.preventDefault();

        dropArea.classList.add("dragover");

    });

});

["dragleave", "drop"].forEach(event => {

    dropArea.addEventListener(event, e => {

        e.preventDefault();

        dropArea.classList.remove("dragover");

    });

});

dropArea.addEventListener("drop", e => {

    if (e.dataTransfer.files.length) {

        handleFile(e.dataTransfer.files[0]);

    }

});

/* ==========================================
   HANDLE FILE
========================================== */

function handleFile(file) {

    if (!ALLOWED_TYPES.includes(file.type)) {

        alert("Unsupported file type.");

        return;

    }

    if (file.size > MAX_FILE_SIZE) {

        alert("Maximum file size is 10 MB.");

        return;

    }

    selectedFile = file;

    fileName.textContent = file.name;

    fileSize.textContent =
        formatFileSize(file.size);

    fileIcon.textContent =
        getFileIcon(file.type);

    selectedBox.classList.remove("hidden");

    progressBox.classList.add("hidden");

    successBox.classList.add("hidden");

}

/* ==========================================
   FILE ICON
========================================== */

function getFileIcon(type) {

    if (type.startsWith("image/")) {

        return "🖼️";

    }

    if (type === "application/pdf") {

        return "📕";

    }

    if (type.includes("word")) {

        return "📄";

    }

    if (type.includes("spreadsheet")) {

        return "📊";

    }

    return "📁";

}

/* ==========================================
   FORMAT SIZE
========================================== */

function formatFileSize(bytes) {

    if (bytes < 1024) {

        return bytes + " B";

    }

    if (bytes < 1024 * 1024) {

        return (bytes / 1024).toFixed(1) + " KB";

    }

    return (bytes / 1024 / 1024).toFixed(2) + " MB";

}

/* ==========================================
   PART 2 STARTS BELOW
========================================== */

/* ==========================================
   UPLOAD
========================================== */

uploadBtn.addEventListener("click", uploadFile);

async function uploadFile() {

    if (!selectedFile) {

        alert("Please select a file.");

        return;

    }

    uploadBtn.disabled = true;

    uploadBtn.textContent = "Uploading...";

    selectedBox.classList.add("hidden");

    progressBox.classList.remove("hidden");

    progressBar.style.width = "10%";

    progressText.textContent = "Preparing...";

    try {

        const extension =
            selectedFile.name.split(".").pop().toLowerCase();

        const storageName =
            crypto.randomUUID() + "." + extension;

        const publicId =
            generatePublicId();

        progressBar.style.width = "25%";
        progressText.textContent = "Uploading to Storage...";

        const { error: uploadError } =
            await supabase.storage
                .from(STORAGE_BUCKET)
                .upload(storageName, selectedFile, {
                    cacheControl: "3600",
                    upsert: false
                });

        if (uploadError) {

            throw uploadError;

        }

        progressBar.style.width = "70%";
        progressText.textContent = "Saving information...";

        const { error: dbError } =
            await supabase
                .from("files")
                .insert({

                    public_id: publicId,

                    file_name: selectedFile.name,

                    file_type: selectedFile.type,

                    file_size: selectedFile.size,

                    storage_path: storageName

                });

        if (dbError) {

            throw dbError;

        }

        progressBar.style.width = "100%";
        progressText.textContent = "Completed";

        showSuccess(publicId);

    }

    catch (error) {

        console.error(error);

        alert(error.message);

        progressBox.classList.add("hidden");

        selectedBox.classList.remove("hidden");

    }

    finally {

        uploadBtn.disabled = false;

        uploadBtn.textContent = "Upload File";

    }

}

/* ==========================================
   SUCCESS
========================================== */

function showSuccess(publicId) {

    progressBox.classList.add("hidden");

    successBox.classList.remove("hidden");

    const link =
        `${window.location.origin}/file.html?id=${publicId}`;

    publicLink.value = link;

    openBtn.href = link;

}

/* ==========================================
   RANDOM PUBLIC ID
========================================== */

function generatePublicId() {

    const chars =
        "abcdefghijklmnopqrstuvwxyz0123456789";

    let id = "";

    for (let i = 0; i < 6; i++) {

        id += chars.charAt(
            Math.floor(Math.random() * chars.length)
        );

    }

    return id;

}

/* ==========================================
   PART 3 STARTS BELOW
========================================== */

/* ==========================================
   COPY LINK
========================================== */

copyBtn.addEventListener("click", async () => {

    try {

        await navigator.clipboard.writeText(publicLink.value);

        showToast("Link Copied!");

    }

    catch {

        publicLink.select();

        document.execCommand("copy");

        showToast("Link Copied!");

    }

});

/* ==========================================
   OPEN FILE
========================================== */

openBtn.addEventListener("click", () => {

    // href is already assigned in showSuccess()

});

/* ==========================================
   UPLOAD ANOTHER FILE
========================================== */

newUploadBtn.addEventListener("click", resetUploader);

/* ==========================================
   RESET
========================================== */

function resetUploader() {

    selectedFile = null;

    fileInput.value = "";

    selectedBox.classList.add("hidden");

    progressBox.classList.add("hidden");

    successBox.classList.add("hidden");

    progressBar.style.width = "0%";

    progressText.textContent = "0%";

    publicLink.value = "";

    uploadBtn.disabled = false;

    uploadBtn.textContent = "Upload File";

}

/* ==========================================
   TOAST
========================================== */

function showToast(message) {

    toast.textContent = message;

    toast.classList.add("show");

    clearTimeout(toast.timer);

    toast.timer = setTimeout(() => {

        toast.classList.remove("show");

    }, 2500);

}

/* ==========================================
   KEYBOARD SHORTCUT
========================================== */

document.addEventListener("keydown", e => {

    if (
        (e.ctrlKey || e.metaKey) &&
        e.key.toLowerCase() === "v"
    ) {

        fileInput.focus();

    }

});

/* ==========================================
   PREVENT DEFAULT BROWSER DROP
========================================== */

["dragenter","dragover","drop"].forEach(event => {

    document.addEventListener(event, e => {

        e.preventDefault();

    });

});

document.addEventListener("drop", e => {

    e.preventDefault();

});

/* ==========================================
   INITIAL STATE
========================================== */

resetUploader();

console.log("✅ DropLink Ready");
