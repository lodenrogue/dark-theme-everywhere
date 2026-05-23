const injectDarkMode = () => {
    chrome.storage.local.get({ darkModeElement: true }, (data) => {
	if (!data.darkModeElement) {
	    removeDarkMode();
	    return;
	}

	// 1. Get computed style safely from HTML or Body, fallback to white if empty
	const htmlStyle = window.getComputedStyle(document.documentElement);
	const bodyStyle = document.body ? window.getComputedStyle(document.body) : null;
	
	let bodyBgColor = htmlStyle.backgroundColor;
	if ((!bodyBgColor || bodyBgColor === 'rgba(0, 0, 0, 0)' || bodyBgColor === 'transparent') && bodyStyle) {
	    bodyBgColor = bodyStyle.backgroundColor;
	}

	// 2. Parse RGB values to calculate brightness
	const rgb = bodyBgColor ? bodyBgColor.match(/\d+/g) : null;
	if (rgb && rgb.length >= 3) {
	    const r = parseInt(rgb[0]), g = parseInt(rgb[1]), b = parseInt(rgb[2]);
	    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
	    
	    // If the page layout is already dark (brightness under 100), skip inversion
	    if (brightness < 100) {
		removeDarkMode();
		return;
	    }
	}

	if (document.getElementById('custom-force-dark-mode')) return;

	// 3. Apply the smart inversion stylesheet
	const style = document.createElement('style');
	style.id = 'custom-force-dark-mode';
	style.textContent = `
      /* Invert the root frame and main structural containers */
      html, body, #page-wrapper, main {
        filter: invert(1) hue-rotate(180deg) !important;
        background-color: #fff !important;
      }
      
      /* Protect images, videos, media players, and specific background vectors */
      img, video, canvas, svg, [style*="background-image"], .video-stream, .picture {
        filter: invert(1) hue-rotate(180deg) !important;
      }
      
      /* Keep page rendering transitions smooth */
      * {
        transition: background 0.1s ease, color 0.1s ease !important;
      }
    `;
	(document.head || document.documentElement).appendChild(style);
    });
};

const removeDarkMode = () => {
    const style = document.getElementById('custom-force-dark-mode');
    if (style) style.remove();
};

// Execute immediately on script load
injectDarkMode();

// Keep scanning the DOM tree for dynamically injected layouts
const observer = new MutationObserver(() => {
    injectDarkMode();
});
observer.observe(document.documentElement, { childList: true, subtree: true });
