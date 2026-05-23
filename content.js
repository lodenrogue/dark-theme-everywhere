const injectDarkMode = () => {
    chrome.storage.local.get({ darkModeElement: true }, (data) => {
	if (!data.darkModeElement) {
	    removeDarkMode();
	    return;
	}

	// 1. Check if the site already natively has a dark background 
	const bodyBgColor = window.getComputedStyle(document.documentElement || document.body).backgroundColor;
	
	// Parse the RGB values out of the background color string
	const rgb = bodyBgColor.match(/\d+/g);
	if (rgb && rgb.length >= 3) {
	    const r = parseInt(rgb[0]), g = parseInt(rgb[1]), b = parseInt(rgb[2]);
	    
	    // Calculate perceptual brightness (YIQ formula)
	    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
	    
	    // If the background is already dark (brightness under 100), exit immediately!
	    if (brightness < 100) {
		removeDarkMode();
		return;
	    }
	}

	// 2. Also check if the document already respects a native dark query
	if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
	    // If the site natively loaded dark mode via headers, exit immediately!
	    if (document.documentElement.getAttribute('data-theme') === 'dark' || 
		document.body?.getAttribute('data-theme') === 'dark') {
		removeDarkMode();
		return;
	    }
	}

	if (document.getElementById('custom-force-dark-mode')) return;

	// 3. If it's confirmed a light website, safely apply the smart inversion
	const style = document.createElement('style');
	style.id = 'custom-force-dark-mode';
	style.textContent = `
      html {
        filter: invert(1) hue-rotate(180deg) !important;
        background-color: #fff !important;
      }
      img, video, canvas, svg, [style*="background-image"], .video-stream {
        filter: invert(1) hue-rotate(180deg) !important;
      }
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

// Run checking loops
injectDarkMode();

const observer = new MutationObserver(() => {
    injectDarkMode();
});
observer.observe(document.documentElement, { childList: true, subtree: true });
