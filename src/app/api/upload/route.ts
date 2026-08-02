import { NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ success: false, error: "Tidak ada file yang diunggah" }, { status: 400 });
    }

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY || process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;
    const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET || process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

    // Fallback: If no Cloudinary config set yet, return error asking to set env variables
    if (!cloudName) {
      return NextResponse.json(
        {
          success: false,
          error: "Cloudinary belum dikonfigurasi. Harap sertakan CLOUDINARY_CLOUD_NAME di file .env.local",
        },
        { status: 400 }
      );
    }

    const targetFolder = "mulia-luxury-properties";
    const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;

    const cloudFormData = new FormData();
    cloudFormData.append("file", file);
    cloudFormData.append("folder", targetFolder);

    if (apiKey && apiSecret) {
      // Signed Upload
      const timestamp = Math.floor(Date.now() / 1000).toString();
      const stringToSign = `folder=${targetFolder}&timestamp=${timestamp}${apiSecret}`;
      const signature = crypto.createHash("sha1").update(stringToSign).digest("hex");

      cloudFormData.append("api_key", apiKey);
      cloudFormData.append("timestamp", timestamp);
      cloudFormData.append("signature", signature);
    } else if (uploadPreset) {
      // Unsigned Upload using Upload Preset
      cloudFormData.append("upload_preset", uploadPreset);
    } else {
      return NextResponse.json(
        {
          success: false,
          error: "Harap set CLOUDINARY_API_KEY & CLOUDINARY_API_SECRET atau CLOUDINARY_UPLOAD_PRESET di .env.local",
        },
        { status: 400 }
      );
    }

    const response = await fetch(cloudinaryUrl, {
      method: "POST",
      body: cloudFormData,
    });

    const data = await response.json();

    if (!response.ok || data.error) {
      throw new Error(data.error?.message || "Gagal mengunggah gambar ke Cloudinary");
    }

    return NextResponse.json({
      success: true,
      url: data.secure_url,
      public_id: data.public_id,
    });
  } catch (error: any) {
    console.error("Cloudinary upload error:", error);
    return NextResponse.json({ success: false, error: error.message || "Gagal mengunggah foto" }, { status: 500 });
  }
}
