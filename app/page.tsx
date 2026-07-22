"use client";

import Script from "next/script";
import Link from "next/link";
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

interface User {
  id: string;
  email: string;
  name: string | null;
  picture: string | null;
}

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential?: string }) => void;
          }) => void;
          renderButton: (
            parent: HTMLElement,
            options: {
              theme: "outline" | "filled_blue" | "filled_black";
              size: "large" | "medium" | "small";
              width?: number;
            }
          ) => void;
        };
      };
    };
  }
}

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
  const googleButtonRef = useRef<HTMLDivElement>(null);
  const [googleClientId, setGoogleClientId] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [sourceUrl, setSourceUrl] = useState("");
  const [resultUrl, setResultUrl] = useState("");
  const [error, setError] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [requestId, setRequestId] = useState("");
  const [user, setUser] = useState<User | null>(null);
  const [credits, setCredits] = useState(0);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

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

  useEffect(() => {
    async function loadUser() {
      const [meResponse, configResponse] = await Promise.all([
        fetch("/api/auth/me"),
        fetch("/api/config")
      ]);
      const data = (await meResponse.json().catch(() => null)) as {
        user?: User | null;
        credits?: number;
      } | null;
      const config = (await configResponse.json().catch(() => null)) as {
        googleClientId?: string;
      } | null;

      setUser(data?.user ?? null);
      setCredits(data?.credits ?? 0);
      setGoogleClientId(config?.googleClientId ?? "");
      setIsAuthLoading(false);
    }

    loadUser();
  }, []);

  useEffect(() => {
    renderGoogleButton();
  }, [googleClientId, user]);

  async function handleGoogleCredential(credential?: string) {
    if (!credential) {
      setError("Google sign-in did not return a credential.");
      return;
    }

    setError("");
    const response = await fetch("/api/auth/google", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ credential })
    });

    const data = (await response.json().catch(() => null)) as {
      user?: User;
      credits?: number;
      error?: string;
    } | null;

    if (!response.ok || !data?.user) {
      setError(data?.error || "Google sign-in failed. Please try again.");
      return;
    }

    setUser(data.user);
    setCredits(data.credits ?? 0);
  }

  function renderGoogleButton() {
    if (
      !googleClientId ||
      !window.google ||
      !googleButtonRef.current ||
      user
    ) {
      return;
    }

    googleButtonRef.current.innerHTML = "";
    window.google.accounts.id.initialize({
      client_id: googleClientId,
      callback: (response) => handleGoogleCredential(response.credential)
    });
    window.google.accounts.id.renderButton(googleButtonRef.current, {
      theme: "outline",
      size: "large",
      width: 260
    });
  }

  async function handleLogout() {
    await fetch("/api/auth/logout", {
      method: "POST"
    });

    setUser(null);
    setCredits(0);
    resetResult();
    setError("");
    window.setTimeout(renderGoogleButton, 0);
  }

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
    setRequestId(crypto.randomUUID());
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

    if (!user) {
      setError("Please sign in with Google before removing backgrounds.");
      return;
    }

    setError("");
    setIsProcessing(true);
    resetResult();

    const effectiveRequestId = requestId || crypto.randomUUID();
    const formData = new FormData();
    formData.append("image", file);
    formData.append("idempotencyKey", effectiveRequestId);

    try {
      const response = await fetch("/api/remove-background", {
        method: "POST",
        headers: {
          "Idempotency-Key": effectiveRequestId
        },
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
      setCredits((currentCredits) => Math.max(0, currentCredits - 1));
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Background removal failed. Please try again."
      );
      const data = (await fetch("/api/auth/me")
        .then((response) => response.json())
        .catch(() => null)) as { credits?: number } | null;
      setCredits(data?.credits ?? credits);
    } finally {
      setIsProcessing(false);
    }
  }

  return (
    <main className="min-h-screen">
      <Script
        async
        defer
        onLoad={renderGoogleButton}
        src="https://accounts.google.com/gsi/client"
      />
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-5">
        <Link className="text-base font-semibold tracking-[0.08em] text-neutral-950" href="/">
          IMAGE BG REMOVER
        </Link>
        <div className="flex items-center gap-3">
          {isAuthLoading ? (
            <span className="text-sm text-neutral-600">Checking sign-in...</span>
          ) : user ? (
            <>
              {user.picture ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  alt=""
                  className="h-8 w-8 rounded-full"
                  referrerPolicy="no-referrer"
                  src={user.picture}
                />
              ) : null}
              <span className="hidden max-w-44 truncate text-sm text-neutral-700 sm:inline">
                {user.email}
              </span>
              <span className="rounded-md bg-teal-50 px-3 py-2 text-sm font-semibold text-teal-800">
                {credits} credits
              </span>
              <button
                className="rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm font-semibold text-neutral-800 transition hover:border-neutral-500"
                onClick={handleLogout}
                type="button"
              >
                Sign out
              </button>
            </>
          ) : (
            <div ref={googleButtonRef} />
          )}
          <Link
            className="hidden text-sm font-semibold text-neutral-700 transition hover:text-neutral-950 sm:inline"
            href="/pricing"
          >
            Pricing
          </Link>
          <Link
            className="hidden text-sm font-semibold text-neutral-700 transition hover:text-neutral-950 sm:inline"
            href="/blog"
          >
            Blog
          </Link>
          <a
            className="rounded-md bg-neutral-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-teal-800"
            href="#tool"
          >
            Start
          </a>
        </div>
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
          {!user ? (
            <p className="mt-5 max-w-xl rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-800">
              Sign in with Google to remove backgrounds. Upload preview is available
              before signing in.
            </p>
          ) : null}
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
              disabled={!file || !user || isProcessing}
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
        <p>Uploaded images are processed in memory and are not stored on our servers.</p>
        <div className="mt-3 flex justify-center gap-4">
          <Link className="font-medium text-neutral-700 hover:text-neutral-950" href="/blog">
            Blog
          </Link>
          <Link className="font-medium text-neutral-700 hover:text-neutral-950" href="/privacy">
            Privacy Policy
          </Link>
          <Link className="font-medium text-neutral-700 hover:text-neutral-950" href="/terms">
            Terms of Service
          </Link>
        </div>
      </footer>
    </main>
  );
}
