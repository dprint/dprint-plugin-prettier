// @nts-check
//#region src/factories/root.ts
function createRoot(position, /** @type {any[] | undefined} */ children, /** @type {any[] | undefined} */ comments) {
	return {
		type: "root",
		position,
		children,
		comments
	};
}
//#endregion
export { createRoot };
