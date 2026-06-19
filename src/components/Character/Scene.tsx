import { useEffect, useRef } from "react";
import * as THREE from "three";
import setCharacter from "./utils/character";
import setLighting from "./utils/lighting";
import { useLoading } from "../../context/LoadingProvider";
import handleResize from "./utils/resizeUtils";
import {
  handleMouseMove,
  handleTouchEnd,
  handleHeadRotation,
  handleTouchMove,
} from "./utils/mouseUtils";
import setAnimations from "./utils/animationUtils";
import { setProgress } from "../Loading";
import { setCharTimeline, setAllTimeline } from "../utils/GsapScroll";
import gsap from "gsap";

const Scene = () => {
  const canvasDiv = useRef<HTMLDivElement | null>(null);
  const hoverDivRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  if (!sceneRef.current) {
    sceneRef.current = new THREE.Scene();
  }
  const { setLoading } = useLoading();

  useEffect(() => {
    const currentCanvasDiv = canvasDiv.current;
    if (currentCanvasDiv) {
      let rect = currentCanvasDiv.getBoundingClientRect();
      let container = { width: rect.width, height: rect.height };
      const aspect = container.width / container.height;
      const scene = sceneRef.current!;

      const isMobile = /Mobi|Android/i.test(navigator.userAgent);
      const renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: !isMobile,
        powerPreference: "high-performance",
        precision: isMobile ? "mediump" : "highp",
      });
      renderer.setSize(container.width, container.height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1;
      currentCanvasDiv.appendChild(renderer.domElement);

      const camera = new THREE.PerspectiveCamera(14.5, aspect, 0.1, 1000);
      camera.position.z = 10;
      camera.position.set(0, 13.1, 24.7);
      camera.zoom = 1.1;
      camera.updateProjectionMatrix();

      let headBone: THREE.Object3D | null = null;
      let screenLight: any | null = null;
      let mixer: THREE.AnimationMixer;

      const clock = new THREE.Clock();

      const light = setLighting(scene);
      let progress = setProgress((value) => setLoading(value));
      const { loadCharacter } = setCharacter(renderer, scene, camera);

      let activeCharacter: THREE.Object3D | null = null;
      const onResize = () => {
        if (activeCharacter) {
          handleResize(renderer, camera, canvasDiv, activeCharacter);
        }
      };
      window.addEventListener("resize", onResize);

      let isMounted = true;
      let hoverCleanup: (() => void) | undefined;
      const gsapCtx = gsap.context(() => {});

      Promise.all([loadCharacter(), light.loadEnvironment()]).then(([gltf, env]) => {
        if (!isMounted) {
          if (gltf) {
            gltf.scene.traverse((object: any) => {
              if (object.isMesh) {
                object.geometry.dispose();
                if (Array.isArray(object.material)) {
                  object.material.forEach((mat: any) => mat.dispose());
                } else {
                  object.material.dispose();
                }
              }
            });
          }
          if (env) env.dispose();
          return;
        }

        if (gltf) {
          const animations = setAnimations(gltf);
          if (hoverDivRef.current) {
            hoverCleanup = animations.hover(gltf, hoverDivRef.current);
          }
          mixer = animations.mixer;
          let character = gltf.scene;
          activeCharacter = character;
          scene.add(character);
          headBone = character.getObjectByName("spine006") || null;
          screenLight = character.getObjectByName("screenlight") || null;

          gsapCtx.add(() => {
            setCharTimeline(character, camera);
            setAllTimeline();
          });

          progress.loaded().then(() => {
            setTimeout(() => {
              light.turnOnLights();
              animations.startIntro();
            }, 1050);
          });
        }
      });

      let mouse = { x: 0, y: 0 },
        interpolation = { x: 0.1, y: 0.2 };

      const onMouseMove = (event: MouseEvent) => {
        handleMouseMove(event, (x, y) => (mouse = { x, y }));
      };
      let debounce: number | undefined;
      let touchMoveHandler: ((e: TouchEvent) => void) | null = null;
      const onTouchStart = (event: TouchEvent) => {
        const element = event.target as HTMLElement;
        debounce = window.setTimeout(() => {
          touchMoveHandler = (e: TouchEvent) =>
            handleTouchMove(e, (x, y) => (mouse = { x, y }));
          element?.addEventListener("touchmove", touchMoveHandler);
        }, 200);
      };

      const onTouchEnd = (event: TouchEvent) => {
        const element = event.target as HTMLElement;
        if (touchMoveHandler) {
          element?.removeEventListener("touchmove", touchMoveHandler);
          touchMoveHandler = null;
        }
        handleTouchEnd((x, y, interpolationX, interpolationY) => {
          mouse = { x, y };
          interpolation = { x: interpolationX, y: interpolationY };
        });
      };

      document.addEventListener("mousemove", onMouseMove);
      const landingDiv = document.getElementById("landingDiv");
      if (landingDiv) {
        landingDiv.addEventListener("touchstart", onTouchStart);
        landingDiv.addEventListener("touchend", onTouchEnd);
      }
      
      let animationFrameId: number;
      const animate = () => {
        animationFrameId = requestAnimationFrame(animate);
        if (headBone) {
          handleHeadRotation(
            headBone,
            mouse.x,
            mouse.y,
            interpolation.x,
            interpolation.y,
            THREE.MathUtils.lerp
          );
          light.setPointLight(screenLight);
        }
        const delta = clock.getDelta();
        if (mixer) {
          mixer.update(delta);
        }
        renderer.render(scene, camera);
      };
      animate();

      return () => {
        isMounted = false;
        progress.cancel();
        cancelAnimationFrame(animationFrameId);
        clearTimeout(debounce);
        
        // Traverse and dispose of scene meshes to prevent GPU memory leaks
        scene.traverse((object: any) => {
          if (object.isMesh) {
            object.geometry.dispose();
            if (Array.isArray(object.material)) {
              object.material.forEach((mat: any) => mat.dispose());
            } else {
              object.material.dispose();
            }
          }
        });
        if (scene.environment) {
          scene.environment.dispose();
        }
        scene.clear();
        renderer.dispose();
        
        window.removeEventListener("resize", onResize);
        
        if (currentCanvasDiv) {
          currentCanvasDiv.removeChild(renderer.domElement);
        }
        document.removeEventListener("mousemove", onMouseMove);
        if (landingDiv) {
          landingDiv.removeEventListener("touchstart", onTouchStart);
          landingDiv.removeEventListener("touchend", onTouchEnd);
        }
        if (hoverCleanup) {
          hoverCleanup();
        }
        gsapCtx.revert();
      };
    }
  }, []);

  return (
    <>
      <div className="character-container">
        <div className="character-model" ref={canvasDiv}>
          <div className="character-rim"></div>
          <div className="character-hover" ref={hoverDivRef}></div>
        </div>
      </div>
    </>
  );
};

export default Scene;
