import { supabase } from "./supabase.js";

import {
    STORAGE_BUCKET
} from "./config.js";

const params = new URLSearchParams(window.location.search);

const publicId = params.get("id");

const title = document.getElementById("title");

const preview = document.getElementById("preview");

const nameText = document.getElementById("name");

const sizeText = document.getElementById("size");

const downloadBtn = document.getElementById("downloadBtn");

loadFile();

async function loadFile(){

    if(!publicId){

        title.textContent="Invalid Link";

        return;

    }

    const { data, error } = await supabase
        .from("files")
        .select("*")
        .eq("public_id", publicId)
        .single();

    if(error || !data){

        title.textContent="File Not Found";

        return;

    }

    nameText.textContent = data.file_name;

    sizeText.textContent =
        (data.file_size / 1024 / 1024).toFixed(2) + " MB";

    const { data:urlData } =
        supabase.storage
            .from(STORAGE_BUCKET)
            .getPublicUrl(data.storage_path);

    const url = urlData.publicUrl;

    downloadBtn.href = url;

    /* IMAGE */

    if(data.file_type.startsWith("image/")){

        preview.innerHTML = `
            <img
                src="${url}"
                style="
                width:100%;
                border-radius:16px;
                margin:20px 0;
                ">
        `;

        return;

    }

    /* PDF */

    if(data.file_type==="application/pdf"){

        preview.innerHTML = `
            <iframe
                src="${url}"
                width="100%"
                height="700"
                style="
                border:none;
                border-radius:16px;
                margin:20px 0;
                ">
            </iframe>
        `;

        return;

    }

    /* WORD */

    if(data.file_type.includes("word")){

        preview.innerHTML=`
            <div
            style="
            text-align:center;
            font-size:70px;
            margin:30px 0;
            ">
            📄
            </div>

            <p
            style="
            text-align:center;
            color:#999;
            ">
            Preview not available.
            </p>
        `;

        return;

    }

    /* EXCEL */

    if(data.file_type.includes("spreadsheet")){

        preview.innerHTML=`
            <div
            style="
            text-align:center;
            font-size:70px;
            margin:30px 0;
            ">
            📊
            </div>

            <p
            style="
            text-align:center;
            color:#999;
            ">
            Preview not available.
            </p>
        `;

    }

}