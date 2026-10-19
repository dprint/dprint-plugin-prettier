//#region src/utils/create-updater.ts
function createUpdater(host, getter, setter, shouldUpdate) {
	let reduced = getter(host);
	return (value) => {
		if (shouldUpdate(reduced, value)) setter(host, reduced = value);
	};
}
//#endregion
export { createUpdater };
