
"use client";

import { useEffect, useState } from "react";

const URL_API =
    "https://next-api-omega-ruby.vercel.app/api/urls?newer=true";

export default function UploadQrisPage() {
    const [apiUrl, setApiUrl] = useState("");
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState("");
    const [loading, setLoading] = useState(false);
    const [fetchingUrl, setFetchingUrl] = useState(true);
    const [message, setMessage] = useState("");
    const [success, setSuccess] = useState(false);

    useEffect(() => {

        async function fetchApiUrl() {
            try {
                const response = await fetch(URL_API, {
                    cache: "no-store",
                });

                if (!response.ok) {
                    throw new Error("Failed to fetch backend URL");
                }

                const data = await response.json();

                console.log("[QRIS] API response:", data);

                if (!Array.isArray(data) || !data[0]?.url) {
                    throw new Error("No backend URL available");
                }

                const url = new URL(data[0].url);

                if (!["http:", "https:"].includes(url.protocol)) {
                    throw new Error("Invalid backend URL");
                }

                console.log("[QRIS] Backend URL:", url.origin);

                setApiUrl(url.origin);
            } catch (error) {
                console.error("[QRIS] Failed to fetch backend URL:", error);

                setMessage(
                    error instanceof Error
                        ? error.message
                        : "Failed to fetch backend URL"
                );
            } finally {
                setFetchingUrl(false);
            }
        }


        fetchApiUrl();
    }, []);

    function handleFileChange(
        event: React.ChangeEvent<HTMLInputElement>
    ) {
        const selected = event.target.files?.[0];

        setMessage("");
        setSuccess(false);
        setFile(null);
        setPreview("");

        if (!selected) return;

        if (selected.type !== "image/jpeg") {
            setMessage("Please select a JPG/JPEG image.");
            return;
        }

        if (selected.size > 10 * 1024 * 1024) {
            setMessage("File size must be less than 10 MB.");
            return;
        }

        setFile(selected);
        setPreview(URL.createObjectURL(selected));
    }

    async function handleUpload(
        event: React.FormEvent<HTMLFormElement>
    ) {
        event.preventDefault();

        if (!apiUrl || !file) return;

        setLoading(true);
        setMessage("");
        setSuccess(false);

        try {
            const formData = new FormData();
            formData.append("file", file);

            const response = await fetch(
                `${apiUrl}/whatsapp/upload-qris`,
                {
                    method: "POST",
                    body: formData,
                }
            );

            const result = await response.json().catch(() => null);

            if (!response.ok) {
                throw new Error(
                    result?.message ||
                    result?.error ||
                    `Upload failed (${response.status})`
                );
            }

            setSuccess(true);
            setMessage("QRIS uploaded successfully! qris.jpg has been replaced.");
            setFile(null);
            setPreview("");
        } catch (error) {
            setMessage(
                error instanceof Error
                    ? error.message
                    : "Upload failed. Please try again."
            );
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="min-h-screen bg-gray-50 px-4 py-12 text-gray-900">
            <div className="mx-auto max-w-lg">
                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-bold">Upload QRIS</h1>
                    <p className="mt-2 text-gray-500">
                        Upload a new QRIS image to replace the existing one.
                    </p>
                </div>

                <form
                    onSubmit={handleUpload}
                    className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
                >
                    <div className="mb-5 rounded-lg bg-gray-50 p-3 text-sm">
                        <span className="font-medium">Backend status: </span>
                        {fetchingUrl ? (
                            <span className="text-gray-500">Finding backend...</span>
                        ) : apiUrl ? (
                            <span className="text-green-700">URL loaded</span>
                        ) : (
                            <span className="text-red-600">Unavailable</span>
                        )}
                    </div>

                    <label
                        htmlFor="qris-file"
                        className="mb-3 block text-sm font-semibold"
                    >
                        QRIS image (JPEG)
                    </label>

                    <label
                        htmlFor="qris-file"
                        className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 p-8 text-center hover:border-blue-500"
                    >
                        {preview ? (
                            <img
                                src={preview}
                                alt="QRIS preview"
                                className="max-h-64 max-w-full rounded-lg object-contain"
                            />
                        ) : (
                            <>
                                <span className="text-4xl">📷</span>
                                <span className="mt-3 font-medium">
                                    Choose a QRIS image
                                </span>
                                <span className="mt-1 text-sm text-gray-500">
                                    JPG/JPEG, maximum 10 MB
                                </span>
                            </>
                        )}
                    </label>

                    <input
                        id="qris-file"
                        type="file"
                        accept="image/jpeg,.jpg,.jpeg"
                        onChange={handleFileChange}
                        className="sr-only"
                    />

                    {file && (
                        <p className="mt-3 break-all text-sm text-gray-500">
                            Selected: {file.name}
                        </p>
                    )}

                    {message && (
                        <p
                            role="status"
                            className={`mt-4 rounded-lg p-3 text-sm ${success
                                    ? "bg-green-50 text-green-700"
                                    : "bg-red-50 text-red-700"
                                }`}
                        >
                            {message}
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={!file || !apiUrl || loading || fetchingUrl}
                        className="mt-6 w-full rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {loading
                            ? "Uploading..."
                            : fetchingUrl
                                ? "Finding backend..."
                                : "Upload QRIS"}
                    </button>

                    <p className="mt-4 text-center text-xs text-gray-500">
                        A successful upload replaces the existing qris.jpg file.
                    </p>
                </form>
            </div>
        </main>
    );
}
