import { useEffect, useRef } from "react";
import "./styles/Cursor.css";
import gsap from "gsap";

const Cursor = () => {
  const cursorRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let hover = false;
    let cursorActive = false;
    const cursor = cursorRef.current!;
    const mousePos = { x: 0, y: 0 };
    const cursorPos = { x: 0, y: 0 };

    cursor.classList.add("cursor-hide-circle");

    let isInsideLogo = false;

    const onDocumentClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const isLogoOrLoader =
        target.classList.contains("navbar-title") ||
        !!target.closest(".navbar-title") ||
        target.classList.contains("loader-title") ||
        !!target.closest(".loader-title");

      if (isLogoOrLoader) {
        cursorActive = true;
        cursor.classList.remove("cursor-hide-circle");
      }
    };

    const onDocumentHover = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const isLogoOrLoader =
        target.classList.contains("navbar-title") ||
        !!target.closest(".navbar-title") ||
        target.classList.contains("loader-title") ||
        !!target.closest(".loader-title");

      if (isLogoOrLoader) {
        if (!isInsideLogo) {
          if (cursorActive) {
            cursor.classList.add("cursor-hide-circle");
            cursorActive = false;
          }
          isInsideLogo = true;
        }
      } else {
        if (isInsideLogo) {
          isInsideLogo = false;
        }
      }
    };

    document.addEventListener("click", onDocumentClick);
    document.addEventListener("mouseover", onDocumentHover);

    const onMouseMove = (e: MouseEvent) => {
      mousePos.x = e.clientX;
      mousePos.y = e.clientY;
    };
    document.addEventListener("mousemove", onMouseMove);

    let animFrameId: number;
    function loop() {
      if (!hover) {
        const delay = 6;
        cursorPos.x += (mousePos.x - cursorPos.x) / delay;
        cursorPos.y += (mousePos.y - cursorPos.y) / delay;
        cursor.style.transform = `translate3d(${cursorPos.x}px, ${cursorPos.y}px, 0)`;
      }
      animFrameId = requestAnimationFrame(loop);
    }
    animFrameId = requestAnimationFrame(loop);

    const items = document.querySelectorAll("[data-cursor]");
    const hoverHandlers: Array<{
      element: HTMLElement;
      over: (e: MouseEvent) => void;
      out: () => void;
    }> = [];

    items.forEach((item) => {
      const element = item as HTMLElement;
      const over = (e: MouseEvent) => {
        const target = e.currentTarget as HTMLElement;
        const rect = target.getBoundingClientRect();

        if (element.dataset.cursor === "icons") {
          cursor.classList.add("cursor-icons");
          gsap.to(cursor, { x: rect.left, y: rect.top, duration: 0.1 });
          cursor.style.setProperty("--cursorH", `${rect.height}px`);
          hover = true;
        }
        if (element.dataset.cursor === "disable") {
          cursor.classList.add("cursor-disable");
        }
      };
      const out = () => {
        cursor.classList.remove("cursor-disable", "cursor-icons");
        hover = false;
      };
      element.addEventListener("mouseover", over);
      element.addEventListener("mouseout", out);
      hoverHandlers.push({ element, over, out });
    });

    return () => {
      document.removeEventListener("click", onDocumentClick);
      document.removeEventListener("mouseover", onDocumentHover);
      document.removeEventListener("mousemove", onMouseMove);
      cancelAnimationFrame(animFrameId);
      hoverHandlers.forEach(({ element, over, out }) => {
        element.removeEventListener("mouseover", over);
        element.removeEventListener("mouseout", out);
      });
    };
  }, []);

  return <div className="cursor-main" ref={cursorRef}></div>;
};

export default Cursor;
