/**
 * Utility for sharing achievements on social networks
 */

/**
 * Generate an attractive image for social sharing with achievements
 * @param {Object} options - Image options
 * @param {string} options.levelName - Level name
 * @param {string} options.levelIcon - Level emoji icon
 * @param {string} options.levelColor - Level color
 * @param {Array} options.badges - Array of badges {icon, name}
 * @param {number} options.totalPoints - Total points
 * @param {number} options.rank - Ranking position
 * @param {number} options.totalDistance - Total distance swam in meters
 * @returns {Promise<Blob>} - Returns image as blob
 */
export async function generateAchievementImage({
	levelName,
	levelIcon,
	levelColor = '#4285F4',
	badges = [],
	totalPoints,
	rank,
	totalDistance
}) {
	const canvas = document.createElement('canvas');
	const ctx = canvas.getContext('2d');

	// Tamaño optimizado para Instagram Posts verticales (4:5)
	canvas.width = 1080;
	canvas.height = 1350;

	// Fondo con gradiente vibrante y moderno
	const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
	const color1 = levelColor || '#4285F4';
	const color2 = adjustBrightness(color1, -40);
	const color3 = adjustBrightness(color1, 30);
	
	gradient.addColorStop(0, color1);
	gradient.addColorStop(0.5, color2);
	gradient.addColorStop(1, color3);
	ctx.fillStyle = gradient;
	ctx.fillRect(0, 0, canvas.width, canvas.height);

	// Patrón geométrico moderno de fondo
	ctx.globalAlpha = 0.06;
	ctx.strokeStyle = '#ffffff';
	ctx.lineWidth = 3;
	for (let i = 0; i < 15; i++) {
		const x = Math.random() * canvas.width;
		const y = Math.random() * canvas.height;
		const size = Math.random() * 200 + 100;
		ctx.strokeRect(x - size / 2, y - size / 2, size, size);
		ctx.beginPath();
		ctx.arc(x, y, size / 2, 0, Math.PI * 2);
		ctx.stroke();
	}
	ctx.globalAlpha = 1;

	// Contenedor blanco central
	const boxPadding = 60;
	const boxTop = 80;
	const boxHeight = canvas.height - boxTop - 80;
	
	// Sombra del contenedor
	ctx.shadowColor = 'rgba(0, 0, 0, 0.25)';
	ctx.shadowBlur = 50;
	ctx.shadowOffsetY = 20;
	
	ctx.fillStyle = '#ffffff';
	roundRect(ctx, boxPadding, boxTop, canvas.width - boxPadding * 2, boxHeight, 40);
	ctx.fill();
	
	ctx.shadowColor = 'transparent';
	ctx.shadowBlur = 0;
	ctx.shadowOffsetY = 0;

	// Barra superior decorativa con el color del nivel
	const headerGradient = ctx.createLinearGradient(boxPadding, boxTop, canvas.width - boxPadding, boxTop);
	headerGradient.addColorStop(0, color1);
	headerGradient.addColorStop(0.5, adjustBrightness(color1, 20));
	headerGradient.addColorStop(1, color1);
	ctx.fillStyle = headerGradient;
	roundRect(ctx, boxPadding, boxTop, canvas.width - boxPadding * 2, 12, 40, true);
	ctx.fill();

	let yPosition = boxTop + 60;

	// Logo del club dentro del contenedor
	try {
		const logo = await loadImage('/logo_192.png');
		const logoSize = 160;
		const logoX = (canvas.width - logoSize) / 2;
		
		ctx.drawImage(logo, logoX, yPosition, logoSize, logoSize);
		yPosition += logoSize + 25;
	} catch (err) {
		console.log('Logo no disponible');
		yPosition += 30;
	}

	// Nombre del club debajo del logo
	ctx.fillStyle = '#2c3e50';
	ctx.font = 'bold 48px Arial, sans-serif';
	ctx.textAlign = 'center';
	ctx.fillText('AQUADN', canvas.width / 2, yPosition);
	yPosition += 35;
	
	// Subtítulo del club
	ctx.fillStyle = '#7f8c8d';
	ctx.font = '32px Arial, sans-serif';
	ctx.fillText('Club de Natación', canvas.width / 2, yPosition);
	yPosition += 60;

	// Línea separadora elegante
	ctx.strokeStyle = '#e0e0e0';
	ctx.lineWidth = 2;
	ctx.beginPath();
	ctx.moveTo(canvas.width / 2 - 250, yPosition);
	ctx.lineTo(canvas.width / 2 + 250, yPosition);
	ctx.stroke();
	yPosition += 55;

	// Título "¡Nuevo Logro!" más destacado
	ctx.fillStyle = color1;
	ctx.font = 'bold 62px Arial, sans-serif';
	ctx.fillText('¡NUEVO LOGRO!', canvas.width / 2, yPosition);
	yPosition += 70;

	// Emoji del nivel con efecto visual
	if (levelName && levelIcon) {
		// Círculo de fondo para el emoji
		const circleGradient = ctx.createRadialGradient(
			canvas.width / 2, yPosition + 40, 0,
			canvas.width / 2, yPosition + 40, 85
		);
		circleGradient.addColorStop(0, color1 + '20');
		circleGradient.addColorStop(1, color1 + '05');
		ctx.fillStyle = circleGradient;
		ctx.beginPath();
		ctx.arc(canvas.width / 2, yPosition + 40, 85, 0, Math.PI * 2);
		ctx.fill();
		
		// Emoji grande
		ctx.font = '110px Arial, sans-serif';
		ctx.fillText(levelIcon, canvas.width / 2, yPosition + 80);
		yPosition += 140;

		// Nombre del nivel con diseño destacado
		// Fondo para el nombre
		ctx.font = 'bold 64px Arial, sans-serif';
		const nameWidth = ctx.measureText(levelName).width + 60;
		ctx.fillStyle = color1 + '15';
		roundRect(ctx, canvas.width / 2 - nameWidth / 2, yPosition - 48, nameWidth, 72, 15);
		ctx.fill();
		
		ctx.fillStyle = color1;
		ctx.fillText(levelName, canvas.width / 2, yPosition);
		yPosition += 75;
	}

	// Sección de estadísticas con tarjetas
	const cardWidth = 440;
	const cardHeight = 120;
	const cardGap = 25;

	// Tarjeta de Puntos
	if (totalPoints) {
		const cardX = canvas.width / 2 - cardWidth / 2;
		
		// Sombra de la tarjeta
		ctx.shadowColor = 'rgba(0, 0, 0, 0.1)';
		ctx.shadowBlur = 20;
		ctx.shadowOffsetY = 10;
		
		// Fondo de la tarjeta
		const cardGradient = ctx.createLinearGradient(cardX, yPosition, cardX + cardWidth, yPosition);
		cardGradient.addColorStop(0, '#f8f9fa');
		cardGradient.addColorStop(1, '#ffffff');
		ctx.fillStyle = cardGradient;
		roundRect(ctx, cardX, yPosition, cardWidth, cardHeight, 20);
		ctx.fill();
		
		// Borde de color
		ctx.strokeStyle = color1;
		ctx.lineWidth = 3;
		ctx.stroke();
		
		ctx.shadowColor = 'transparent';
		ctx.shadowBlur = 0;
		ctx.shadowOffsetY = 0;
		
		// Contenido centrado
		const pointsText = new Intl.NumberFormat('es-ES').format(totalPoints);
		const centerX = cardX + cardWidth / 2;
		
		// Emoji de puntos
		ctx.fillStyle = '#2c3e50';
		ctx.font = '54px Arial, sans-serif';
		ctx.textAlign = 'center';
		ctx.textBaseline = 'middle';
		ctx.fillText('💪', centerX - 110, yPosition + cardHeight / 2);
		
		// Texto
		ctx.fillStyle = '#2c3e50';
		ctx.font = 'bold 52px Arial, sans-serif';
		ctx.textAlign = 'center';
		ctx.textBaseline = 'middle';
		ctx.fillText(pointsText, centerX + 30, yPosition + cardHeight / 2 - 15);
		ctx.font = '30px Arial, sans-serif';
		ctx.fillStyle = '#7f8c8d';
		ctx.fillText('Puntos', centerX + 30, yPosition + cardHeight / 2 + 20);
		
		yPosition += cardHeight + cardGap;
	}

	// Tarjeta de Distancia Total
	if (totalDistance !== undefined && totalDistance !== null) {
		const cardX = canvas.width / 2 - cardWidth / 2;
		const distanceKm = (totalDistance / 1000).toFixed(1);
		
		// Sombra de la tarjeta
		ctx.shadowColor = 'rgba(0, 0, 0, 0.1)';
		ctx.shadowBlur = 20;
		ctx.shadowOffsetY = 10;
		
		// Fondo de la tarjeta
		const cardGradient = ctx.createLinearGradient(cardX, yPosition, cardX + cardWidth, yPosition);
		cardGradient.addColorStop(0, '#f8f9fa');
		cardGradient.addColorStop(1, '#ffffff');
		ctx.fillStyle = cardGradient;
		roundRect(ctx, cardX, yPosition, cardWidth, cardHeight, 20);
		ctx.fill();
		
		// Borde de color
		ctx.strokeStyle = color1;
		ctx.lineWidth = 3;
		ctx.stroke();
		
		ctx.shadowColor = 'transparent';
		ctx.shadowBlur = 0;
		ctx.shadowOffsetY = 0;
		
		// Contenido centrado
		const centerX = cardX + cardWidth / 2;
		
		// Emoji de natación
		ctx.fillStyle = '#2c3e50';
		ctx.font = '54px Arial, sans-serif';
		ctx.textAlign = 'center';
		ctx.textBaseline = 'middle';
		ctx.fillText('🏊', centerX - 110, yPosition + cardHeight / 2);
		
		// Texto
		ctx.fillStyle = '#2c3e50';
		ctx.font = 'bold 52px Arial, sans-serif';
		ctx.textAlign = 'center';
		ctx.textBaseline = 'middle';
		ctx.fillText(distanceKm + 'k', centerX + 30, yPosition + cardHeight / 2 - 15);
		ctx.font = '30px Arial, sans-serif';
		ctx.fillStyle = '#7f8c8d';
		ctx.fillText('Metros Nadados', centerX + 30, yPosition + cardHeight / 2 + 20);
		
		yPosition += cardHeight + cardGap;
	}

	// Tarjeta de Ranking
	if (rank) {
		const cardX = canvas.width / 2 - cardWidth / 2;
		const medal = rank <= 3 ? ['🥇', '🥈', '🥉'][rank - 1] : '🏅';
		
		// Sombra de la tarjeta
		ctx.shadowColor = 'rgba(0, 0, 0, 0.1)';
		ctx.shadowBlur = 20;
		ctx.shadowOffsetY = 10;
		
		// Fondo de la tarjeta
		const cardGradient = ctx.createLinearGradient(cardX, yPosition, cardX + cardWidth, yPosition);
		cardGradient.addColorStop(0, '#f8f9fa');
		cardGradient.addColorStop(1, '#ffffff');
		ctx.fillStyle = cardGradient;
		roundRect(ctx, cardX, yPosition, cardWidth, cardHeight, 20);
		ctx.fill();
		
		// Borde de color
		ctx.strokeStyle = color1;
		ctx.lineWidth = 3;
		ctx.stroke();
		
		ctx.shadowColor = 'transparent';
		ctx.shadowBlur = 0;
		ctx.shadowOffsetY = 0;
		
		// Contenido centrado
		const centerX = cardX + cardWidth / 2;
		const rankText = 'Posición #' + rank;
		
		// Medir el ancho del texto para centrar todo el conjunto
		ctx.font = 'bold 52px Arial, sans-serif';
		const textWidth = ctx.measureText(rankText).width;
		const emojiWidth = 54; // Aproximado para el emoji
		const spacing = 30; // Espacio entre emoji y texto
		const totalWidth = emojiWidth + spacing + textWidth;
		
		// Calcular posición inicial para centrar todo
		const startX = centerX - totalWidth / 2;
		
		// Emoji de medalla
		ctx.fillStyle = '#2c3e50';
		ctx.font = '54px Arial, sans-serif';
		ctx.textAlign = 'center';
		ctx.textBaseline = 'middle';
		ctx.fillText(medal, startX + emojiWidth / 2, yPosition + cardHeight / 2);
		
		// Texto
		ctx.fillStyle = '#2c3e50';
		ctx.font = 'bold 52px Arial, sans-serif';
		ctx.textAlign = 'left';
		ctx.textBaseline = 'middle';
		ctx.fillText(rankText, startX + emojiWidth + spacing, yPosition + cardHeight / 2);
		
		yPosition += cardHeight + cardGap;
	}

	// Insignias con diseño mejorado
	if (badges && badges.length > 0) {
		yPosition += 20;
		
		// Título de insignias
		ctx.fillStyle = '#2c3e50';
		ctx.font = 'bold 35px Arial, sans-serif';
		ctx.textAlign = 'center';
		ctx.fillText('🏆 Insignias Desbloqueadas', canvas.width / 2, yPosition);
		yPosition += 60;

		const badgesToShow = badges.slice(0, 3); // Máximo 3 para que quepan con nombres
		const badgeSize = 80;
		const badgeSpacing = 80;
		const totalBadgeWidth = badgesToShow.length * (badgeSize + badgeSpacing) - badgeSpacing;
		let badgeX = (canvas.width - totalBadgeWidth) / 2;

		badgesToShow.forEach((badge) => {
			// Sombra para el badge
			ctx.shadowColor = 'rgba(0, 0, 0, 0.15)';
			ctx.shadowBlur = 15;
			ctx.shadowOffsetY = 8;
			
			// Fondo circular con gradiente
			const badgeGradient = ctx.createRadialGradient(
				badgeX + badgeSize / 2, yPosition + badgeSize / 2, 0,
				badgeX + badgeSize / 2, yPosition + badgeSize / 2, badgeSize / 2 + 8
			);
			badgeGradient.addColorStop(0, '#ffffff');
			badgeGradient.addColorStop(1, '#f0f0f0');
			ctx.fillStyle = badgeGradient;
			
			ctx.beginPath();
			ctx.arc(badgeX + badgeSize / 2, yPosition + badgeSize / 2, badgeSize / 2 + 8, 0, Math.PI * 2);
			ctx.fill();
			
			// Borde dorado
			ctx.strokeStyle = '#FFD700';
			ctx.lineWidth = 4;
			ctx.stroke();
			
			ctx.shadowColor = 'transparent';
			ctx.shadowBlur = 0;
			ctx.shadowOffsetY = 0;

			// Emoji del badge
			ctx.fillStyle = '#2c3e50';
			ctx.font = '56px Arial, sans-serif';
			ctx.textAlign = 'center';
			ctx.textBaseline = 'middle';
			ctx.fillText(badge.icon, badgeX + badgeSize / 2, yPosition + badgeSize / 2);
			
			// Nombre de la insignia
			ctx.fillStyle = '#2c3e50';
			ctx.font = 'bold 24px Arial, sans-serif';
			ctx.textAlign = 'center';
			ctx.textBaseline = 'top';
			
			// Dividir el nombre si es muy largo
			const maxWidth = badgeSize + 60;
			const words = badge.name.split(' ');
			let line = '';
			let lineY = yPosition + badgeSize + 20;
			
			words.forEach((word, index) => {
				const testLine = line + word + ' ';
				const metrics = ctx.measureText(testLine);
				
				if (metrics.width > maxWidth && line !== '') {
					ctx.fillText(line.trim(), badgeX + badgeSize / 2, lineY);
					line = word + ' ';
					lineY += 28;
				} else {
					line = testLine;
				}
				
				if (index === words.length - 1) {
					ctx.fillText(line.trim(), badgeX + badgeSize / 2, lineY);
				}
			});
			
			// Grado/Medalla debajo del nombre (si existe)
			if (badge.grade) {
				const gradeEmoji = badge.grade === 'oro' ? '🥇' : badge.grade === 'plata' ? '🥈' : '🥉';
				const gradeName = badge.grade.charAt(0).toUpperCase() + badge.grade.slice(1);
				
				ctx.fillStyle = '#7f8c8d';
				ctx.font = 'bold 20px Arial, sans-serif';
				ctx.textAlign = 'center';
				ctx.textBaseline = 'top';
				ctx.fillText(gradeEmoji + ' ' + gradeName, badgeX + badgeSize / 2, lineY + 30);
			}
			
			badgeX += badgeSize + badgeSpacing;
		});

		yPosition += badgeSize + 120; // Espacio para círculo + nombres + grado

		if (badges.length > 3) {
			ctx.fillStyle = '#95a5a6';
			ctx.font = 'bold 28px Arial, sans-serif';
			ctx.textAlign = 'center';
			ctx.fillText('+ ' + (badges.length - 3) + ' insignias más', canvas.width / 2, yPosition);
			yPosition += 40;
		}
	}

	// Footer moderno (calculado para estar dentro del contenedor)
	const footerY = boxTop + boxHeight - 50;
	ctx.fillStyle = color1;
	ctx.font = 'bold 34px Arial, sans-serif';
	ctx.textAlign = 'center';
	ctx.fillText('🏊 Sigue Nadando, Sigue Creciendo', canvas.width / 2, footerY);

	// Convertir canvas a blob
	return new Promise((resolve) => {
		canvas.toBlob((blob) => {
			resolve(blob);
		}, 'image/png', 1.0);
	});
}

import { trackShare } from './AnalyticsService.js';

/**
 * Share achievement with image using the Web Share API
 * @param {Object} options - Share options
 * @param {string} options.title - Title of the share
 * @param {string} options.text - Text content to share
 * @param {Blob} options.image - Image blob to share
 * @returns {Promise<boolean>} - Returns true if shared successfully
 */
export async function shareAchievement({ title, text, image, source = 'Celebration Popup' }) {
	const shareData = {
		title: title || 'Mi progreso en AQUADN',
		text: text || 'Mira mis logros en natación!'
	};

	// If image is provided, add it as a file
	if (image) {
		const file = new File([image], 'logro-aquadn.png', { type: 'image/png' });
		shareData.files = [file];
	}

	// Try native Web Share API first
	if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
		try {
			trackShare('Web Share API', source);
			await navigator.share(shareData);
			return true;
		} catch (err) {
			// User cancelled or share failed
			if (err.name !== 'AbortError') {
				console.error('Error sharing:', err);
			}
			return false;
		}
	}

	// Fallback: download image if sharing not supported
	if (image) {
		trackShare('Download Fallback', source);
		const url = URL.createObjectURL(image);
		const a = document.createElement('a');
		a.href = url;
		a.download = 'logro-aquadn.png';
		a.click();
		URL.revokeObjectURL(url);
		return true;
	}

	return false;
}

/**
 * Helper function to draw rounded rectangles
 */
function roundRect(ctx, x, y, width, height, radius, topOnly = false) {
	ctx.beginPath();
	ctx.moveTo(x + radius, y);
	ctx.lineTo(x + width - radius, y);
	ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
	
	if (topOnly) {
		ctx.lineTo(x + width, y + height);
		ctx.lineTo(x, y + height);
		ctx.lineTo(x, y + radius);
	} else {
		ctx.lineTo(x + width, y + height - radius);
		ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
		ctx.lineTo(x + radius, y + height);
		ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
		ctx.lineTo(x, y + radius);
	}
	
	ctx.quadraticCurveTo(x, y, x + radius, y);
	ctx.closePath();
}

/**
 * Helper function to adjust brightness of hex color
 */
function adjustBrightness(hex, percent) {
	// Convert hex to RGB
	const num = parseInt(hex.replace('#', ''), 16);
	const r = Math.max(0, Math.min(255, (num >> 16) + percent));
	const g = Math.max(0, Math.min(255, ((num >> 8) & 0x00ff) + percent));
	const b = Math.max(0, Math.min(255, (num & 0x0000ff) + percent));
	return '#' + ((r << 16) | (g << 8) | b).toString(16).padStart(6, '0');
}

/**
 * Helper function to load an image
 */
function loadImage(src) {
	return new Promise((resolve, reject) => {
		const img = new Image();
		img.onload = () => resolve(img);
		img.onerror = reject;
		img.src = src;
	});
}

/**
 * Generate share text for achievements
 * @param {Object} options - Achievement data
 * @returns {string} - Formatted share text
 */
export function generateAchievementText({ levelName, levelIcon, badges, totalPoints, rank }) {
	let text = '';

	if (levelName && levelIcon) {
		text += `🎯 ¡Alcancé el nivel ${levelIcon} ${levelName}!\n\n`;
	}

	if (badges && badges.length > 0) {
		text += '🏆 Nuevas insignias:\n';
		badges.forEach((badge) => {
			text += `${badge.icon} ${badge.name}\n`;
		});
		text += '\n';
	}

	if (totalPoints) {
		text += `💪 ${totalPoints} puntos acumulados\n`;
	}

	if (rank) {
		text += `🏅 Posición #${rank} en el ranking\n`;
	}

	text += '\n#AQUADN #Natación #Logros';

	return text;
}

/**
 * Get social network sharing URLs
 * @param {string} text - Text to share
 * @param {string} url - URL to share
 * @returns {Object} - Object with URLs for different social networks
 */
export function getSocialShareLinks(text, url) {
	const encodedText = encodeURIComponent(text);
	const encodedUrl = encodeURIComponent(url || window.location.href);

	return {
		twitter: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`,
		facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedText}`,
		whatsapp: `https://wa.me/?text=${encodedText}%20${encodedUrl}`,
		telegram: `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`,
		linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`
	};
}

/**
 * Copy text to clipboard
 * @param {string} text - Text to copy
 * @returns {Promise<boolean>} - Returns true if copied successfully
 */
export async function copyToClipboard(text) {
	try {
		if (navigator.clipboard && navigator.clipboard.writeText) {
			await navigator.clipboard.writeText(text);
			return true;
		} else {
			// Fallback for older browsers
			const textArea = document.createElement('textarea');
			textArea.value = text;
			textArea.style.position = 'fixed';
			textArea.style.left = '-999999px';
			document.body.appendChild(textArea);
			textArea.focus();
			textArea.select();
			try {
				document.execCommand('copy');
				document.body.removeChild(textArea);
				return true;
			} catch (err) {
				document.body.removeChild(textArea);
				return false;
			}
		}
	} catch (err) {
		console.error('Failed to copy:', err);
		return false;
	}
}
