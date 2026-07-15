"use client";

import { ChangeEvent, FormEvent, useEffect, useMemo, useRef, useState } from "react";

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const SUPPORTED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

const useCases = [
  "Product photos",
  "Profile pictures",
  "Social media posts",
  "Marketplace listings"
];

const faqs = [
  {
    question: "Is this image background remover free?",
    answer:
      "The MVP can be used without creating an account. Actual usage may depend on the Remove.bg API quota configured by the site owner."
  },
  {
    question: "What image formats are supported?",
    answer: "JPG, PNG, and WebP images are supported up to 10MB."
  },
  {
    question: "Do you store my uploaded images?",
    answer:
      "This app does not store uploaded images. Images are processed in memory and sent to Remove.bg for background removal."
  },
  {
    question: "Can I download a transparent PNG?",
    answer: "Yes. Successful background removal returns a transparent PNG download."
  }
];

function validateFile(file: File) {
  if (!SUPPORTED_TYPES.has(file.type)) {
    return "Please upload a JPG, PNG, or WebP image.";
  }

  if (file.size > MAX_FILE_SIZE) {
    return "The image is too large. Please upload an image under 10MB.";
  }

  return "";
}

export default function Home() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [sourceUrl, setSourceUrl] = useState("");
  const [resultUrl, setResultUrl] = useState("");
  const [error, setError] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const formattedSize = useMemo(() => {
    if (!file) {
      return "";
    }

    return `${(file.size / 1024 / 1024).toFixed(2)} MB`;
  }, [file]);

  useEffect(() => {
    return () => {
      if (sourceUrl) {
        URL.revokeObjectURL(sourceUrl);
      }

      if (resultUrl) {
        URL.revokeObjectURL(resultUrl);
      }
    };
  }, [sourceUrl, resultUrl]);

  function resetResult() {
    if (resultUrl) {
      URL.revokeObjectURL(resultUrl);
    }

    setResultUrl("");
  }

  function handleFile(nextFile: File) {
    const validationError = validateFile(nextFile);

    setError(validationError);
    resetResult();

    if (sourceUrl) {
      URL.revokeObjectURL(sourceUrl);
    }

    if (validationError) {
      setFile(null);
      setSourceUrl("");
      return;
    }

    setFile(nextFile);
    setSourceUrl(URL.createObjectURL(nextFile));
  }

  function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
    const nextFile = event.target.files?.[0];

    if (nextFile) {
      handleFile(nextFile);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!file || isProcessing) {
      return;
    }

    setError("");
    setIsProcessing(true);
    resetResult();

    const formData = new FormData();
    formData.append("image", file);

    try {
      const response = await fetch("/api/remove-background", {
        method: "POST",
        body: formData
      });

      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as {
          error?: string;
        } | null;
        throw new Error(data?.error || "Background removal failed. Please try again.");
      }

      const blob = await response.blob();
      setResultUrl(URL.createObjectURL(blob));
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Background removal failed. Please try again."
      );
    } finally {
      setIsProcessing(false);
    }
  }

  return (
    <main className="min-h-screen">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-5">
        <a className="text-base font-semibold tracking-[0.08em] text-neutral-950" href="#">
          IMAGE BG REMOVER
        </a>
        <a
          className="rounded-md bg-neutral-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-teal-800"
          href="#tool"
        >
          Start
        </a>
      </header>

      <section className="mx-auto grid w-full max-w-6xl gap-8 px-5 pb-12 pt-6 lg:grid-cols-[0.92fr_1.08fr] lg:items-center lg:pt-10">
        <div>
          <p className="mb-4 inline-flex rounded-full border border-teal-700/30 bg-white/70 px-3 py-1 text-sm font-medium text-teal-800">
            Online background remover
          </p>
          <h1 className="max-w-3xl text-5xl font-semibold leading-[1.02] text-neutral-950 sm:text-6xl">
            Image Background Remover
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-neutral-700">
            Remove image backgrounds automatically and download transparent PNGs in
            seconds. Fast, simple, and no signup required.
          </p>
          <div className="mt-7 flex flex-wrap gap-3 text-sm text-neutral-700">
            <span className="rounded-md bg-white/75 px-3 py-2 shadow-sm">JPG</span>
            <span className="rounded-md bg-white/75 px-3 py-2 shadow-sm">PNG</span>
            <span className="rounded-md bg-white/75 px-3 py-2 shadow-sm">WebP</span>
            <span className="rounded-md bg-white/75 px-3 py-2 shadow-sm">Up to 10MB</span>
          </div>
        </div>

        <form
          id="tool"
          onSubmit={handleSubmit}
          className="rounded-lg border border-neutral-200 bg-white p-4 shadow-xl shadow-neutral-900/10 sm:p-5"
        >
          <div className="grid gap-4 md:grid-cols-2">
            <section className="flex min-h-80 flex-col rounded-md border border-dashed border-neutral-300 bg-neutral-50 p-4">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-base font-semibold text-neutral-950">Original</h2>
                {file ? <span className="text-xs text-neutral-500">{formattedSize}</span> : null}
              </div>

              <button
                className="mt-4 flex flex-1 cursor-pointer flex-col items-center justify-center rounded-md border border-neutral-200 bg-white px-4 py-8 text-center transition hover:border-teal-700 hover:bg-teal-50 disabled:cursor-not-allowed disabled:opacity-70"
                disabled={isProcessing}
                onClick={() => inputRef.current?.click()}
                type="button"
              >
                {sourceUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    alt="Uploaded preview"
                    className="max-h-64 w-full rounded-md object-contain"
                    src={sourceUrl}
                  />
                ) : (
                  <>
                    <span className="text-lg font-semibold text-neutral-950">Upload Image</span>
                    <span className="mt-2 text-sm leading-6 text-neutral-600">
                      Choose a JPG, PNG, or WebP image under 10MB.
                    </span>
                  </>
                )}
              </button>

              <input
                ref={inputRef}
                accept="image/jpeg,image/png,image/webp"
                className="sr-only"
                onChange={handleInputChange}
                type="file"
              />
            </section>

            <section className="flex min-h-80 flex-col rounded-md border border-neutral-200 bg-[linear-gradient(45deg,#f3f4f6_25%,transparent_25%),linear-gradient(-45deg,#f3f4f6_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#f3f4f6_75%),linear-gradient(-45deg,transparent_75%,#f3f4f6_75%)] bg-[length:24px_24px] bg-[position:0_0,0_12px,12px_-12px,-12px_0] p-4">
              <h2 className="text-base font-semibold text-neutral-950">Result</h2>
              <div className="mt-4 flex flex-1 items-center justify-center rounded-md bg-white/70 p-4">
                {resultUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    alt="Background removed preview"
                    className="max-h-64 w-full rounded-md object-contain"
                    src={resultUrl}
                  />
                ) : (
                  <p className="max-w-64 text-center text-sm leading-6 text-neutral-600">
                    Your transparent PNG will appear here after background removal.
                  </p>
                )}
              </div>
            </section>
          </div>

          {error ? (
            <p className="mt-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </p>
          ) : null}

          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <button
              className="rounded-md bg-teal-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:bg-neutral-300"
              disabled={!file || isProcessing}
              type="submit"
            >
              {isProcessing ? "Removing..." : "Remove Background"}
            </button>
            <a
              className={`rounded-md px-5 py-3 text-center text-sm font-semibold transition ${
                resultUrl
                  ? "bg-neutral-950 text-white hover:bg-neutral-800"
                  : "pointer-events-none bg-neutral-200 text-neutral-500"
              }`}
              download="background-removed.png"
              href={resultUrl || "#"}
            >
              Download PNG
            </a>
          </div>
        </form>
      </section>

      <section className="border-y border-neutral-200 bg-white/70">
        <div className="mx-auto grid max-w-6xl gap-8 px-5 py-12 md:grid-cols-3">
          <div>
            <h2 className="text-2xl font-semibold text-neutral-950">How it works</h2>
            <p className="mt-3 text-sm leading-6 text-neutral-600">
              Upload an image, remove the background automatically, then download the
              result as a transparent PNG.
            </p>
          </div>
          <div className="rounded-md border border-neutral-200 bg-white p-5">
            <p className="text-sm font-semibold text-teal-800">Step 1</p>
            <h3 className="mt-2 text-lg font-semibold">Upload your image</h3>
            <p className="mt-2 text-sm leading-6 text-neutral-600">
              Use a JPG, PNG, or WebP file. The app validates files before processing.
            </p>
          </div>
          <div className="rounded-md border border-neutral-200 bg-white p-5">
            <p className="text-sm font-semibold text-teal-800">Step 2</p>
            <h3 className="mt-2 text-lg font-semibold">Download transparent PNG</h3>
            <p className="mt-2 text-sm leading-6 text-neutral-600">
              The result is returned directly to your browser without storing it here.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-12">
        <h2 className="text-2xl font-semibold text-neutral-950">Use cases</h2>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {useCases.map((item) => (
            <div key={item} className="rounded-md border border-neutral-200 bg-white p-4">
              <h3 className="font-semibold text-neutral-950">{item}</h3>
              <p className="mt-2 text-sm leading-6 text-neutral-600">
                Remove background from image files and create clean transparent PNGs.
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-neutral-950 text-white">
        <div className="mx-auto max-w-6xl px-5 py-12">
          <h2 className="text-2xl font-semibold">FAQ</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {faqs.map((faq) => (
              <div key={faq.question} className="rounded-md border border-white/10 p-5">
                <h3 className="font-semibold">{faq.question}</h3>
                <p className="mt-2 text-sm leading-6 text-neutral-300">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="px-5 py-8 text-center text-sm text-neutral-600">
        Uploaded images are processed in memory and are not stored on our servers.
      </footer>
    </main>
  );
}
