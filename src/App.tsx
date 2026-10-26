import { useEffect, useRef } from "react";
import ShowcaseApp from "./ShowcaseApp";
import "./showcase.css";

const base = import.meta.env.BASE_URL;

declare global {
  interface Window {
    __LOS_BASADOS_MEDIA_API__?: string;
  }
}

function loadScript(src: string) {
  return new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = src;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`No se pudo cargar ${src}`));
    document.body.appendChild(script);
  });
}

export default function App() {
  const legacyRuntime = useRef<HTMLDivElement>(null);
  const communityChatHost = useRef<HTMLDivElement>(null);
  const communityRequestsHost = useRef<HTMLDivElement>(null);
  const communityDmHost = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;

    async function mountLegacyRuntime() {
      try {
        window.__LOS_BASADOS_MEDIA_API__ = import.meta.env.VITE_MEDIA_API_URL || "";
        const response = await fetch(`${base}legacy.html`);
        if (!response.ok) throw new Error(`No se pudo cargar el motor de la web (${response.status})`);
        const markup = await response.text();
        if (cancelled || !legacyRuntime.current) return;

        legacyRuntime.current.innerHTML = markup;
        const oldCommunityOverlay = legacyRuntime.current.querySelector<HTMLElement>("#onlineModal");
        const oldCommunityPanel = oldCommunityOverlay?.querySelector<HTMLElement>(".forum-modal-box");
        const chatContent = oldCommunityPanel?.querySelector<HTMLElement>("#forumChatContent");
        const requestsContent = oldCommunityPanel?.querySelector<HTMLElement>("#forumRequestsContent");
        const privateChat = legacyRuntime.current.querySelector<HTMLElement>("#privateChatModal");
        const deviceBadge = legacyRuntime.current.querySelector<HTMLElement>("#deviceBadge");
        chatContent?.querySelector(".online-users-sidebar")?.remove();
        if (chatContent && communityChatHost.current) communityChatHost.current.append(chatContent);
        if (requestsContent && communityRequestsHost.current) communityRequestsHost.current.append(requestsContent);
        if (privateChat && communityDmHost.current) communityDmHost.current.append(privateChat);
        if (deviceBadge) {
          deviceBadge.setAttribute("aria-label", "Ocultar indicador de dispositivo");
          deviceBadge.addEventListener("click", () => { deviceBadge.hidden = true; });
          document.body.append(deviceBadge);
        }
        oldCommunityOverlay?.remove();
        legacyRuntime.current.querySelectorAll<HTMLElement>(".modal-overlay").forEach((overlay) => {
          if (overlay.id !== "onlineModal") document.body.append(overlay);
        });
        legacyRuntime.current.querySelector(".twitch-player-container iframe")?.remove();

        await loadScript("https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js");
        await loadScript("https://www.gstatic.com/firebasejs/10.8.0/firebase-database-compat.js");
        await loadScript("https://www.gstatic.com/firebasejs/10.8.0/firebase-auth-compat.js");
        await loadScript(`${base}assets/js/main.js`);
        if (!cancelled) document.dispatchEvent(new Event("DOMContentLoaded", { bubbles: true }));
      } catch (error) {
        console.error("No se pudo iniciar el motor de Los Basados", error);
      }
    }

    void mountLegacyRuntime();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <>
      <ShowcaseApp communityChatHost={communityChatHost} communityRequestsHost={communityRequestsHost} communityDmHost={communityDmHost} />
      <div className="legacy-runtime" aria-hidden="true" hidden ref={legacyRuntime} />
    </>
  );
}
