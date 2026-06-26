import { supabase } from "./supabase.js";

import {
    MAX_FILE_SIZE,
    ALLOWED_TYPES,
    STORAGE_BUCKET,
    SITE_URL
} from "./config.js";

const dropArea = document.getElementById("dropArea");
const fileInput = document.getElementById("fileInput");
const browseBtn = document.getElementById("browseBtn");

const fileInfo = document.getElementById("fileInfo");
const fileName = document.getElementById("fileName");
const fileSize = document.getElementById("fileSize");

const uploadBtn = document.getElementById("uploadBtn");

const progressCard = document.getElementById("progressCard");
const progressBar = document.getElementById("progressBar");
const progressText = document.getElementById("progressText");

const resultCard = document.getElementById("resultCard");
const publicLink = document.getElementById("publicLink");

const copyBtn = document.getElementById("copyBtn");
const openBtn = document.getElementById("openBtn");

const toast = document.getElementById("toast");

let selectedFile = null;

/* ===========================
   Browse
=========================== */

browseBtn.onclick = () => fileInput.click();

dropArea.onclick = () => fileInput.click();

fileInput.onchange = () => {

    if(fileInput.files.length){

        handleFile(fileInput.files[0]);

    }

};

/* ===========================
   Drag & Drop
=========================== */

["dragenter","dragover"].forEach(event => {

    dropArea.addEventListener(event,e=>{

        e.preventDefault();

        dropArea.classList.add("dragover");

    });

});

["dragleave","drop"].forEach(event=>{

    dropArea.addEventListener(event,e=>{

        e.preventDefault();

        dropArea.classList.remove("dragover");

    });

});

dropArea.addEventListener("drop",e=>{

    if(e.dataTransfer.files.length){

        handleFile(e.dataTransfer.files[0]);

    }

});

/* ===========================
   Handle File
=========================== */

function handleFile(file){

    if(!ALLOWED_TYPES.includes(file.type)){

        alert("Unsupported file type.");

        return;

    }

    if(file.size > MAX_FILE_SIZE){

        alert("Maximum file size is 10 MB.");

        return;

    }

    selectedFile = file;

    fileName.textContent = file.name;

    fileSize.textContent =
        (file.size / 1024 / 1024).toFixed(2) + " MB";

    fileInfo.classList.remove("hidden");

fileInfo.scrollIntoView({
    behavior: "smooth",
    block: "center"
});
    
}

/* ===========================
   Upload
=========================== */

uploadBtn.onclick = async ()=>{

    if(!selectedFile) return;

    progressCard.classList.remove("hidden");

    uploadBtn.disabled = true;

    simulateProgress();

    const extension =
        selectedFile.name.split(".").pop();

    const storageName =
        crypto.randomUUID()+"."+extension;

    const publicId =
        generatePublicId();

    /* Upload */

    const { error:uploadError } =
    await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(storageName,selectedFile,{

            cacheControl:"3600",

            upsert:false

        });

    if(uploadError){

        alert(uploadError.message);

        uploadBtn.disabled=false;

        return;

    }

    /* Save Metadata */

    const { error:dbError } =
    await supabase
        .from("files")
        .insert({
    public_id: publicId,
    file_name: selectedFile.name,
    file_type: selectedFile.type,
    file_size: selectedFile.size,
    storage_path: storageName
});

    if(dbError){

        alert(dbError.message);

        uploadBtn.disabled=false;

        return;

    }

    progressBar.style.width="100%";

    progressText.textContent="100%";

    resultCard.classList.remove("hidden");

resultCard.scrollIntoView({
    behavior: "smooth",
    block: "center"
});

    const link =
        `${SITE_URL}/file.html?id=${publicId}`;

    publicLink.value = link;

    openBtn.href = link;

};

/* ===========================
   Copy
=========================== */

copyBtn.onclick = async ()=>{

    await navigator.clipboard.writeText(publicLink.value);

    toast.classList.add("show");

    setTimeout(()=>{

        toast.classList.remove("show");

    },2500);

};

/* ===========================
   Progress Animation
=========================== */

function simulateProgress(){

    let value=0;

    const timer=setInterval(()=>{

        value+=5;

        if(value>=95){

            clearInterval(timer);

            return;

        }

        progressBar.style.width=value+"%";

        progressText.textContent=value+"%";

    },120);

}

/* ===========================
   Random Public ID
=========================== */

function generatePublicId(){

    return Math.random()
        .toString(36)
        .substring(2,8);

}
