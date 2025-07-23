import { extendTheme } from "@chakra-ui/react";

const config = {
	initialColorMode: "dark",
	useSystemColorMode: false,
};

const colors = {
	brand: {
		50: "#e6fff8",
		100: "#bff7e6",
		500: "#00bfa5",
		700: "#008f72",
	},
};

const styles = {
	global: {
		body: {
			bg: "#0b1220", // deep charcoal
			color: "whiteAlpha.900",
			lineHeight: "1.6",
			WebkitFontSmoothing: "antialiased",
			MozOsxFontSmoothing: "grayscale",
		},
		a: {
			color: "brand.100",
		},
	},
};

const fonts = {
	heading: "Work Sans, system-ui, sans-serif",
	body: "Work Sans, system-ui, sans-serif",
};

const theme = extendTheme({ config, colors, styles, fonts });

export default theme;