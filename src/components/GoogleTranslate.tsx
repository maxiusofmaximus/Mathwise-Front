"use client";

import { useEffect, useState } from "react";

declare global {
  interface Window {
    google: any;
    googleTranslateElementInit: any;
  }
}

export function GoogleTranslate() {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    // Define the init function globally
    window.googleTranslateElementInit = () => {
      new window.google.translate.TranslateElement(
        {
          pageLanguage: "en",
          autoDisplay: false,
          // includedLanguages: 'en,es,fr,de,it,pt,zh-CN,ja', // Optional: limit languages
        },
        "google_translate_element"
      );
      setLoaded(true);
    };

    // Check if script is already present
    if (document.getElementById("google-translate-script")) {
      return;
    }

    // Load the script
    const script = document.createElement("script");
    script.id = "google-translate-script";
    script.src = "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
    script.async = true;
    document.body.appendChild(script);
  }, []);

  return (
    <div className="flex flex-col gap-2">
      <div id="google_translate_element" className="min-h-[40px]" />
      <style jsx global>{`
        /* Hide the Google top bar */
        .goog-te-banner-frame.skiptranslate {
          display: none !important;
        }
        body {
          top: 0px !important;
        }
        /* Style the gadget a bit */
        .goog-te-gadget {
          font-family: inherit !important;
          color: transparent !important;
        }
        .goog-te-gadget .goog-te-combo {
          padding: 8px;
          border-radius: 6px;
          border: 1px solid #e2e8f0;
          width: 100%;
          cursor: pointer;
        }
        /* Hide the "Powered by Google" text */
        .goog-te-gadget > span {
          display: none !important;
        }
      `}</style>
    </div>
  );
}
