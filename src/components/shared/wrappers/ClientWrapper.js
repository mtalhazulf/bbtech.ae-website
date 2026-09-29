"use client";
import animateInvertText from "@/libs/animateInvertText";
import arrangeAnim from "@/libs/arrangeAnim";
import arrangeAnim2 from "@/libs/arrangeAnim2";
import fadeInRightOnScrollAnim from "@/libs/fadeInRightOnScrollAnim";
import { gsap, useGSAP } from "@/libs/gsap.config";
import initSmoothScroller from "@/libs/initSmoothScroller";
import onePageNavAnim from "@/libs/onePageNavAnim";
import progressBar from "@/libs/progressBar";
import sidebarSticky from "@/libs/sidebarSticky";
import smoothScrollToTop from "@/libs/smoothScrollToTop";
import textReavealAnim from "@/libs/textReavealAnim";
import titleAnim from "@/libs/titleAnim";
import titleAnim2 from "@/libs/titleAnim2";
import titleAnim3 from "@/libs/titleAnim3";
import tjImageParallex from "@/libs/tjImageParallex";
import tjLeftSwipeAnimation from "@/libs/tjLeftSwipeAnimation";
import tjMagicCursorAnimation from "@/libs/tjMagicCursorAnimation";
import tjProgressAnimation from "@/libs/tjProgressAnimation";
import tjRightSwipeAnimation from "@/libs/tjRightSwipeAnimation";
import tjScrollSlider from "@/libs/tjScrollSlider";
import tjStackAnimation from "@/libs/tjStackAnimation";
import tjStackAnimation2 from "@/libs/tjStackAnimation2";
import tjStackAnimation3 from "@/libs/tjStackAnimation3";
import tjZoomInScroll from "@/libs/tjZoomInScroll";
import { useEffect } from "react";
// DESIGN.md §9: the template had no prefers-reduced-motion handling at all. WOW,
// ScrollSmoother, and the SplitText-based title reveals (titleAnim/2/3,
// textReavealAnim, animateInvertText) are the ones explicitly called out to skip;
// everything else here is a plain scroll-triggered tween, not motion-sickness-grade
// movement, so it's left running either way.
const START_ANIM_CLASSES = [".title-anim", ".text-anim", ".hero-text-anim"];

// Elements the skipped SplitText modules would otherwise reveal (each one adds
// "start-anim" itself once it runs) — reduced motion must still leave them visible.
function revealWithoutSplitText() {
	START_ANIM_CLASSES.forEach(selector => {
		document.querySelectorAll(selector).forEach(el => el.classList.add("start-anim"));
	});
}

const ClientWrapper = () => {
	useEffect(() => {
		const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
		if (reduceMotion) {
			revealWithoutSplitText();
		} else {
			import("wow.js").then(({ default: WOW }) => {
				new WOW().init();
			});
		}
		smoothScrollToTop();
		const cleanup = tjMagicCursorAnimation();
		return () => {
			if (cleanup) cleanup();
		};
	}, []);
	useGSAP((context, contextSafe) => {
		const mm = gsap.matchMedia();
		mm.add(
			{ reduceMotion: "(prefers-reduced-motion: reduce)", fullMotion: "(prefers-reduced-motion: no-preference)" },
			({ conditions: { reduceMotion } }) => {
				if (!reduceMotion) {
					initSmoothScroller();
					titleAnim();
					titleAnim2();
					titleAnim3();
					textReavealAnim();
					animateInvertText();
				} else {
					revealWithoutSplitText();
				}
				tjRightSwipeAnimation();
				tjLeftSwipeAnimation();
				sidebarSticky();
				arrangeAnim();
				arrangeAnim2();
				fadeInRightOnScrollAnim();
				onePageNavAnim(contextSafe);
				progressBar();
				tjStackAnimation();
				tjScrollSlider();
				tjStackAnimation2();
				tjImageParallex();
				tjProgressAnimation();
				tjZoomInScroll();
				tjStackAnimation3();
			}
		);
		return () => mm.revert();
	});
	return null;
};

export default ClientWrapper;
