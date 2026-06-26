import { supabase } from "./supabase.js";
import { STORAGE_BUCKET } from "./config.js";

/* ==========================================
   DOM
========================================== */

const title = document.getElementById("title");

const preview = document.getElementById("preview");

const name = document.getElementById("name");

const size = document.getElementById("size");

const icon = document.getElementById("icon");

const downloadBtn =
document.getElementById("downloadBtn");

/* ==========================================
   URL
========================================== */

const params =
new URLSearchParams(window.location.search);

const publicId =
params.get("id");

loadFile();

/* ==========================================
   LOAD FILE
========================================== */

async function loadFile(){

    if(!publicId){

        title.textContent="Invalid Link";

        return;

    }

    const {data,error}=await supabase

    .from("files")

    .select("*")

    .eq("public_id",publicId)

    .single();

    if(error || !data){

        title.textContent="File Not Found";

        return;

    }

    title.textContent=data.file_name;

    name.textContent=data.file_name;

    size.textContent=formatSize(data.file_size);

    icon.textContent=getIcon(data.file_type);

    const {data:urlData}=

    supabase.storage

    .from(STORAGE_BUCKET)

    .getPublicUrl(data.storage_path);

    const url=urlData.publicUrl;

    downloadBtn.href=url;

    showPreview(url,data.file_type);

}

/* ==========================================
   PREVIEW
========================================== */

function showPreview(url,type){

    if(type.startsWith("image/")){

        preview.innerHTML=`

        <img

        src="${url}"

        alt="image"

        >

        `;

        return;

    }

    if(type==="application/pdf"){

        preview.innerHTML=`

        <iframe

        src="${url}"

        height="700"

        ></iframe>

        `;

        return;

    }

    preview.innerHTML=`

    <div
    style="

    text-align:center;

    font-size:90px;

    padding:40px;

    ">

    ${getIcon(type)}

    </div>

    `;

}

/* ==========================================
   ICONS
========================================== */

function getIcon(type){

    if(type.startsWith("image/"))

        return "🖼️";

    if(type==="application/pdf")

        return "📕";

    if(type.includes("word"))

        return "📄";

    if(type.includes("spreadsheet"))

        return "📊";

    return "📁";

}

/* ==========================================
   SIZE
========================================== */

function formatSize(bytes){

    if(bytes<1024)

        return bytes+" B";

    if(bytes<1024*1024)

        return (bytes/1024).toFixed(1)+" KB";

    return (bytes/1024/1024).toFixed(2)+" MB";

}
